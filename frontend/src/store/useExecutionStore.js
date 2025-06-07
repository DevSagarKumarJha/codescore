import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useExecutionStore = create((set) => ({
  isRunning: false,
  isSubmitting: false,
  executionResults: null, // Results of /run
  submission: null, // Submission data from /submit

  // Run code without saving submission
  runCode: async (source_code, language_id, stdin, expected_outputs) => {
    try {
      set({ isRunning: true });

      const res = await axiosInstance.post("/execute-code/run", {
        source_code,
        language_id,
        stdin,
        expected_outputs,
      });


      set({ executionResults: res.data.results });
      toast.success(res.data.message);
    } catch (error) {
      console.error("❌ Error running code:", error);
      toast.error("Failed to run code");
    } finally {
      set({ isRunning: false });
    }
  },

  // Submit code and persist the submission
  executeCode: async (
    source_code,
    language_id,
    stdin,
    expected_outputs,
    problemId
  ) => {
    try {
      set({ isSubmitting: true });



      const res = await axiosInstance.post("/execute-code/submit", {
        source_code,
        language_id,
        stdin,
        expected_outputs,
        problemId,
      });


      set({ submission: res.data.submission });
      toast.success(res.data.message);
    } catch (error) {
      console.error("❌ Error submitting code:", error);
      toast.error("Failed to submit code");
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
