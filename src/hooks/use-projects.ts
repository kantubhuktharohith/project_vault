import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listProjects,
  createProject,
  updateProject as updateProjectFn,
  deleteProject as deleteProjectFn,
} from "@/lib/projects.functions";
import { createId, sanitizeProject, seedProjects, type Project } from "@/lib/projects";

export function useProjects() {
  const queryClient = useQueryClient();
  const fetchList = useServerFn(listProjects);
  const doCreate = useServerFn(createProject);
  const doUpdate = useServerFn(updateProjectFn);
  const doDelete = useServerFn(deleteProjectFn);

  const { data, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => fetchList(),
    staleTime: 0,
  });

  const projects = data ?? [];

  const createMutation = useMutation({
    mutationFn: async (input: Omit<Project, "id" | "createdAt">) => {
      return doCreate({ data: input });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Omit<Project, "id" | "createdAt"> }) => {
      return doUpdate({ data: { id, ...data } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return doDelete({ data: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const addProject = useCallback(
    (data: Omit<Project, "id" | "createdAt">) => {
      createMutation.mutate(data);
    },
    [createMutation],
  );

  const updateProject = useCallback(
    (id: string, data: Omit<Project, "id" | "createdAt">) => {
      updateMutation.mutate({ id, data });
    },
    [updateMutation],
  );

  const deleteProject = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation],
  );

  const replaceAll = useCallback(
    (next: Project[]) => {
      // Replace localStorage fallback — no longer used in cloud mode.
      // Kept for API compatibility with the import/export flow.
      try {
        window.localStorage.setItem("project_vault.projects.v1", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      queryClient.setQueryData(["projects"], next);
    },
    [queryClient],
  );

  return {
    projects,
    loaded: !isLoading,
    error,
    addProject,
    updateProject,
    deleteProject,
    replaceAll,
    isPending: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}

// Legacy localStorage helper for import/export, kept for compatibility.
export function loadLocalProjects(): Project[] {
  try {
    const raw = window.localStorage.getItem("project_vault.projects.v1");
    if (!raw) return seedProjects;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map(sanitizeProject).filter((p): p is Project => p !== null)
      : [];
  } catch {
    return [];
  }
}

export { createId };
