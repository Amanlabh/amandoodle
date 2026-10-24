"use client"

import { useEffect, useRef } from "react"

// ponytail: raw WebGL fullscreen shader, no three.js — swap to R3F only if the scene needs real 3D objects
const vert = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`

// Rays are bent around a Schwarzschild black hole (units: event horizon radius = 1),
// then hit either the accretion disk, the horizon, or the starfield behind.
const frag = `
precision highp float;
uniform vec2 res;
uniform float t;
uniform float g;

const float DISK_IN = 3.0;
const float DISK_OUT = 11.0;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}

float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

vec3 stars(vec3 d) {
  vec3 col = vec3(0.0);
  for (int i = 0; i < 3; i++) {
    float sc = 90.0 + float(i) * 80.0;
    vec3 p = d * sc;
    vec3 id = floor(p);
    vec3 f = fract(p) - 0.5;
    float h = hash(id + float(i) * 17.0);
    if (h > 0.96) {
      vec3 o = vec3(hash(id + 1.0), hash(id + 2.0), hash(id + 3.0)) - 0.5;
      float b = smoothstep(0.12, 0.0, length(f - o * 0.6)) * (h - 0.96) / 0.04;
      vec3 tint = mix(vec3(1.0, 0.78, 0.6), vec3(0.7, 0.8, 1.0), hash(id + 5.0));
      b *= 0.65 + 0.35 * sin(t * (1.0 + 3.0 * hash(id + 7.0)) + h * 80.0);
      col += tint * b * 2.5;
    }
  }
  // faint milky way band + nebula dust
  vec3 bandN = normalize(vec3(0.25, 1.0, 0.35));
  float bd = dot(d, bandN);
  float n = fbm(d * 4.0);
  col += vec3(0.55, 0.5, 0.7) * exp(-bd * bd * 14.0) * n * n * 0.45;
  col += vec3(0.05, 0.035, 0.07) * n;
  return col;
}

vec4 disk(vec3 p, float r, vec3 rd) {
  float x = (r - DISK_IN) / (DISK_OUT - DISK_IN);
  // Keplerian spin: inner gas orbits faster
  float rot = atan(p.z, p.x) + t * 0.9 * pow(DISK_IN / r, 1.5);
  vec2 q = vec2(cos(rot), sin(rot)) * r;
  float n = fbm(vec3(q * 0.9, r * 0.6));
  float rings = 0.65 + 0.35 * sin(r * 7.0 + n * 5.0);
  float profile = smoothstep(0.0, 0.06, x) * pow(1.0 - x, 1.5);
  float dens = clamp(profile * (0.3 + n) * rings * 1.5, 0.0, 1.0);

  // relativistic Doppler beaming: side spinning toward us is brighter and bluer
  vec3 v = normalize(vec3(-p.z, 0.0, p.x)) * sqrt(0.5 / r);
  float gamma = 1.0 / sqrt(1.0 - dot(v, v));
  float D = 1.0 / (gamma * (1.0 - dot(v, -rd)));

  float temp = pow(DISK_IN / r, 0.75) * D;
  vec3 c = mix(vec3(1.0, 0.28, 0.04), vec3(1.0, 0.78, 0.5), clamp(temp, 0.0, 1.0));
  c = mix(c, vec3(0.85, 0.9, 1.0), clamp(temp - 1.0, 0.0, 1.0));
  float I = pow(D, 3.0) * pow(DISK_IN / r, 1.4) * 2.5;
  return vec4(c * I, dens);
}

vec3 meteors(vec2 p) {
  vec3 col = vec3(0.0);
  float aspect = res.x / res.y;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float period = 4.0 + fi * 2.3;
    float tt = t + fi * 3.1;
    float seed = floor(tt / period);
    float life = 1.2;
    float ph = fract(tt / period) * period;
    if (ph > life) continue;
    float k = ph / life;
    float ang = -0.45 - hash(vec3(seed, fi, 3.0)) * 0.6;
    vec2 dir = vec2(cos(ang), sin(ang));
    if (hash(vec3(seed, fi, 4.0)) > 0.5) dir.x = -dir.x;
    vec2 start = vec2(hash(vec3(seed, fi, 1.0)) * aspect, 0.55 + hash(vec3(seed, fi, 2.0)) * 0.45);
    vec2 head = start + dir * k * 0.8;
    vec2 rel = p - head;
    float along = dot(rel, -dir);
    float across = length(rel + dir * along);
    float tail = clamp(1.0 - along / 0.3, 0.0, 1.0) * step(0.0, along);
    float line = smoothstep(0.0012 + 0.0015 * tail, 0.0, across) * tail * tail;
    float glow = smoothstep(0.007, 0.0, length(rel));
    col += vec3(0.85, 0.92, 1.0) * (line + glow) * sin(k * 3.14159) * 2.5;
  }
  return col;
}

// ponytail: rocket drawn in screen space around the hole's projected center (screen middle)
const float CYCLE = 16.0;
const float SHADOW = 0.17; // on-screen radius of the black hole shadow

vec2 rocketPath(float s) {
  // radius eases to a stop at the horizon: time dilation freezes it there
  float R = SHADOW + 1.15 * (1.0 - s) * (1.0 - s);
  float th = 0.4 + 0.9 / R;
  return vec2(cos(th), sin(th) * 0.75) * R;
}

vec4 rocket(vec2 uv, float s) {
  if (s >= 1.0) return vec4(0.0);
  vec2 P = rocketPath(s);
  vec2 fwd = normalize(rocketPath(s + 0.002) - P);
  vec2 rel = uv - P;
  vec2 lp = vec2(dot(rel, fwd), dot(rel, vec2(-fwd.y, fwd.x)));

  // spaghettification: stretched along the fall, squeezed sideways
  float stretch = 1.0 + 3.5 * smoothstep(0.45, 1.0, s);
  lp.x /= stretch;
  lp.y *= stretch;
  float sz = 0.028;
  vec2 q = lp / sz;
  float aa = 2.0 / (res.y * sz);

  vec4 c = vec4(0.0);
  float flick = 0.75 + 0.25 * sin(t * 40.0) * sin(t * 23.0);
  float flame = length(vec2((q.x + 0.95) / (0.7 * flick), q.y / 0.2)) - 1.0;
  if (q.x < -0.9) c = mix(c, vec4(mix(vec3(1.0, 0.85, 0.4), vec3(1.0, 0.3, 0.05), clamp(-(q.x + 0.95) / 0.7, 0.0, 1.0)), 1.0), smoothstep(aa, -aa, flame));
  float fin = max(max(abs(q.y) - (0.62 - (q.x + 1.0) * 0.55), q.x + 0.35), -1.0 - q.x);
  c = mix(c, vec4(0.85, 0.15, 0.12, 1.0), smoothstep(aa, -aa, fin));
  float body = length(q * vec2(1.0, 3.0)) - 1.0;
  float shade = 0.75 + 0.25 * smoothstep(-0.3, 0.3, q.y);
  c = mix(c, vec4(vec3(0.92, 0.93, 0.96) * shade, 1.0), smoothstep(aa * 3.0, -aa * 3.0, body));
  float win = length(q - vec2(0.3, 0.0)) - 0.12;
  c = mix(c, vec4(0.3, 0.8, 1.0, 1.0), smoothstep(aa, -aa, win));

  // exhaust trail
  for (int j = 1; j < 14; j++) {
    float fj = float(j);
    float d = length(uv - rocketPath(max(s - fj * 0.006, 0.0)));
    float puff = smoothstep(0.006, 0.0, d) * (1.0 - fj / 14.0) * 0.5;
    c.rgb += vec3(1.0, 0.6, 0.25) * puff;
    c.a = max(c.a, puff);
  }

  // gravitational redshift + fade as it freezes at the horizon
  c.rgb = mix(c.rgb, c.rgb * vec3(1.0, 0.2, 0.08), smoothstep(0.4, 0.95, s));
  c.a *= 1.0 - smoothstep(0.8, 1.0, s);
  return c;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * res) / res.y;
  float roll = -0.12;
  uv = mat2(cos(roll), -sin(roll), sin(roll), cos(roll)) * uv;

  // rocket falls in for 80% of the cycle, then its swallowing sends out a gravitational-wave ripple
  float k = fract(t / CYCLE);
  float s = k / 0.8;
  float rk = clamp((k - 0.8) / 0.2, 0.0, 1.0);
  float ripple = 0.0;
  if (k > 0.8) {
    float ring = SHADOW + rk * 1.6;
    ripple = exp(-pow((length(uv) - ring) / 0.08, 2.0)) * (1.0 - rk);
  }
  vec2 rayUv = uv + normalize(uv + 1e-5) * ripple * 0.06;

  // intro: camera falls in from far away
  float dist = mix(70.0, 24.0, g);
  vec3 ro = vec3(0.0, dist * 0.09, -dist);
  vec3 fw = normalize(-ro);
  vec3 rt = normalize(cross(vec3(0.0, 1.0, 0.0), fw));
  vec3 up = cross(fw, rt);
  vec3 vel = normalize(fw * 1.6 + rt * rayUv.x + up * rayUv.y);
  vec3 pos = ro;

  vec3 hv = cross(pos, vel);
  float h2 = dot(hv, hv);
  vec3 col = vec3(0.0);
  float trans = 1.0;

  for (int i = 0; i < 160; i++) {
    float r = length(pos);
    float dt = clamp(0.12 * r, 0.05, 2.0);
    vel += -1.5 * h2 * pos / pow(r, 5.0) * dt;
    vec3 np = pos + vel * dt;
    if (pos.y * np.y < 0.0) {
      vec3 hit = mix(pos, np, pos.y / (pos.y - np.y));
      float hr = length(hit);
      if (hr > DISK_IN && hr < DISK_OUT) {
        vec4 dc = disk(hit, hr, normalize(vel));
        col += dc.rgb * dc.a * trans;
        trans *= 1.0 - dc.a;
      }
    }
    pos = np;
    if (dot(pos, pos) < 1.0) { trans = 0.0; break; }
    if (trans < 0.01) break;
    if (r > dist + 10.0 && dot(pos, vel) > 0.0) break;
  }

  col += trans * stars(normalize(vel));
  col += meteors(gl_FragCoord.xy / res.y);

  // swallow flash
  if (k > 0.8) col *= 1.0 + 2.5 * exp(-rk * 8.0) + ripple * 1.5;
  col = 1.0 - exp(-col * 1.1);
  vec2 sv = gl_FragCoord.xy / res - 0.5;
  col *= 1.0 - dot(sv, sv) * 0.9;
  // dimmed so foreground text stays readable
  col *= 0.6 * sqrt(g);
  vec4 rc = rocket(uv, s);
  col = mix(col, rc.rgb * 0.9, rc.a * g);
  gl_FragColor = vec4(col, 1.0);
}
`

export function BlackHole() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const gl = canvas?.getContext("webgl")
    if (!canvas || !gl) return

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, "a")
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(prog, "res")
    const uT = gl.getUniformLocation(prog, "t")
    const uG = gl.getUniformLocation(prog, "g")

    const resize = () => {
      // ponytail: ray-marched at reduced resolution, CSS upscales; raise scale if GPUs allow
      const scale = Math.min(window.devicePixelRatio, 1.5) * (innerWidth < 768 ? 0.5 : 0.75)
      canvas.width = innerWidth * scale
      canvas.height = innerHeight * scale
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uRes, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener("resize", resize)

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    // when the rocket is swallowed, the ripple ring sweeps the page and shoves each block outward as it passes
    const shockwave = () => {
      const blocks = document.querySelectorAll<HTMLElement>("[data-warp] > *")
      blocks.forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.bottom < 0 || r.top > innerHeight) return
        const dx = r.left + r.width / 2 - innerWidth / 2
        const dy = r.top + r.height / 2 - innerHeight / 2
        const d = Math.hypot(dx, dy) || 1
        const ux = dx / d
        const uy = dy / d
        // ring speed matches the shader: SHADOW + 1.6 screen-heights over 20% of a 16s cycle
        const delay = Math.max(d / innerHeight - 0.17, 0) / 0.5 * 1000
        el.animate(
          [
            { transform: "none", filter: "none" },
            { transform: `translate(${ux * 14}px, ${uy * 14}px) scale(1.02) skew(${ux * 1.5}deg)`, filter: "blur(1px) brightness(1.4)", offset: 0.25 },
            { transform: `translate(${-ux * 5}px, ${-uy * 5}px) scale(0.99)`, filter: "none", offset: 0.55 },
            { transform: `translate(${ux * 2}px, ${uy * 2}px)`, offset: 0.8 },
            { transform: "none", filter: "none" },
          ],
          { duration: 1100, delay, easing: "ease-out" },
        )
      })
    }

    let raf = 0
    let prevK = 0
    let start = -1
    const draw = (ms: number) => {
      if (start < 0) start = ms
      // zoom in toward the hole over 2.5s on load
      const k = reduced ? 1 : Math.min((ms - start) / 2500, 1)
      gl.uniform1f(uG, Math.max(1 - (1 - k) ** 3, 0.001))
      gl.uniform1f(uT, ms / 1000)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      const cycle = (ms / 1000 / 16) % 1
      if (!reduced && prevK < 0.8 && cycle >= 0.8) shockwave()
      prevK = cycle
      if (!reduced || k < 1) raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 h-full w-full" />
}
