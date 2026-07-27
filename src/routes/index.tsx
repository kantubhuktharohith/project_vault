import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, LogIn, LogOut, Plus, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { ProjectCard } from "@/components/vault/project-card";
import { ProjectFormModal } from "@/components/vault/project-form-modal";
import { VaultFooter } from "@/components/vault/vault-footer";
import { useProjects } from "@/hooks/use-projects";
import {
  PROJECT_CATEGORIES,
  sanitizeProject,
  type Project,
  type ProjectCategory,
} from "@/lib/projects";

const title = "project_vault — Personal Project Links Manager";
const description =
  "A retro terminal-styled vault for all your project links. Add, search, edit and export your live sites and repos.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VaultPage,
});

function VaultPage() {
  const { projects, loaded, error, addProject, updateProject, deleteProject, replaceAll } =
    useProjects();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ProjectCategory | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);
  const [user, setUser] = useState<{ email?: string } | null>({ email: "local@vault" });
  const [checkingUser, setCheckingUser] = useState(false);
  const isOwner = true;
  const searchRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesCategory = category === "all" || p.category === category;
      const matchesSearch =
        !q ||
        [p.title, p.description, p.tech.join(" ")].join(" ").toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [projects, query, category]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        openCreate();
        return;
      }
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        openCreate();
      } else if (event.key === "/") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function openCreate() {
    if (!isOwner) {
      toast.info("Sign in to add projects");
      return;
    }
    setEditing(null);
    setModalOpen(true);
  }

  function handleSubmit(data: Omit<Project, "id" | "createdAt">) {
    if (!isOwner) {
      toast.info("Sign in to manage projects");
      return;
    }
    if (editing) {
      updateProject(editing.id, data);
      toast.success(`updated ${data.title}`);
    } else {
      addProject(data);
      toast.success(`added ${data.title}`);
    }
    setEditing(null);
  }

  async function handleSignOut() {
    toast.success("local vault active");
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(projects, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "project-vault.json";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("exported project-vault.json");
  }

  async function handleImport(file: File) {
    try {
      const parsed = JSON.parse(await file.text());
      const list = Array.isArray(parsed)
        ? parsed.map(sanitizeProject).filter((p): p is Project => p !== null)
        : [];
      if (list.length === 0) {
        toast.error("no valid projects found in file");
        return;
      }
      replaceAll(list);
      toast.success(`imported ${list.length} project${list.length === 1 ? "" : "s"}`);
    } catch {
      toast.error("could not parse that file");
    }
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-5xl px-5">
        <header className="pt-12">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-primary text-glow sm:text-3xl">
                &gt; project_vault /<span className="animate-blink ml-1">_</span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Every project link in one place. Public for friends to view, sign in to manage.
              </p>
            </div>
            <div className="shrink-0">
              {checkingUser ? null : isOwner ? (
                <div className="flex items-center gap-2">
                  <span className="hidden text-xs text-muted-foreground sm:inline">{user?.email}</span>
                  <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-1.5">
                    <LogOut className="size-4" /> sign out
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" asChild className="gap-1.5">
                  <Link to="/auth">
                    <LogIn className="size-4" /> sign in
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              variant={category === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory("all")}
            >
              all
            </Button>
            {PROJECT_CATEGORIES.map((c) => (
              <Button
                key={c.value}
                variant={category === c.value ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(c.value)}
              >
                {c.label.toLowerCase()}
              </Button>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="search --projects"
                aria-label="Search projects"
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleExport} className="gap-2">
                <Download className="size-4" /> export
              </Button>
              {isOwner ? (
                <>
                  <Button variant="outline" onClick={() => fileRef.current?.click()} className="gap-2">
                    <Upload className="size-4" /> import
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleImport(file);
                      e.target.value = "";
                    }}
                  />
                </>
              ) : null}
            </div>
          </div>
        </header>

        <main className="mt-8">
          {!loaded ? (
            <div className="rounded-md border border-dashed border-border p-12 text-center">
              <p className="text-sm text-muted-foreground">$ loading vault...</p>
            </div>
          ) : error ? (
            <div className="rounded-md border border-destructive p-6 text-center">
              <p className="text-sm text-destructive">$ error: {error.message}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-12 text-center">
              <p className="text-sm text-muted-foreground">
                {projects.length === 0
                  ? isOwner
                    ? "$ vault is empty — add your first project."
                    : "$ vault is empty — check back later."
                  : `$ no projects match "${query}"`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filtered.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  isOwner={isOwner}
                  onEdit={(p) => {
                    setEditing(p);
                    setModalOpen(true);
                  }}
                  onDelete={setPendingDelete}
                />
              ))}
            </div>
          )}
        </main>

        <VaultFooter count={projects.length} />
      </div>

      {isOwner ? (
        <Button
          onClick={openCreate}
          aria-label="Add project"
          className="animate-term-pulse fixed right-6 bottom-6 size-14 rounded-full shadow-lg"
        >
          <Plus className="size-6" />
        </Button>
      ) : null}

      <ProjectFormModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditing(null);
        }}
        editing={editing}
        onSubmit={handleSubmit}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>rm -f {pendingDelete?.title}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the project from the cloud vault. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) {
                  deleteProject(pendingDelete.id);
                  toast.success(`deleted ${pendingDelete.title}`);
                }
                setPendingDelete(null);
              }}
            >
              delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  );
}
