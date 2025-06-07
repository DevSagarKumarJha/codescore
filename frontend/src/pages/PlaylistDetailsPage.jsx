import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePlaylistStore } from "../store/usePlaylistStore";

const PlaylistDetailsPage = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();

  const {
    currentPlaylist,
    getPlaylistDetails,
    removeProblemFromPlaylist,
    isLoading,
  } = usePlaylistStore();

  useEffect(() => {
    if (playlistId) {
      getPlaylistDetails(playlistId);
    }
  }, [playlistId]);

  const handleRemoveProblem = async (problemId) => {
    if (
      window.confirm(
        "Are you sure you want to remove this problem from the playlist?"
      )
    ) {
      await removeProblemFromPlaylist(playlistId, [problemId]);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-gray-400">Loading playlist details...</div>;
  }

  
  if (!currentPlaylist) {
    return <div className="p-6 text-red-400">Playlist not found.</div>;
  }

  return (
    <div className="p-12">
      <h1 className="text-3xl font-bold mb-2">{currentPlaylist.name}</h1>
      <p className="text-gray-400 mb-4">{currentPlaylist.description}</p>

      <button
        className="mb-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
        onClick={() => navigate("/playlists")}
      >
        ← Back to Playlists
      </button>

      <h2 className="text-xl font-semibold mb-3">
        Problems ({currentPlaylist.problems?.length || 0})
      </h2>

      {currentPlaylist.problems?.length === 0 ? (
        <p className="text-gray-500">No problems added to this playlist yet.</p>
      ) : (
        <ul className="space-y-3 bg-base-200 p-4 rounded">
          {currentPlaylist.problems.map((p, index) => (
            <li
              key={p.id}
              className="p-4 bg-base-100 rounded-md border border-base-300 hover:shadow-md transition flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold text-base-content">
                  {index + 1}. {p.problem.title}
                </h3>
                <p
                  className={`text-sm mt-1 font-medium ${
                    p.problem.difficulty === "EASY"
                      ? "text-green-500"
                      : p.problem.difficulty === "MEDIUM"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  {p.problem.difficulty}
                </p>
              </div>

              <button
                onClick={() => handleRemoveProblem(problem.id)}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlaylistDetailsPage;
