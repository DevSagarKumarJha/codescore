import { db } from "../libs/db.js";
import {
  getJudge0LanguageId,
  pollBatchresults,
  submitBatch,
} from "../libs/judge0.lib.js";

const createProblem = async (req, res) => {
  // bring data and destructure
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

  // To do validations of data

  // check user
  if (req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ error: "You're not allowed to create problem" });
  }

  try {
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language);

      if (!languageId) {
        return res
          .status(400)
          .json({ error: `Language ${language} is not supported` });
      }

      const submissions = testcases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      const submissionResults = await submitBatch(submissions);

      const tokens = submissionResults.map((res) => res.token);

      //Polling
      const results = await pollBatchresults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        if (result.status.id !== 3) {
          return res.status(400).json({
            error: `Testcase ${i + 1} failed for language ${language}`,
          });
        }
      }

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
        .json({ message: "Problem Added Successfully", problem: newProblem });
    }
  } catch (error) {
    return res.status(500).json({ error: "Unable to add problem" });
  }
};

const getAllProblems = (req, res) => {};

const getProblemByID = (req, res) => {};

const updateProblem = (req, res) => {};

const deleteProblem = (req, res) => {};

const getProblemSolvedByUser = (req, res) => {};

export {
  getAllProblems,
  getProblemByID,
  updateProblem,
  deleteProblem,
  createProblem,
  getProblemSolvedByUser,
};
