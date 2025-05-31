import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Loader } from "lucide-react";

import { HomePage, LoginPage, SignUpPage } from "./pages";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import { useAuthStore } from "./store/useAuthStore";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]); // Run only on mount

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
        <Route
          path="/"
          element={authUser !== null ? <HomePage /> : <Navigate to="/signin" />}
        />
        <Route
          path="/signup"
          element={authUser===null ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/signin"
          element={authUser===null ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/verify/:token"
          element={ <VerifyEmailPage />}
        />
      </Routes>
    </div>
  );
};

export default App;
