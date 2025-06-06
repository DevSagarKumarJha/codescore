import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Loader } from "lucide-react";

import { useAuthStore } from "./store/useAuthStore";
import {
  EmailVerificationPage,
  AddProblemPage,
  HomePage,
  LoginPage,
  SignUpPage,
} from "./pages";

import Layout from "./layout/Layout";
import AdminRoute from "./components/ProtectedRoutes/AdminRoute";
import AuthRoute from "./components/ProtectedRoutes/AuthRoute";
import ProblemPage from "./pages/ProblemPage";

const App = () => {
  const { checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth(); // ensures auth status is refreshed
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-black justify-start min-h-screen">
      <Toaster />
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* ✅ Public Routes */}
          <Route index element={<HomePage />} />
          <Route path="signup" element={<SignUpPage />} />
          <Route path="signin" element={<LoginPage />} />
          <Route
            path="/problems"
            element={
              <AuthRoute>
                <ProblemPage />
              </AuthRoute>
            }
          />

          <Route
            path="verify/:token"
            element={
              <AuthRoute>
                <EmailVerificationPage />
              </AuthRoute>
            }
          />

          {/* ✅ Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="add-problem" element={<AddProblemPage />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
};

export default App;
