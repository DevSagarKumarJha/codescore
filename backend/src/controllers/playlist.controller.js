import { db } from "../libs/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.id;

  const playList = await db.playlist.create({
    data: {
      name,
      description,
      userId,
    },
  });

  res.status(200).json({
    success: true,
    message: "Playlist created successfully",
    playList,
  });
});

export const getAllListDetails = asyncHandler(async (req, res) => {
  const playlists = await db.playlist.findMany({
    where: {
      userId: req.user.id,
    },
    include: {
      problems: {
        include: {
          problem: true,
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    message: "Playlist fetched successfully",
    playlists,
  });
});

export const getPlayListDetails = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const playlist = await db.playlist.findUnique({
    where: {
      id: playlistId,
      userId: req.user.id,
    },
    include: {
      problems: {
        include: {
          problem: true,
        },
      },
    },
  });

  if (!playlist) {
    return res.status(404).json({ error: "Playlist not found" });
  }

  res.status(200).json({
    success: true,
    message: "Playlist fetched successfully",
    playlist,
  });
});

export const addProblemToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;

  if (!Array.isArray(problemIds) || problemIds.length === 0) {
    return res.status(400).json({ error: "Invalid or missing problemsId" });
  }

  const problemsInPlaylist = await db.problemsInPlaylist.createMany({
    data: problemIds.map((problemId) => ({
      playlistId,
      problemId,
    })),
  });

  res.status(201).json({
    success: true,
    message: "Problems added to playlist successfully",
    problemsInPlaylist,
  });
});

export const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const deletedPlaylist = await db.playlist.delete({
    where: {
      id: playlistId,
    },
  });

  res.status(200).json({
    success: true,
    message: "Playlist deleted successfully",
    deletedPlaylist,
  });
});

export const removeProblemFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;

  if (!Array.isArray(problemIds) || problemIds.length === 0) {
    return res.status(400).json({ error: "Invalid or missing problemsId" });
  }

  const deletedProblem = await db.problemsInPlaylist.deleteMany({
    where: {
      playlistId,
      problemId: {
        in: problemIds,
      },
    },
  });

  res.status(200).json({
    success: true,
    message: "Problem removed from playlist successfully",
    deletedProblem,
  });
});