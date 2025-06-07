import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import {
  FileText,
  MessageSquare,
  Lightbulb,
  Bookmark,
  Share2,
  Clock,
  ChevronRight,
  Terminal,
  Code2,
  Users,
  ThumbsUp,
  Home,
} from "lucide-react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { Link, useParams } from "react-router-dom";
import { useProblemStore } from "../store/useProblemStore";
import { getLanguageId } from "../lib/lang";
import { useExecutionStore } from "../store/useExecutionStore";
import { useSubmissionStore } from "../store/useSubmissionStore";
import { SubmissionsList } from "../components";

const ProblemPage = () => {
  const { id } = useParams();
  const { getProblemById, problem, isProblemLoading } = useProblemStore();
  const {
    submission: submissions,
    isLoading: isSubmissionsLoading,
    getSubmissionForProblem,
    getSubmissionCountForProblem,
    submissionCount,
  } = useSubmissionStore();

  const [code, setCode] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [selectedLanguage, setSelectedLanguage] = useState("JAVASCRIPT");
  const [testcases, setTestCases] = useState([]);
  const { isRunning,isSubmitting, runCode, executeCode, executionResults, submission } = useExecutionStore();

  useEffect(() => {
    getProblemById(id);
    getSubmissionCountForProblem(id);
  }, [id]);

  useEffect(() => {
    if (problem) {
      setCode(problem.codeSnippets?.[selectedLanguage] || "");
      setTestCases(problem.testcases || []);
    }
  }, [problem, selectedLanguage]);

  useEffect(() => {
    if (activeTab === "submissions" && id) {
      getSubmissionForProblem(id);
    }
  }, [activeTab, id, submission]);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    
    setSelectedLanguage(lang);
    setCode(problem.codeSnippets?.[lang] || "");
  };

  const handleRunCode = () => {
    const language_id = getLanguageId(selectedLanguage);
    const stdin = problem.testcases.map((tc) => tc.input);
    const expected_outputs = problem.testcases.map((tc) => tc.output);

    runCode(code, language_id, stdin, expected_outputs); // <-- use runCode here
  };

  const handleSubmitCode = () => {
    const language_id = getLanguageId(selectedLanguage);
    const stdin = problem.testcases.map((tc) => tc.input);
    const expected_outputs = problem.testcases.map((tc) => tc.output);
    executeCode(code, language_id, stdin, expected_outputs, id);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "description":
        return (
          <div className="p-4 overflow-y-auto max-h-[calc(100vh-150px)]">
            <div className="flex justify-between items-start sm:items-center mb-4">
              <h2 className="text-xl font-bold">{problem.title}</h2>
              <h3
                className={`text-sm sm:text-base font-bold px-3 py-1 rounded w-fit
      ${
        problem.difficulty === "EASY"
          ? "bg-green-800 text-white"
          : problem.difficulty === "MEDIUM"
          ? "bg-yellow-700 text-white"
          : "bg-red-800 text-white"
      }`}
              >
                {problem.difficulty.charAt(0) +
                  problem.difficulty.slice(1).toLowerCase()}
              </h3>
            </div>

            <p>{problem.description}</p>

            {problem.examples && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Examples:</h3>
                {Object.entries(problem.examples).map(([lang, ex], i) => (
                  <div key={i} className="mb-2 bg-base-200 p-3 rounded">
                    <p>
                      <strong>Input:</strong> {ex.input}
                    </p>
                    <p>
                      <strong>Output:</strong> {ex.output}
                    </p>
                    {ex.explanation && (
                      <p>
                        <strong>Explanation:</strong> {ex.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <h3 className="font-semibold mb-2">Contraints:</h3>
            <p>{problem?.constraints}</p>
            {problem.tags && problem.tags.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {problem.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-base-200 px-3 py-1 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case "submissions":
        return (
          <SubmissionsList
            submissions={submissions}
            isLoading={isSubmissionsLoading}
          />
        );

      case "editorial":
        return (
          <div className="p-4">
            {problem?.editorial || "No editorial available"}
          </div>
        );
      case "hints":
        return (
          <div className="p-4">{problem?.hints || "No hints available"}</div>
        );
      default:
        return null;
    }
  };

  if (isProblemLoading || !problem) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div>Loading Problem...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col">
      {/* NAVBAR */}
      <nav className="flex justify-between items-center p-4 border-b bg-base-100 shadow-md">
        <div className="flex items-center gap-2 text-primary">
          <Link to={"/"}>
            <Home />
          </Link>
          <ChevronRight />
          <Link to={"/problems"} className="z-10">
            Problems
          </Link>
          <ChevronRight />
          <span className="font-semibold">{problem.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="select select-bordered select-sm"
            value={selectedLanguage}
            onChange={handleLanguageChange}
          >
            {Object.keys(problem.codeSnippets).map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      </nav>

      {/* MAIN PANELS */}
      <PanelGroup direction="horizontal" className="flex-1">
        {/* LEFT PANEL - DESCRIPTION */}
        <Panel defaultSize={50} minSize={30}>
          <div className="h-full overflow-hidden bg-base-100 border-r">
            {/* TABS */}
            <div className="flex border-b bg-base-200">
              {["description", "submissions", "editorial", "hints"].map(
                (tab) => (
                  <button
                    key={tab}
                    className={`tab ${activeTab === tab ? "tab-active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                )
              )}
            </div>
            {renderTabContent()}
          </div>
        </Panel>

        <PanelResizeHandle className="w-2 bg-gray-300 cursor-col-resize" />

        {/* RIGHT PANEL - CODE */}
        <Panel defaultSize={50} minSize={30}>
          <PanelGroup direction="vertical" className="h-full">
            {/* Code Editor */}
            <Panel defaultSize={70} minSize={40}>
              <div className="h-full">
                <Editor
                  height="100%"
                  language={selectedLanguage.toLowerCase()}
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  theme="vs-dark"
                  options={{
                    fontSize: 16,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            </Panel>

            <PanelResizeHandle className="h-2 bg-gray-300 cursor-row-resize" />

            {/* Test Cases */}
            <Panel defaultSize={30} minSize={10}>
              <div className="p-4 bg-base-200 h-full overflow-auto">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Test Cases</h3>
                  <div className="flex gap-2">
                    <button
                      className={`btn btn-sm btn-accent text-white z-10 ${
                        isRunning ? "loading" : ""
                      }`}
                      onClick={handleRunCode}
                      disabled={isRunning}
                    >
                      Run Code
                    </button>
                    <button
                      className={`btn btn-sm btn-primary z-10 ${
                        isSubmitting ? "loading" : ""
                      }`}
                      onClick={handleSubmitCode}
                      disabled={isSubmitting}
                    >
                      Submit Code
                    </button>
                  </div>
                </div>

                {/* Test Cases Table */}
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Input</th>
                        <th>Expected Output</th>
                        <th>Your Output</th>
                        <th>Status</th>
                        <th>Time</th>
                        <th>Memory</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testcases.map((testcase, index) => {
                        const result = executionResults?.[index];
                        return (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                              <pre className="whitespace-pre-wrap">
                                {testcase.input}
                              </pre>
                            </td>
                            <td>
                              <pre className="whitespace-pre-wrap">
                                {testcase.output}
                              </pre>
                            </td>
                            <td>
                              <pre className="whitespace-pre-wrap">
                                {result?.stdout ?? "--"}
                              </pre>
                            </td>
                            <td>
                              {result ? (
                                result.passed ? (
                                  <span className="badge badge-success">
                                    Passed
                                  </span>
                                ) : (
                                  <span className="badge badge-error">
                                    Failed
                                  </span>
                                )
                              ) : (
                                "--"
                              )}
                            </td>
                            <td>{result?.time ?? "--"}</td>
                            <td>{result?.memory ?? "--"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default ProblemPage;
