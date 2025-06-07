import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const usePlaylistStore = create((set, get) => ({
  playlists: [],
  currentPlaylist: null,
  isLoading: false,
  error: null,

  createPlaylist: async (playlistData) => {
    try {
      set({ isLoading: true });

      const response = await axiosInstance.post(
        "/playlist/create-playlist",
        playlistData
      );

      const playList = response.data?.playList || response.data?.data?.playList;

      if (!playList) {
        throw new Error("Invalid response structure: playList not found");
      }

      set((state) => ({
        playlists: [...state.playlists, playList],
      }));

      toast.success("Playlist created successfully");
      return playList;
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to create playlist"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getAllPlaylists: async () => {
    try {
      set({ isLoading: true });

      const response = await axiosInstance.get("/playlist");
      const playLists = response.data?.playlists || response.data?.data?.playlists;

      if (!Array.isArray(playLists)) {
        throw new Error("Invalid response structure: playLists not found");
      }

      set({ playlists: playLists });
    } catch (error) {
      console.error("Error fetching playlists:", error);
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to fetch playlists"
      );
    } finally {
      set({ isLoading: false });
    }
  },

  getPlaylistDetails: async (playlistId) => {
    try {
      set({ isLoading: true });

      const response = await axiosInstance.get(`/playlist/${playlistId}`);

      const playList = response.data?.playlist || response.data?.data?.playlist;

      if (!playList) {
        throw new Error("Invalid response structure: playList not found");
      }

      set({ currentPlaylist: playList });
    } catch (error) {
      console.error("Error fetching playlist details:", error);
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to fetch playlist details"
      );
    } finally {
      set({ isLoading: false });
    }
  },

  addProblemToPlaylist: async (playlistId, problemIds) => {
    try {
      set({ isLoading: true });

      await axiosInstance.post(`/playlist/${playlistId}/add-problem`, {
        problemIds,
      });

      toast.success("Problem added to playlist");

      // Refresh the current playlist if it's the same
      if (get().currentPlaylist?.id === playlistId) {
        await get().getPlaylistDetails(playlistId);
      }
    } catch (error) {
      console.error("Error adding problem to playlist:", error);
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to add problem to playlist"
      );
    } finally {
      set({ isLoading: false });
    }
  },

  removeProblemFromPlaylist: async (playlistId, problemIds) => {
    try {
      set({ isLoading: true });

      await axiosInstance.post(`/playlist/${playlistId}/remove-problems`, {
        problemIds,
      });

      toast.success("Problem removed from playlist");

      if (get().currentPlaylist?.id === playlistId) {
        await get().getPlaylistDetails(playlistId);
      }
    } catch (error) {
      console.error("Error removing problem from playlist:", error);
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to remove problem from playlist"
      );
    } finally {
      set({ isLoading: false });
    }
  },

  deletePlaylist: async (playlistId) => {
    try {
      set({ isLoading: true });

      await axiosInstance.delete(`/playlist/${playlistId}`);

      set((state) => ({
        playlists: state.playlists.filter((p) => p.id !== playlistId),
        currentPlaylist:
          state.currentPlaylist?.id === playlistId ? null : state.currentPlaylist,
      }));

      toast.success("Playlist deleted successfully");
    } catch (error) {
      console.error("Error deleting playlist:", error);
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to delete playlist"
      );
    } finally {
      set({ isLoading: false });
    }
  },
}));
