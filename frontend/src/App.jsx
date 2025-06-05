import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Loader } from "lucide-react";

import { HomePage, LoginPage, SignUpPage } from "./pages";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import { useAuthStore } from "./store/useAuthStore";
import Layout from "./layout/Layout";
import AdminRoute from "./components/AdminComponents/AdminRoute";
import AddProblem from "./pages/AddProblem";
import AuthRoute from "./components/AuthRoute";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

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
    <div className="flex flex-col items-center justify-start min-h-screen">
      <Toaster />
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* ✅ Public Routes */}
          <Route index element={<HomePage />} />
          <Route
            path="signup"
            element={
              <AuthRoute>
                <SignUpPage />
              </AuthRoute>
            }
          />
          <Route
            path="signin"
            element={
              <AuthRoute>
                <LoginPage />
              </AuthRoute>
            }
          />

          <Route path="verify/:token" element={<VerifyEmailPage />} />

          {/* ✅ Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="add-problem" element={<AddProblem />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
};

export default App;
