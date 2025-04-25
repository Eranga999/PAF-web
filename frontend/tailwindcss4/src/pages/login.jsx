import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("Login.jsx - Location:", location.pathname, location.search);
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const error = params.get("error");
    console.log("Login.jsx - Token:", token);
    console.log("Login.jsx - Error:", error);

    if (token) {
      console.log("Login.jsx - Saving token:", token.substring(0, 10) + "...");
      localStorage.setItem("token", token);
      console.log("Login.jsx - Navigating to /");
      navigate("/", { replace: true });
    } else if (error) {
      console.error("Login.jsx - Error:", error);
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
    } else {
      console.log("Login.jsx - No token, staying on /login");
      localStorage.removeItem("token");
    }
  }, [location, navigate]);

  const handleGoogleLogin = () => {
    console.log("Login.jsx - Starting Google OAuth");
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        navigate("/", { replace: true });
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900 p-4">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl w-full max-w-md shadow-2xl border border-white/20 animate-fadeIn">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center border-4 border-white/30 transform hover:scale-110 transition-transform duration-300">
            <span role="img" aria-label="user" className="text-4xl">
              👤
            </span>
          </div>
        </div>
        <h2 className="text-white text-3xl font-bold text-center mb-6">Welcome to Cookmate</h2>
        <div onSubmit={handleEmailLogin}>
          <div className="mb-5">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-gray-400"
              required
            />
          </div>
          <div className="mb-5">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-gray-400"
              required
            />
          </div>
          <button
            onClick={handleEmailLogin}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105"
          >
            Login
          </button>
        </div>
        {error && (
          <p className="text-red-400 text-center mt-3 animate-pulse">{error}</p>
        )}
        <p className="text-white text-center mt-4">
          <a href="/forgot-password" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
            Forgot password?
          </a>
        </p>
        <div className="mt-6">
          <p className="text-white text-center mb-3">Or login with</p>
          <div className="flex justify-center">
            <button
              onClick={handleGoogleLogin}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-md"
            >
              <FcGoogle className="w-7 h-7" />
            </button>
          </div>
        </div>
        <p className="text-white text-center mt-6">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
            Sign Up
          </a>
        </p>
      </div>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;