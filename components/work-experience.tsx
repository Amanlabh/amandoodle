import { MapPin, ExternalLink } from "lucide-react"

interface WorkItem {
  title: string
  company: string
  companyUrl?: string
  location: string
  tags?: string[]
}

const workExperience: WorkItem[] = [
  {
    title: "Full Stack Developer",
    company: "Motojojo Pvt. Ltd.",
    companyUrl: "https://www.motojojo.co/",
    location: "Remote",
  },
  {
    title: "Frontend Developer",
    company: "WebcoinLabs",
    location: "Remote",
    tags: ["React"],
  },
  {
    title: "Gen-AI Engineer (Freelance)",
    company: "DU Desk",
    location: "Remote",
    tags: ["React", "Python", "Web Scraping", "SQL", "Scikit-learn"],
  },
]

export default function WorkExperience() {
  return (
    <div className="space-y-4">
      {workExperience.map((work, index) => (
        <div
          key={index}
          className="group rounded-lg border border-border bg-card/80 backdrop-blur-sm p-5 transition-all hover:border-foreground/20 hover:shadow-lg"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-foreground">{work.title}</h3>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin size={12} />
              {work.location}
            </span>
          </div>

          {work.companyUrl ? (
            <a
              href={work.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-700 mb-3"
            >
              {work.company}
              <ExternalLink size={12} />
            </a>
          ) : (
            <p className="text-sm text-cyan-600 mb-3">{work.company}</p>
          )}

          {work.tags && work.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {work.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-mono text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
