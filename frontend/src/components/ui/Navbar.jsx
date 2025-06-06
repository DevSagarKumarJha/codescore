import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  User,
  Code,
  CurlyBraces,
  LogOutIcon,
  BracesIcon,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import LogoutButton from "../Buttons/LogoutButton";

const Navbar = () => {
  const { authUser } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);

  const dropdownRef = useRef(null);
  const location = useLocation();

  // Handle mobile menu toggle
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  // Handle scroll direction
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowNavbar(currentScrollY < prevScrollY || currentScrollY < 10);
      setPrevScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollY]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown & mobile menu on route change
  useEffect(() => {
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
  }, [location]);

  return (
    <nav
      className={`z-50 w-full transition-transform duration-300 ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      } sticky top-0`}
    >
      <div className="flex justify-between items-center mx-auto max-w-7xl bg-black/15 shadow-lg shadow-neutral-600/5 backdrop-blur-lg border border-gray-200/10 md:p-4 rounded-sm">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer">
          <span className="text-amber-400 font-bold text-2xl inline-flex justify-center items-center">
            C<BracesIcon size={18} />
            DE SC
            <BracesIcon size={18} />
            RE
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {authUser !== null && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="btn btn-ghost btn-circle avatar"
              >
                <div className="w-10 rounded-full">
                  <img
                    src={
                      authUser?.image ||
                      "https://avatar.iran.liara.run/public/boy"
                    }
                    alt="User Avatar"
                    className="object-cover"
                  />
                </div>
              </button>

              {isDropdownOpen && (
                <ul className="absolute right-0 mt-2 z-[1] p-2 shadow bg-base-100 rounded-box w-52 space-y-3">
                  <li>
                    <p className="text-base font-semibold">{authUser.name}</p>
                    <hr className="border-gray-200/10" />
                  </li>
                  <li>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 hover:bg-primary hover:text-white p-2 rounded"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                  </li>
                  {authUser.role === "ADMIN" && (
                    <li>
                      <Link
                        to="/add-problem"
                        className="flex items-center gap-2 hover:bg-primary hover:text-white p-2 rounded"
                      >
                        <Code className="w-4 h-4" />
                        Add Problem
                      </Link>
                    </li>
                  )}
                  <li>
                    <LogoutButton />
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button className="md:hidden p-2 text-white" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && authUser && (
        <div className="md:hidden bg-base-100 p-4 rounded shadow mt-1 space-y-3">
          <p className="text-base font-semibold text-center">{authUser.name}</p>
          <hr className="border-gray-200/10" />

          <Link
            to="/profile"
            className="flex items-center gap-2 hover:bg-primary hover:text-white p-2 rounded"
          >
            <User size={18} />
            My Profile
          </Link>

          {authUser.role === "ADMIN" && (
            <Link
              to="/add-problem"
              className="flex items-center gap-2 hover:bg-primary hover:text-white p-2 rounded"
            >
              <Code size={18} />
              Add Problem
            </Link>
          )}

          <LogoutButton />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
