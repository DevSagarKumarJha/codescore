import { db } from "../libs/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllSubmission = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const submissions = await db.submission.findMany({
    where: {
      userId: userId,
    },
  });

  res.status(200).json({
    success: true,
    message: "Submissions fetched successfully",
    submissions,
  });
});

export const getSubmissionsForProblem = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const problemId = req.params.problemId;
  const submissions = await db.submission.findMany({
    where: {
      userId: userId,
      problemId: problemId,
    },
  });

  res.status(200).json({
    success: true,
    message: "Submission fetched successfully",
    submissions,
  });
});

export const getAllTheSubmissionsForProblem = asyncHandler(async (req, res) => {
    const problemId = req.params.problemId;
    const submission = await db.submission.count({
      where: {
        problemId: problemId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Submissions Fetched successfully",
      count: submission,
    });
});
