import thumbTerminal from "@/assets/thumb-terminal.jpg";
import thumbPipeline from "@/assets/thumb-pipeline.jpg";
import thumbVault from "@/assets/thumb-vault.jpg";

export type ProjectCategory = "ai" | "own";

export type Project = {
  id: string;
  title: string;
  description: string;
  liveUrl: string;
  githubUrl: string;
  imageUrl: string;
  tech: string[];
  category: ProjectCategory;
  createdAt: number;
};

export const PROJECT_CATEGORIES: { value: ProjectCategory; label: string }[] = [
  { value: "ai", label: "AI Projects" },
  { value: "own", label: "Hardcoded Projects" },
];

export const DEFAULT_CATEGORY: ProjectCategory = "own";

export const STORAGE_KEY = "project_vault.projects.v1";

export function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function parseTech(input: string): string[] {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function normalizeUrl(url: string): string {
  const value = url.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

export function isProjectCategory(value: unknown): value is ProjectCategory {
  return value === "ai" || value === "own";
}

export function sanitizeProject(raw: unknown): Project | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const title = typeof r.title === "string" ? r.title.trim() : "";
  if (!title) return null;
  return {
    id: typeof r.id === "string" && r.id ? r.id : createId(),
    title,
    description: typeof r.description === "string" ? r.description : "",
    liveUrl: typeof r.liveUrl === "string" ? r.liveUrl : "",
    githubUrl: typeof r.githubUrl === "string" ? r.githubUrl : "",
    imageUrl: typeof r.imageUrl === "string" ? r.imageUrl : "",
    tech: Array.isArray(r.tech) ? r.tech.filter((t): t is string => typeof t === "string") : [],
    category: isProjectCategory(r.category) ? r.category : DEFAULT_CATEGORY,
    createdAt: typeof r.createdAt === "number" ? r.createdAt : Date.now(),
  };
}

export const seedProjects: Project[] = [
  {
    id: "seed-terminal-portfolio",
    title: "terminal_portfolio",
    description:
      "Personal portfolio rendered as an interactive shell, with command history and themeable prompts.",
    liveUrl: "https://rohith-eosin.vercel.app",
    githubUrl: "https://github.com",
    imageUrl: thumbTerminal,
    tech: ["React", "TypeScript", "Tailwind"],
    category: "own",
    createdAt: Date.now() - 300000,
  },
  {
    id: "seed-data-pipeline",
    title: "stream_pipeline",
    description:
      "Kafka to warehouse ingestion pipeline with schema drift detection and replayable dead-letter queues.",
    liveUrl: "",
    githubUrl: "https://github.com",
    imageUrl: thumbPipeline,
    tech: ["Python", "Kafka", "Airflow"],
    category: "own",
    createdAt: Date.now() - 200000,
  },
  {
    id: "seed-vault",
    title: "project_vault",
    description: "This app. Offline-first bookmark vault for everything you have ever shipped.",
    liveUrl: "",
    githubUrl: "",
    imageUrl: thumbVault,
    tech: ["React", "localStorage"],
    category: "own",
    createdAt: Date.now() - 100000,
  },
];
