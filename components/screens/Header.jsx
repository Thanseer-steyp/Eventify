"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [userInitial, setUserInitial] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadUser = () => {
    const firstName = localStorage.getItem("first_name");
    const isSuperUser = localStorage.getItem("is_superuser");
    const token = localStorage.getItem("access");
  
    let initial = "";
  
    if (firstName && firstName.trim() !== "") {
      initial = firstName.charAt(0).toUpperCase();
    } else if (isSuperUser === "true") {
      initial = "A";
    } else {
      initial = "A"; // fallback
    }
  
    setUserInitial(initial);
    setIsAuthenticated(!!token);
  };
  

  const handleLogout = () => {
    localStorage.clear();
    setUserInitial("");
    setIsAuthenticated(false);
    // Notify other components
    window.dispatchEvent(new Event("login-status-changed"));
    router.push("/authentication");
  };

  useEffect(() => {
    loadUser();
    const handleUserChange = () => loadUser();

    window.addEventListener("login-status-changed", handleUserChange);
    return () => {
      window.removeEventListener("login-status-changed", handleUserChange);
    };
  }, []);

  return (
    <header className="bg-[#0b1c2d] w-full py-4 border-b border-gray-700 sticky top-0 z-50">
      <div className="px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <h1>
            <Link href="/">
              <div className="flex items-center">
                <div className="logo mr-4 text-3xl">Eventify</div>
              </div>
            </Link>
          </h1>

          {/* Navigation */}
          <ul className="flex justify-center items-center gap-12">
            <li>
              <Link
                href="/"
                className={`pb-1 border-b-2 ${
                  pathname === "/"
                    ? "text-yellow-400 border-yellow-400"
                    : "text-white border-transparent hover:text-yellow-400"
                }`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/events"
                className={`pb-1 border-b-2 ${
                  pathname === "/events"
                    ? "text-yellow-400 border-yellow-400"
                    : "text-white border-transparent hover:text-yellow-400"
                }`}
              >
                Explore Events
              </Link>
            </li>
            <li>
              <Link
                href="/events/create"
                className={`pb-1 border-b-2 ${
                  pathname === "/events/create"
                    ? "text-yellow-400 border-yellow-400"
                    : "text-white border-transparent hover:text-yellow-400"
                }`}
              >
                Create Events
              </Link>
            </li>
            {isAuthenticated && (
              <li onClick={handleLogout} className="text-white cursor-pointer hover:text-red-500">
                Logout
              </li>
            )}
          </ul>

          {/* Search & Avatar */}
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="flex items-center gap-2 border border-gray-400 p-3 rounded-lg w-[400px]">
              <img src="/glass.svg" alt="Search" className="w-3" />
              <input
                type="text"
                className="focus:outline-none w-full text-white"
                placeholder="Search for events, shows and programmes"
              />
            </div>

            {/* Avatar */}
            {isAuthenticated ? (
              <div className="w-10 h-10 bg-gray-600 text-xl text-white font-bold rounded-full flex items-center justify-center">
                {userInitial}
              </div>
            ) : (
              <Link href="/authentication">
                <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center cursor-pointer">
                  <img src="/user-solid.svg" alt="Login" className="w-5 h-5" />
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
