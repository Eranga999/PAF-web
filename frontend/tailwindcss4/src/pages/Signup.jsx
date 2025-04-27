import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();
      if (response.ok) {
        navigate("/login"); // Redirect to login after successful signup
      } else {
        setError(data.message || "Signup failed");
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
        <h2 className="text-white text-3xl font-bold text-center mb-6">Sign Up for Cookmate</h2>
        <div onSubmit={handleSignup}>
          <div className="mb-5">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 placeholder-gray-400"
              required
            />
          </div>
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
            onClick={handleSignup}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105"
          >
            Sign Up
          </button>
        </div>
        {error && (
          <p className="text-red-400 text-center mt-3 animate-pulse">{error}</p>
        )}
        <p className="text-white text-center mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
            Login
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

export default Signup;