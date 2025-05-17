import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage, LoginPage, SignUpPage } from "./pages";

const App = () => {
  let authUser = null;

  return (
    <div className="flex flex-col items-center justify-start">
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to={"/signin"} />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/signin"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
      </Routes>
    </div>
  );
};

export default App;
