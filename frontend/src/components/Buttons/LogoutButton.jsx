import { LogOutIcon } from "lucide-react";
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

  return (
    <button
      className="flex cursor-pointer items-center gap-2 bg-red-500 hover:bg-red-600 w-full hover:text-white p-2 rounded"
      onClick={logOutUser}
    >
      <LogOutIcon className="w-4 h-4" />
      Logout
    </button>
  );
}
