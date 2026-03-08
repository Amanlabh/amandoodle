"use client"

import { useEffect, useRef, useState } from "react"

type Obstacle = {
  id: number
  x: number
  width: number
  height: number
}

type Cloud = {
  id: number
  x: number
  y: number
  speed: number
}

const GAME_WIDTH = 640
const GAME_HEIGHT = 230
const GROUND_HEIGHT = 42
const PLAYER_SIZE = 42
const PLAYER_X = 72
const GRAVITY = -1850
const JUMP_VELOCITY = 710
const BASE_SPEED = 290

export function DoodleDinoGame() {
  const [isOpen, setIsOpen] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [playerY, setPlayerY] = useState(0)
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [clouds, setClouds] = useState<Cloud[]>([
    { id: 1, x: 140, y: 48, speed: 0.27 },
    { id: 2, x: 360, y: 74, speed: 0.22 },
    { id: 3, x: 560, y: 36, speed: 0.3 },
  ])

  const rafRef = useRef<number | null>(null)
  const velocityRef = useRef(0)
  const obstacleIdRef = useRef(0)
  const scoreRef = useRef(0)
  const spawnElapsedRef = useRef(0)
  const spawnGapRef = useRef(1000)

  const stopLoop = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  const resetGame = () => {
    velocityRef.current = 0
    obstacleIdRef.current = 0
    scoreRef.current = 0
    spawnElapsedRef.current = 0
    spawnGapRef.current = 1000 + Math.random() * 450

    setPlayerY(0)
    setScore(0)
    setObstacles([])
    setClouds([
      { id: 1, x: 140, y: 48, speed: 0.27 },
      { id: 2, x: 360, y: 74, speed: 0.22 },
      { id: 3, x: 560, y: 36, speed: 0.3 },
    ])
    setIsGameOver(false)
  }

  const startGame = () => {
    resetGame()
    setIsRunning(true)
  }

  const closeGame = () => {
    stopLoop()
    setIsRunning(false)
    setIsOpen(false)
  }

  const jump = () => {
    if (!isOpen) {
      return
    }

    if (isGameOver) {
      startGame()
      return
    }

    if (!isRunning) {
      startGame()
      return
    }

    if (playerY <= 1) {
      velocityRef.current = JUMP_VELOCITY
    }
  }

  useEffect(() => {
    if (!isRunning) {
      stopLoop()
      return
    }

    let lastTime = performance.now()

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.032)
      lastTime = now

      let collisionDetected = false
      const speed = BASE_SPEED + Math.min(scoreRef.current * 0.6, 160)

      setPlayerY((currentY) => {
        let vy = velocityRef.current + GRAVITY * dt
        let nextY = currentY + vy * dt

        if (nextY <= 0) {
          nextY = 0
          vy = 0
        }

        velocityRef.current = vy
        return nextY
      })

      spawnElapsedRef.current += dt * 1000
      setObstacles((current) => {
        const moved = current
          .map((obstacle) => ({ ...obstacle, x: obstacle.x - speed * dt }))
          .filter((obstacle) => obstacle.x + obstacle.width > -20)

        if (spawnElapsedRef.current >= spawnGapRef.current) {
          spawnElapsedRef.current = 0
          spawnGapRef.current = 850 + Math.random() * 700
          obstacleIdRef.current += 1
          moved.push({
            id: obstacleIdRef.current,
            x: GAME_WIDTH + 24,
            width: 18 + Math.floor(Math.random() * 16),
            height: 26 + Math.floor(Math.random() * 30),
          })
        }

        const playerBottom = GROUND_HEIGHT + playerY
        const playerTop = playerBottom + PLAYER_SIZE
        const playerLeft = PLAYER_X
        const playerRight = PLAYER_X + PLAYER_SIZE

        for (const obstacle of moved) {
          const obstacleLeft = obstacle.x
          const obstacleRight = obstacle.x + obstacle.width
          const obstacleBottom = GROUND_HEIGHT
          const obstacleTop = GROUND_HEIGHT + obstacle.height

          const overlapX = playerRight > obstacleLeft && playerLeft < obstacleRight
          const overlapY = playerTop > obstacleBottom && playerBottom < obstacleTop
          if (overlapX && overlapY) {
            collisionDetected = true
            break
          }
        }

        return moved
      })

      setClouds((current) =>
        current.map((cloud) => {
          const nextX = cloud.x - speed * cloud.speed * dt
          return {
            ...cloud,
            x: nextX < -120 ? GAME_WIDTH + 80 + Math.random() * 140 : nextX,
          }
        }),
      )

      scoreRef.current += dt * 10
      setScore(Math.floor(scoreRef.current))

      if (collisionDetected) {
        setIsRunning(false)
        setIsGameOver(true)
        setBestScore((prev) => Math.max(prev, Math.floor(scoreRef.current)))
        stopLoop()
        return
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => stopLoop()
  }, [isRunning, playerY])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault()
        jump()
      }
      if (event.code === "Escape") {
        closeGame()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isOpen, isRunning, isGameOver, playerY])

  useEffect(() => () => stopLoop(), [])

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true)
          setTimeout(() => {
            startGame()
          }, 120)
        }}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-card/85 p-2 shadow-lg ring-1 ring-border transition-transform hover:scale-105"
        aria-label="Open doodle dino game"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/doodle-mascot.png"
          alt="Play doodle dino game"
          width={84}
          height={84}
          className="h-16 w-16 object-contain md:h-20 md:w-20"
        />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-end bg-background/55 p-4 md:p-6">
          <div className="w-full max-w-[700px] rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-mono text-xs text-muted-foreground">
                Doodle Dino Mode | Space / Up / Tap to jump
              </p>
              <button
                type="button"
                onClick={closeGame}
                className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={jump}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  jump()
                }
              }}
              className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-background to-muted/50"
              style={{ width: "100%", height: GAME_HEIGHT }}
            >
              <div className="pointer-events-none absolute left-4 top-3 font-mono text-xs text-muted-foreground">
                Score: {score}
              </div>
              <div className="pointer-events-none absolute right-4 top-3 font-mono text-xs text-muted-foreground">
                Best: {bestScore}
              </div>

              {clouds.map((cloud) => (
                <div
                  key={cloud.id}
                  className="pointer-events-none absolute rounded-full bg-foreground/10"
                  style={{
                    left: cloud.x,
                    top: cloud.y,
                    width: 46,
                    height: 18,
                    filter: "blur(0.2px)",
                  }}
                />
              ))}

              <div
                className="pointer-events-none absolute border-t border-dashed border-border/80"
                style={{ left: 0, right: 0, bottom: GROUND_HEIGHT, height: 1 }}
              />

              {obstacles.map((obstacle) => (
                <div
                  key={obstacle.id}
                  className="pointer-events-none absolute rounded-sm bg-foreground/85"
                  style={{
                    left: obstacle.x,
                    bottom: GROUND_HEIGHT,
                    width: obstacle.width,
                    height: obstacle.height,
                  }}
                />
              ))}

              <div
                className="pointer-events-none absolute transition-transform"
                style={{
                  left: PLAYER_X,
                  bottom: GROUND_HEIGHT + playerY,
                  width: PLAYER_SIZE,
                  height: PLAYER_SIZE,
                  transform: `rotate(${Math.min(Math.max(-velocityRef.current / 45, -8), 14)}deg)`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/doodle-mascot.png"
                  alt="Doodle runner"
                  width={PLAYER_SIZE}
                  height={PLAYER_SIZE}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[42px] bg-gradient-to-t from-muted/70 to-transparent" />

              {isGameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                  <div className="rounded-lg border border-border bg-card px-5 py-4 text-center">
                    <p className="font-mono text-sm text-foreground">Game Over</p>
                    <p className="mt-1 text-xs text-muted-foreground">Tap or press Space to restart</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
