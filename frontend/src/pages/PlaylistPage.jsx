import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlaylistStore } from "../store/usePlaylistStore";

const PlaylistListPage = () => {
  const navigate = useNavigate();
  const { playlists, getAllPlaylists, createPlaylist, isLoading } =
    usePlaylistStore();

  const [newPlaylist, setNewPlaylist] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getAllPlaylists();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newPlaylist.name.trim()) return;

    try {
      setCreating(true);
      const created = await createPlaylist(newPlaylist);
      setNewPlaylist({ name: "", description: "" });
      navigate(`/playlists/${created.id}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Playlists</h1>

      <form onSubmit={handleCreate} className="mb-8 bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Create New Playlist</h2>
        <input
          type="text"
          placeholder="Name"
          value={newPlaylist.name}
          onChange={(e) =>
            setNewPlaylist({ ...newPlaylist, name: e.target.value })
          }
          className="w-full p-2 mb-2 rounded bg-gray-700 text-white"
          required
        />
        <textarea
          placeholder="Description (optional)"
          value={newPlaylist.description}
          onChange={(e) =>
            setNewPlaylist({ ...newPlaylist, description: e.target.value })
          }
          className="w-full p-2 mb-2 rounded bg-gray-700 text-white"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
          disabled={creating}
        >
          {creating ? "Creating..." : "Create Playlist"}
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-3">
        {isLoading ? "Loading playlists..." : "All Playlists"}
      </h2>

      {playlists.length === 0 && !isLoading ? (
        <p className="text-gray-400">No playlists found.</p>
      ) : (
        <ul className="space-y-3">
          {playlists.map((playlist) => (
            <li
              key={playlist.id}
              className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 transition"
              onClick={() => navigate(`/playlists/${playlist.id}`)}
              style={{ cursor: "pointer" }}
            >
              <h3 className="text-lg font-medium">{playlist.name}</h3>
              <p className="text-sm text-gray-400">{playlist.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlaylistListPage;
