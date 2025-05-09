import { db } from "../libs/db.js";
import {
  getJudge0LanguageId,
  pollBatchresults,
  submitBatch,
} from "../libs/judge0.lib.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

const validateSubmission = async (testcases, referenceSolutions) => {
  for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
    const languageId = getJudge0LanguageId(language);

    if (!languageId) {
      throw new ApiError(400, `Language ${language} is not supported`);
    }

    const submissions = testcases.map(({ input, output }) => ({
      source_code: solutionCode,
      language_id: languageId,
      stdin: input,
      expected_output: output,
    }));

    const submissionResults = await submitBatch(submissions);

    const tokens = submissionResults.map((res) => res.token);

    const results = await pollBatchresults(tokens);

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status.id !== 3) {
        throw new ApiError(
          400,
          `Testcase ${i + 1} failed for language ${language}`
        );
      }
    }
  }
};

const createProblem = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  if (req.user.role !== "ADMIN") {
    throw new ApiError(403, "You're not allowed to create problem");
  }

  await validateSubmission(testcases, referenceSolutions);

  const newProblem = await db.problem.create({
    data: {
      title,
      description,
      difficulty,
      tags,
      examples,
      constraints,
      testcases,
      codeSnippets,
      referenceSolutions,
      userId: req.user.id,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Problem added successfully", newProblem));
});

const getAllProblems = asyncHandler(async (req, res) => {
  const problems = await db.problem.findMany();
  if (!problems.length) {
    throw new ApiError(404, "No problems found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Problems fetched successfully", problems));
});

const getProblemByID = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const problem = await db.problem.findUnique({ where: { id } });

  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Problem fetched successfully", problem));
});

const updateProblem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  const problem = await db.problem.findUnique({
    where: { id, userId: req.user.id },
  });

  if (!problem) {
    throw new ApiError(404, "Problem not found or unauthorized access");
  }

  await validateSubmission(testcases, referenceSolutions);

  const updatedProblem = await db.problem.update({
    where: { id, userId: req.user.id },
    data: {
      title,
      description,
      difficulty,
      tags,
      examples,
      constraints,
      testcases,
      codeSnippets,
      referenceSolutions,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Problem updated successfully", updatedProblem));
});

const deleteProblem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const problem = await db.problem.findUnique({
    where: { id, userId: req.user.id },
  });

  if (!problem) {
    throw new ApiError(404, "Problem not found or unauthorized access");
  }

  const deletedProblem = await db.problem.delete({
    where: { id, userId: req.user.id },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Problem deleted successfully", deletedProblem));
});

// Placeholder for future implementation
const getProblemSolvedByUser = asyncHandler((req, res) => {});

export {
  getAllProblems,
  getProblemByID,
  updateProblem,
  deleteProblem,
  createProblem,
  getProblemSolvedByUser,
};
