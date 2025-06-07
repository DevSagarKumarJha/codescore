import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { useUserStore } from "../store/useUserStore";
import { Avatar } from "../components";

const ProfilePage = () => {
  const { username } = useParams();
  const { user, fetchUser } = useUserStore();

  useEffect(() => {
    fetchUser(username);
  }, [username]);

  if (!user) return <p className="text-center text-white mt-10">Loading...</p>;

  return (
    <div className="p-6 text-white max-w-3xl mx-auto">
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <div className="flex items-center gap-4">
          <Avatar image={user.image || ""} name={user.name}/>
          <div>
            <h2 className="text-xl font-semibold">{user.username}</h2>
            <p className="text-gray-400">{user.email}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-6">
          <div>
            <p className="text-gray-400">Score</p>
            <p className="text-lg font-semibold">{user.score}</p>
          </div>
          <div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
