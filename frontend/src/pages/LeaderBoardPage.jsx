// pages/Leaderboard.jsx
import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { Avatar } from "../components";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    axiosInstance
      .get("/users?page=1&limit=100")
      .then((res) => {
        const fetchedUsers = res?.data?.data?.users;
        if (Array.isArray(fetchedUsers)) {
          setUsers(fetchedUsers);
        } else {
          setUsers([]);
          setError("Invalid data format received.");
        }
      })
      .catch(() => {
        setUsers([]);
        setError("Failed to fetch leaderboard data.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-white">
        Loading leaderboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-red-500">
        Error: {error}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-white">
        No users found on the leaderboard.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-white">
      <h1 className="text-2xl font-bold mb-6">🏆 Leaderboard</h1>
      <table className="w-full table-auto text-2xl">
        <thead className="bg-gray-800 text-gray-300">
          <tr className="">
            <th className="py-2 px-4">Rank</th>
            <th className="py-2 px-4 ">User</th>
            <th className="py-2 px-4">Score</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, i) => (
            <tr key={user.id} className="hover:bg-gray-800 text-2xl">
              <td className="py-2 text-center px-4">{i + 1}</td>
              <td className="py-2 px-4">
                <div className="flex items-center justify-center gap-2">
                  <Avatar name={user.name} image={user.image}/>
                  <span>{user.username}</span>
                </div>
              </td>
              <td className="py-2 px-4 text-center">{user.score ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
