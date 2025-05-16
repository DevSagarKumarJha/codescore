import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage, LoginPage, SignUpPage } from "./components";

const App = () => {
  let authUser = "sagar";

  return (
    <div className="flex flex-col-items-center justify-start">
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to={"/login"} />}
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
