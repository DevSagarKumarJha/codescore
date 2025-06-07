import { useAuthStore } from "../../store/useAuthStore";
import {Navigate} from "react-router-dom"
const AuthRoute = ({ children }) => {
  const { authUser, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return <div>Loading...</div>;
  }

  return authUser !== null ? children : <Navigate to="/" />;
};

export default AuthRoute;
