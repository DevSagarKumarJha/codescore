// pages/MyProfilePage.jsx
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import { Avatar } from "../components";

export default function MyProfilePage() {
  const { authUser } = useAuthStore();
  const [solved, setSolved] = useState([]);
  const [stats, setStats] = useState({ Easy: 0, Medium: 0, Hard: 0 });

  useEffect(() => {
    axiosInstance
      .get("/problems/solved-by-user")
      .then((res) => {
        const problems = res.data.problems || [];
        setSolved(problems);

        const difficultyStats = { EASY: 0, MEDIUM: 0, HARD: 0 };
        problems.forEach((p) => {
          if (difficultyStats[p.difficulty] !== undefined) {
            difficultyStats[p.difficulty]++;
          }
        });

        setStats(difficultyStats);
      })
      .catch(() => setSolved([]));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-white">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <Avatar image={authUser?.image || ""} name={authUser.name}/>
          <div>
            <h2 className="text-2xl font-bold">{authUser?.username}</h2>
            <p className="text-gray-400">{authUser?.email}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-6 text-sm">
          <div>
            <p className="text-gray-400">Score</p>
            <p className="font-semibold text-lg">{authUser?.score}</p>
          </div>
          <div>
            <p className="text-gray-400">Solved</p>
            <p className="font-semibold text-lg">{solved.length}</p>
          </div>
          {["EASY", "MEDIUM", "HARD"].map((level) => (
            <div key={level}>
              <p className="text-gray-400">{level}</p>
              <p className="font-semibold text-lg">{stats[level]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Solved Problem List */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <h3 className="text-xl font-bold mb-3">Solved Problems</h3>
        <table className="w-full table-auto text-left text-sm">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="py-2 px-4">#</th>
              <th className="py-2 px-4">Title</th>
              <th className="py-2 px-4">Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {solved.map((p, index) => (
              <tr key={p.id} className="hover:bg-gray-800">
                <td className="py-2 px-4">{index + 1}</td>
                <td className="py-2 px-4">{p.title}</td>
                <td className="py-2 px-4">{p.difficulty}</td>
              </tr>
            ))}
            {solved.length === 0 && (
              <tr>
                <td className="py-2 px-4" colSpan="3">
                  No problems solved yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
