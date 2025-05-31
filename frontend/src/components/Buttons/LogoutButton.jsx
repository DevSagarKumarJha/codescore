import { useAuthStore } from "../../store/useAuthStore";

export default function LogoutButton() {
  const { logout, authUser } = useAuthStore();

  const logOutUser = async () => {
    try {
      await logout();
    } catch (error) {
      console.log(error);
    }
  };
  if (authUser === null) return null; // optional: hide if not logged in

  return <button onClick={logOutUser}>Logout</button>;
}
