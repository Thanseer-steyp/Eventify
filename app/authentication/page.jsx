"use client";

import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";

function Authentication() {
  const [isLogin, setIsLogin] = useState(true);
  const [firstname, setFirstname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const toggleForm = () => {
    setIsLogin(!isLogin);
    // Clear fields
    setUsername("");
    setPassword("");
    setEmail("");
    setFirstname("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/signup/", {
        first_name: firstname,
        username,
        email,
        password,
      });

      toast.success("Signup Successful. Please log in.");
      setIsLogin(true);
    } catch (err) {
      const error = err?.response?.data;
      toast.error(error?.detail || "Signup failed. Please try again.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/login/", {
        username,
        password,
      });

      const { access, refresh, user } = res.data;

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      if (user?.first_name) localStorage.setItem("first_name", user.first_name);
      if (user?.last_name) localStorage.setItem("last_name", user.last_name);

      window.dispatchEvent(new Event("login-status-changed"));

      router.push("/");
    } catch (err) {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[#131d30]">
      <div className="w-[430px] h-max bg-[#081522] text-white p-6 rounded-xl shadow-lg">
        <div className="flex mb-6 bg-[#142435] rounded-lg p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`w-1/2 py-2 text-lg font-semibold rounded-lg transition-all duration-300 ${
              isLogin
                ? "bg-yellow-400 text-black shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`w-1/2 py-2 text-lg font-semibold rounded-lg transition-all duration-300 ${
              !isLogin
                ? "bg-yellow-400 text-black shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Signup
          </button>
        </div>

        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.form
              key="login"
              onSubmit={handleLogin}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2 rounded bg-[#142435] text-white placeholder-gray-400 focus:outline-none"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded bg-[#142435] text-white placeholder-gray-400 focus:outline-none"
              />
              <p className="text-sm text-white">
                Don’t have an account?{" "}
                <button
                  type="button"
                  onClick={toggleForm}
                  className="text-yellow-400 hover:underline"
                >
                  Sign up
                </button>
              </p>
              <button
                type="submit"
                className="w-full py-2 bg-yellow-400 text-black font-semibold rounded"
              >
                Log in
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="signup"
              onSubmit={handleSignup}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <input
                type="text"
                placeholder="Name"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                required
                className="w-full px-4 py-2 rounded bg-[#142435] text-white placeholder-gray-400 focus:outline-none"
              />
              <input
                type="email"
                placeholder="Gmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 rounded bg-[#142435] text-white placeholder-gray-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2 rounded bg-[#142435] text-white placeholder-gray-400 focus:outline-none"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded bg-[#142435] text-white placeholder-gray-400 focus:outline-none"
              />
              <p className="text-sm text-white">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={toggleForm}
                  className="text-yellow-400 hover:underline"
                >
                  Log in
                </button>
              </p>
              <button
                type="submit"
                className="w-full py-2 bg-yellow-400 text-black font-semibold rounded"
              >
                Create Account
              </button>
            </motion.form>
          )}
        </AnimatePresence>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
}

export default Authentication;
