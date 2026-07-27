import { createServerFn } from "@tanstack/react-start";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth.functions";
import {
  type Project,
  type ProjectCategory,
  DEFAULT_CATEGORY,
  parseTech,
  normalizeUrl,
  isProjectCategory,
  createId,
} from "@/lib/projects";

interface ProjectRow {
  id: string;
  title: string;
  description: string;
  live_url: string;
  github_url: string;
  image_url: string;
  tech: string;
  category: string;
  created_at: string;
}

function rowToProject(row: ProjectRow): Project {
  let techList: string[] = [];
  try {
    techList = JSON.parse(row.tech);
  } catch {
    techList = [];
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    liveUrl: row.live_url,
    githubUrl: row.github_url,
    imageUrl: row.image_url,
    tech: Array.isArray(techList) ? techList : [],
    category: isProjectCategory(row.category) ? row.category : DEFAULT_CATEGORY,
    createdAt: Number(row.created_at),
  };
}

export const listProjects = createServerFn({ method: "GET" }).handler(async () => {
  const db = await getDb();
  const { rows } = await db.query<ProjectRow>("SELECT * FROM projects ORDER BY created_at DESC");
  return rows.map(rowToProject);
});

const projectInputSchema = (data: unknown) => {
  if (!data || typeof data !== "object") throw new Error("invalid project data");
  const d = data as Record<string, unknown>;
  const title = typeof d.title === "string" ? d.title.trim() : "";
  if (!title) throw new Error("title is required");
  return {
    title,
    description: typeof d.description === "string" ? d.description.trim() : "",
    liveUrl: normalizeUrl(typeof d.liveUrl === "string" ? d.liveUrl : ""),
    githubUrl: normalizeUrl(typeof d.githubUrl === "string" ? d.githubUrl : ""),
    imageUrl: typeof d.imageUrl === "string" ? d.imageUrl.trim() : "",
    tech: parseTech(typeof d.tech === "string" ? d.tech : ""),
    category: isProjectCategory(d.category) ? d.category : DEFAULT_CATEGORY,
  };
};

export const createProject = createServerFn({ method: "POST" })
  .validator(projectInputSchema)
  .handler(async ({ data }) => {
    requireAdmin();
    const db = await getDb();
    const id = createId();
    const createdAt = Date.now();
    const techJson = JSON.stringify(data.tech);

    await db.query(
      `INSERT INTO projects (id, title, description, live_url, github_url, image_url, tech, category, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, data.title, data.description, data.liveUrl, data.githubUrl, data.imageUrl, techJson, data.category, createdAt],
    );

    return {
      id,
      title: data.title,
      description: data.description,
      liveUrl: data.liveUrl,
      githubUrl: data.githubUrl,
      imageUrl: data.imageUrl,
      tech: data.tech,
      category: data.category,
      createdAt,
    };
  });

export const updateProject = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!data || typeof data !== "object") throw new Error("invalid update data");
    const d = data as Record<string, unknown>;
    if (typeof d.id !== "string" || !d.id) throw new Error("id is required");
    return { id: d.id, ...projectInputSchema(d) };
  })
  .handler(async ({ data }) => {
    requireAdmin();
    const db = await getDb();
    const techJson = JSON.stringify(data.tech);

    const result = await db.query(
      `UPDATE projects
       SET title = $1, description = $2, live_url = $3, github_url = $4, image_url = $5, tech = $6, category = $7
       WHERE id = $8`,
      [data.title, data.description, data.liveUrl, data.githubUrl, data.imageUrl, techJson, data.category, data.id],
    );

    if (result.rowCount === 0) throw new Error("Project not found");

    const { rows } = await db.query<ProjectRow>("SELECT * FROM projects WHERE id = $1", [data.id]);
    return rowToProject(rows[0]);
  });

export const deleteProject = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (typeof data !== "string" || !data) throw new Error("id is required");
    return data;
  })
  .handler(async ({ data: id }) => {
    requireAdmin();
    const db = await getDb();
    await db.query("DELETE FROM projects WHERE id = $1", [id]);
    return { id };
  });
