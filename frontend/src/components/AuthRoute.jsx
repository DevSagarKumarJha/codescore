// components/AuthRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const AuthRoute = ({ children }) => {
  const { authUser } = useAuthStore();
  return authUser === null ? children : <Navigate to="/" />;
};

export default AuthRoute;
