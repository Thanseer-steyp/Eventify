"use client";

import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, User, Mail, Lock, UserCheck } from "lucide-react";

function Authentication() {
  const [isLogin, setIsLogin] = useState(true);
  const [firstname, setFirstname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setUsername("");
    setPassword("");
    setEmail("");
    setFirstname("");
    setShowPassword(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await axios.post("http://localhost:8000/api/v1/auth/signup/", {
        first_name: firstname,
        username,
        email,
        password,
      });

      toast.success("Account created successfully! Please log in.");
      setIsLogin(true);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Signup failed. Please try again.";

      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await axios.post("http://localhost:8000/api/v1/auth/login/", {
        username,
        password,
      });

      const { access, refresh, user } = res.data;

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      if (user?.first_name) localStorage.setItem("first_name", user.first_name);
      if (user?.username) localStorage.setItem("username", user.username);

      window.dispatchEvent(new Event("login-status-changed"));
      
      setTimeout(() => {
        router.push("/");
      }, 200);
    } catch (err) {
      toast.error("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-indigo-500 rounded-full opacity-10 blur-3xl"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            >
              <UserCheck className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-slate-300">
              {isLogin ? "Sign in to continue to your account" : "Join us and start your journey"}
            </p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex mb-8 bg-white/5 backdrop-blur-sm rounded-xl p-1 border border-white/10">
            <button
              onClick={() => setIsLogin(true)}
              className={`w-1/2 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                isLogin
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`w-1/2 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                !isLogin
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.form
                key="login"
                onSubmit={handleLogin}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {/* Username Field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Password Field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-12 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Toggle Link */}
                <p className="text-center text-slate-300 text-sm">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={toggleForm}
                    className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors"
                  >
                    Create one
                  </button>
                </p>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                onSubmit={handleSignup}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {/* Name Field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Email Field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Username Field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserCheck className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Password Field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-12 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Toggle Link */}
                <p className="text-center text-slate-300 text-sm">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={toggleForm}
                    className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors"
                  >
                    Sign in
                  </button>
                </p>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
      </motion.div>

      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        theme="dark"
        toastStyle={{
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      />
    </div>
  );
}

export default Authentication;