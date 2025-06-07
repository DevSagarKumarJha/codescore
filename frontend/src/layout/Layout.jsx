import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../components";

const Layout = () => {
  return (
    <div className="w-full h-full">
      <div className="fixed top-6 left-10  w-1/6 h-1/4  bg-amber-500 opacity-25 blur-3xl rounded-full"></div>
      <Navbar />
      <Outlet />

      <div className="fixed right-0 w-1/6 h-1/4 bg-orange-800 opacity-30 blur-3xl rounded-full bottom-6"></div>
    </div>
  );
};

export default Layout;
