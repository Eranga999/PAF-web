import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1507521628349-dee9b8e9b4e8')",
      }}
    >
      <div className="bg-black bg-opacity-70 p-8 rounded-xl w-80 text-center shadow-lg border border-cyan-400/30">
        <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-white">
          <span role="img" aria-label="user" className="text-3xl">
            👤
          </span>
        </div>
        <h2 className="text-white text-2xl mb-5">Login to Cookmate</h2>
        <form onSubmit={handleEmailLogin}>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-700 text-white border border-cyan-400/50 focus:outline-none focus:border-cyan-400"
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-700 text-white border border-cyan-400/50 focus:outline-none focus:border-cyan-400"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Login
          </button>
        </form>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        <p className="text-white mt-3">
          <a href="/forgot-password" className="text-cyan-400 hover:underline">
            Forgot password?
          </a>
        </p>
        <div className="mt-5">
          <p className="text-white mb-2">Or login with</p>
          <button
            onClick={handleGoogleLogin}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
          >
            <img src="/google-icon.png" alt="Google Icon" className="w-6 h-6" />
          </button>
        </div>
        <p className="text-cyan-400 mt-5">
          Don't have an account?{" "}
          <a href="/signup" className="text-cyan-400 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;