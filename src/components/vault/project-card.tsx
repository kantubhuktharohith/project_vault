import { useRef } from "react";
import { ExternalLink, Github, Pencil, Sparkles, Trash2, User } from "lucide-react";
import { PROJECT_CATEGORIES, type Project, type ProjectCategory } from "@/lib/projects";

type Props = {
  project: Project;
  index: number;
  isAdmin?: boolean;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
};

function faviconUrl(url: string) {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  } catch {
    return null;
  }
}

/** front-page screenshot of the live site, used when no thumbnail is set */
function screenshotUrl(url: string, width = 1024) {
  try {
    const clean = new URL(url).toString();
    return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(clean)}?w=${width}&h=${Math.round(
      (width * 9) / 16,
    )}`;
  } catch {
    return null;
  }
}

function categoryBadge(category: ProjectCategory) {
  if (category === "ai") {
    return {
      icon: Sparkles,
      className:
        "border-ai/40 text-ai bg-ai/10 shadow-[0_0_12px_-3px_var(--ai)]",
    };
  }
  return {
    icon: User,
    className: "border-own/30 text-own bg-own/10",
  };
}

function CategoryBadge({ category }: { category: ProjectCategory }) {
  const { icon: Icon, className } = categoryBadge(category);
  const label = PROJECT_CATEGORIES.find((c) => c.value === category)?.label ?? category;
  return (
    <span
      className={`mt-1 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] tracking-widest uppercase ${className}`}
    >
      <Icon className="size-3" />
      {label}
    </span>
  );
}

export function ProjectCard({ project, index, isAdmin, onEdit, onDelete }: Props) {
  const target = project.liveUrl || project.githubUrl || "";
  const favicon = project.liveUrl ? faviconUrl(project.liveUrl) : null;
  const cover =
    project.imageUrl || (project.liveUrl ? screenshotUrl(project.liveUrl) : null) || null;

  const lastOpenedAt = useRef(0);

  function open() {
    if (!target) return;
    // guard against double-fire (click + keyboard, or bubbled duplicates)
    const now = Date.now();
    if (now - lastOpenedAt.current < 600) return;
    lastOpenedAt.current = now;
    window.open(target, "_blank", "noopener,noreferrer");
  }

  /** ignore events coming from interactive children (links, buttons) */
  function isInteractive(node: EventTarget | null) {
    return node instanceof Element && !!node.closest("a,button");
  }

  return (
    <article
      role={target ? "link" : undefined}
      tabIndex={target ? 0 : undefined}
      aria-label={target ? `Open ${project.title}` : undefined}
      onClick={(event) => {
        if (isInteractive(event.target)) return;
        open();
      }}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      }}
      className={`glow-border animate-rise group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card outline-none focus-visible:border-foreground/25 ${
        target ? "cursor-pointer" : ""
      }`}
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      {/* hover preview tooltip */}
      {project.description ? (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
          <div className="overflow-hidden rounded-lg border border-border bg-background/95 p-3 shadow-xl backdrop-blur-sm">
            <p className="text-[10px] tracking-widest text-muted-foreground uppercase">preview</p>
            <p className="mt-1 line-clamp-4 text-xs leading-relaxed text-foreground/80">
              {project.description}
            </p>
          </div>
        </div>
      ) : null}

      {cover ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border bg-muted">
          <img
            src={cover}
            alt={`${project.title} website front page`}
            loading="lazy"
            width={1024}
            height={576}
            className="size-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-foreground break-all">
              {project.title}
            </h2>
            <CategoryBadge category={project.category} />
          </div>

          {isAdmin ? (
            <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(project);
                }}
                aria-label={`Edit ${project.title}`}
                className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(project);
                }}
                aria-label={`Delete ${project.title}`}
                className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ) : null}
        </div>

        {project.description ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            {favicon ? (
              <img
                src={favicon}
                alt=""
                aria-hidden="true"
                width={16}
                height={16}
                loading="lazy"
                className="mr-0.5 size-4 rounded-sm"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : null}
            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer noopener"
                onClick={(event) => event.stopPropagation()}
                aria-label={`Open live site for ${project.title}`}
                className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <ExternalLink className="size-4" />
              </a>
            ) : null}
            {project.githubUrl ? (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer noopener"
                onClick={(event) => event.stopPropagation()}
                aria-label={`Open GitHub repo for ${project.title}`}
                className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Github className="size-4" />
              </a>
            ) : null}
          </div>

          {project.tech.length > 0 ? (
            <ul className="flex flex-wrap items-center gap-2">
              {project.tech.map((tag) => (
                <li
                  key={tag}
                  className="rounded-md border border-border px-2 py-0.5 text-[10px] tracking-widest text-muted-foreground uppercase"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </article>
  );
}
