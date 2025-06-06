import { ArrowBigLeft, ArrowRight, BracesIcon } from "lucide-react";
import { AuthImagePattern } from "../components";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";



const HomePage = () => {
  const {authUser, isCheckingAuth} = useAuthStore();
  return (
    <div className="min-h-screen flex flex-col items-center px-4">

      <div className="grid sm:grid-cols-2 ">
        <div className="flex flex-col p-2 justify-center items-center">
          <h1 className="text-4xl font-extrabold z-10 text-center">
            Welcome to{" "}
            <span className="animate-pulse text-amber-400 inline-flex justify-center items-center">
              C<BracesIcon size={32} />
              DE SC
              <BracesIcon size={32} />
              RE
            </span>
          </h1>

          <p className="mt-4 text-center text-lg font-semibold text-gray-500 dark:text-gray-400 z-10">
            A Platform Inspired by Leetcode which helps you to prepare for
            coding interviews and helps you to improve your coding skills by
            solving coding problems
          </p>

         {authUser === null && ( <div className="flex mt-10">
            <Link className=" font-semibold md:text-2xl py-3 px-4 rounded inline-flex bg-amber-800 justify-center items-center hover:opacity-85 gap-1" to="/signup">Create Account <ArrowRight/></Link>
          </div>)}

         {authUser !== null && ( <div className="flex mt-10">
            <Link className=" font-semibold md:text-2xl py-3 px-4 rounded inline-flex justify-center items-center gap-1 bg-amber-800 hover:opacity-85" to="/problems">Practice <ArrowRight/></Link>
          </div>)}
        </div>

        <AuthImagePattern/>
      </div>
    </div>
  );
};

export default HomePage;
