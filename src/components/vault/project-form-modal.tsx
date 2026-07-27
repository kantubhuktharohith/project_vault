import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_CATEGORY,
  normalizeUrl,
  parseTech,
  PROJECT_CATEGORIES,
  type Project,
} from "@/lib/projects";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Project | null;
  onSubmit: (data: Omit<Project, "id" | "createdAt">) => void;
};

const empty = {
  title: "",
  description: "",
  liveUrl: "",
  githubUrl: "",
  imageUrl: "",
  tech: "",
  category: DEFAULT_CATEGORY,
};

export function ProjectFormModal({ open, onOpenChange, editing, onSubmit }: Props) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      editing
        ? {
            title: editing.title,
            description: editing.description,
            liveUrl: editing.liveUrl,
            githubUrl: editing.githubUrl,
            imageUrl: editing.imageUrl,
            tech: editing.tech.join(", "),
            category: editing.category,
          }
        : empty,
    );
  }, [open, editing]);

  const set = (key: keyof typeof empty) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("error: title is required");
      return;
    }
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      liveUrl: normalizeUrl(form.liveUrl),
      githubUrl: normalizeUrl(form.githubUrl),
      imageUrl: form.imageUrl.trim(),
      tech: parseTech(form.tech),
      category: form.category,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-primary/30 bg-card/95 backdrop-blur-xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-primary text-glow">
            {editing ? "> edit_project" : "> new_project"}
          </DialogTitle>
          <DialogDescription>
            Stored locally in this browser. Export to back it up.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">title</Label>
            <Input
              id="title"
              autoFocus
              value={form.title}
              onChange={(e) => set("title")(e.target.value)}
              placeholder="my_awesome_project"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">description</Label>
            <Textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) => set("description")(e.target.value)}
              placeholder="What does it do?"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="liveUrl">live url</Label>
              <Input
                id="liveUrl"
                value={form.liveUrl}
                onChange={(e) => set("liveUrl")(e.target.value)}
                placeholder="example.vercel.app"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="githubUrl">github url</Label>
              <Input
                id="githubUrl"
                value={form.githubUrl}
                onChange={(e) => set("githubUrl")(e.target.value)}
                placeholder="github.com/user/repo"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="imageUrl">thumbnail image url (optional)</Label>
            <Input
              id="imageUrl"
              value={form.imageUrl}
              onChange={(e) => set("imageUrl")(e.target.value)}
              placeholder="https://.../screenshot.png"
            />
            {form.imageUrl.trim() ? (
              <img
                src={form.imageUrl.trim()}
                alt="Thumbnail preview"
                loading="lazy"
                className="mt-2 aspect-[16/9] w-full rounded-md border border-border object-cover"
              />
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tech">tech stack (comma separated)</Label>
            <Input
              id="tech"
              value={form.tech}
              onChange={(e) => set("tech")(e.target.value)}
              placeholder="React, TypeScript, Tailwind"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">category</Label>
            <Select
              value={form.category}
              onValueChange={(value) => set("category")(value)}
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Pick a category" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              cancel
            </Button>
            <Button type="submit">{editing ? "save" : "create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
