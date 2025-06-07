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
  ProblemsPage,
  ProblemPage,
  PlaylistListPage,
  PlaylistDetailsPage,
  ProfilePage,
  LeaderboardPage,
  MyProfilePage,
} from "./pages";

import Layout from "./layout/Layout";
import AdminRoute from "./components/ProtectedRoutes/AdminRoute";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth(); // ensures auth status is refreshed
  }, []); // run once on mount

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size={40} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-black justify-start min-h-screen">
      <Toaster />
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public Routes */}
          <Route index element={<HomePage />} />
          <Route
            path="/signup"
            element={
              authUser === null ? <SignUpPage /> : <Navigate to="/problems" />
            }
          />
          <Route
            path="/signin"
            element={
              authUser === null ? <LoginPage /> : <Navigate to="/problems" />
            }
          />
          <Route
            path="/problems"
            element={authUser !== null ? <ProblemsPage /> : <Navigate to="/" />}
          />
          <Route
            path="/problem/:id"
            element={authUser !== null ? <ProblemPage /> : <Navigate to="/" />}
          />

          <Route path="/verify/:token" element={<EmailVerificationPage />} />
          <Route path="/playlists" element={<PlaylistListPage />} />
          <Route
            path="/playlists/:playlistId"
            element={<PlaylistDetailsPage />}
          />
          <Route path="/my-profile" element={authUser !==null ?<MyProfilePage /> : <Navigate to={"/"}/>} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="add-problem" element={<AddProblemPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
