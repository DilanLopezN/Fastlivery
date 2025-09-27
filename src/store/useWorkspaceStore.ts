import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Workspace } from "../types/workspace";
import api from "../services/api";

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  fetchWorkspaces: () => Promise<void>;
  setCurrentWorkspace: (workspace: Workspace) => void;
  createWorkspace: (data: Partial<Workspace>) => Promise<Workspace>;
  updateWorkspace: (id: string, data: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      currentWorkspace: null,
      isLoading: false,

      fetchWorkspaces: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get("/workspaces");
          const workspaces = response.data.data;

          set({
            workspaces,
            isLoading: false,
            currentWorkspace: get().currentWorkspace || workspaces[0] || null,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setCurrentWorkspace: (workspace: Workspace) => {
        set({ currentWorkspace: workspace });
      },

      createWorkspace: async (data: Partial<Workspace>) => {
        const response = await api.post("/workspaces", data);
        const newWorkspace = response.data.data;

        set((state) => ({
          workspaces: [...state.workspaces, newWorkspace],
        }));

        return newWorkspace;
      },

      updateWorkspace: async (id: string, data: Partial<Workspace>) => {
        await api.put(`/workspaces/${id}`, data);

        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === id ? { ...w, ...data } : w
          ),
          currentWorkspace:
            state.currentWorkspace?.id === id
              ? { ...state.currentWorkspace, ...data }
              : state.currentWorkspace,
        }));
      },

      deleteWorkspace: async (id: string) => {
        await api.delete(`/workspaces/${id}`);

        set((state) => {
          const workspaces = state.workspaces.filter((w) => w.id !== id);
          const currentWorkspace =
            state.currentWorkspace?.id === id
              ? workspaces[0] || null
              : state.currentWorkspace;

          return { workspaces, currentWorkspace };
        });
      },
    }),
    {
      name: "workspace-storage",
      partialize: (state) => ({
        currentWorkspace: state.currentWorkspace,
      }),
    }
  )
);
