import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { ChefHat, Menu, LogOut, User, BookOpen, Search, Users, Bell } from "lucide-react";
import { classNames } from "../utils/classNames";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Helper function to check if token is likely valid (not expired)
  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expiry;
    } catch (error) {
      console.error("Navbar - Error decoding token:", error);
      return false;
    }
  };

  // Fetch user and notifications
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token || !isTokenValid(token)) {
        setUser(null);
        setNotificationCount(0);
        if (location.pathname !== "/login" && location.pathname !== "/") {
          navigate("/login", { replace: true });
        }
        return;
      }

      if (user) return;

      try {
        const response = await fetch("http://localhost:8080/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          console.log("Navbar - Fetched user:", data);
          console.log("Navbar - Profile picture URL:", data.profilePictureUrl);
        } else if (response.status === 401) {
          console.error("Navbar - Unauthorized, clearing token");
          localStorage.removeItem("token");
          setUser(null);
          setNotificationCount(0);
          navigate("/login", { replace: true });
        } else {
          console.error("Navbar - Fetch user failed:", response.status);
        }
      } catch (error) {
        console.error("Navbar - Fetch user error:", error);
      }
    };

    const fetchNotificationCount = async () => {
      const token = localStorage.getItem("token");
      if (!token || !isTokenValid(token)) {
        setNotificationCount(0);
        return;
      }

      try {
        const response = await fetch("http://localhost:8080/api/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const notifications = await response.json();
          const unreadCount = notifications.filter((n) => !n.read).length;
          setNotificationCount(unreadCount);
        } else if (response.status === 401) {
          setNotificationCount(0);
        }
      } catch (error) {
        console.error("Navbar - Fetch notifications error:", error);
        setNotificationCount(0);
      }
    };

    fetchUser();
    fetchNotificationCount();
  }, [location.pathname, navigate, user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setNotificationCount(0);
    setDropdownOpen(false);
    navigate("/login", { replace: true });
    console.log("Navbar - User logged out");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gray-800 shadow fixed w-full z-50 top-0">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link
                to="/"
                className="text-blue-400 font-bold text-2xl flex items-center"
              >
                <ChefHat className="mr-2 h-6 w-6" />
                CookSkill
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/")
                    ? "border-blue-400 text-white"
                    : "border-transparent text-gray-300 hover:border-gray-500 hover:text-white"
                }`}
              >
                Home
              </Link>
              <Link
                to="/explore"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/explore")
                    ? "border-blue-400 text-white"
                    : "border-transparent text-gray-300 hover:border-gray-500 hover:text-white"
                }`}
              >
                <Users className="mr-1 h-4 w-4" />
                Explore
              </Link>
              <Link
                to="/learningplan"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/learningplan")
                    ? "border-blue-400 text-white"
                    : "border-transparent text-gray-300 hover:border-gray-500 hover:text-white"
                }`}
              >
                Learning Plans
              </Link>
              <Link
                to="/culinaryjourney"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/culinaryjourney")
                    ? "border-blue-400 text-white"
                    : "border-transparent text-gray-300 hover:border-gray-500 hover:text-white"
                }`}
              >
                Learning Plan Overview
              </Link>
              <Link
                to="/notifications"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium relative ${
                  isActive("/notifications")
                    ? "border-blue-400 text-white"
                    : "border-transparent text-gray-300 hover:border-gray-500 hover:text-white"
                }`}
              >
                <Bell className="mr-1 h-4 w-4" />
                Notifications
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center transform translate-x-1/2 -translate-y-1/2">
                    {notificationCount}
                  </span>
                )}
              </Link>
              <Link
                to="/profile"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/profile")
                    ? "border-blue-400 text-white"
                    : "border-transparent text-gray-300 hover:border-gray-500 hover:text-white"
                }`}
              >
                My Profile
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user && (
              <div className="ml-3 relative">
                <button
                  className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <img
                    src={user.profilePictureUrl}
                    alt="Profile"
                    className="h-8 w-8 object-cover"
                    onError={(e) => {
                      e.target.src = "/default-avatar.png";
                      console.log("Navbar - Profile picture load failed");
                    }}
                  />
                </button>
                <div
                  className={`absolute right-0 mt-2 w-48 bg-gray-700 shadow-lg rounded-md ${
                    dropdownOpen ? "block" : "hidden"
                  }`}
                >
                  <div className="p-2">
                    <div className="flex flex-col p-2">
                      <span className="text-white">{user.name}</span>
                      <span className="text-xs text-gray-400">{user.email}</span>
                    </div>
                    <hr className="my-1 border-gray-600" />
                    <Link
                      to="/profile"
                      className="w-full text-left p-2 hover:bg-gray-600 flex items-center text-gray-300 hover:text-white"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="mr-2 h-4 w-4" /> Profile
                    </Link>
                    <Link
                      to="/notifications"
                      className="w-full text-left p-2 hover:bg-gray-600 flex items-center text-gray-300 hover:text-white"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Bell className="mr-2 h-4 w-4" /> Notifications
                      {notificationCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                          {notificationCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/learningplan"
                      className="w-full text-left p-2 hover:bg-gray-600 flex items-center text-gray-300 hover:text-white"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <BookOpen className="mr-2 h-4 w-4" /> Learning Plans
                    </Link>
                    <hr className="my-1 border-gray-600" />
                    <button
                      className="w-full text-left p-2 hover:bg-gray-600 flex items-center text-gray-300 hover:text-white"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Log out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="sm:hidden flex items-center">
            <button
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-600">
          <div className="pt-2 pb-4 space-y-1">
            <Link
              to="/"
              className={`block pl-3 pr-4 py-2 ${
                isActive("/")
                  ? "border-l-4 border-blue-400 text-blue-400 bg-gray-700 font-medium"
                  : "border-l-4 border-transparent text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Home
            </Link>
            <Link
              to="/explore"
              className={`block pl-3 pr-4 py-2 ${
                isActive("/explore")
                  ? "border-l-4 border-blue-400 text-blue-400 bg-gray-700 font-medium"
                  : "border-l-4 border-transparent text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Explore
            </Link>
            <Link
              to="/learningplan"
              className={`block pl-3 pr-4 py-2 ${
                isActive("/learningplan")
                  ? "border-l-4 border-blue-400 text-blue-400 bg-gray-700 font-medium"
                  : "border-l-4 border-transparent text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Learning Plans
            </Link>
            <Link
              to="/culinaryjourney"
              className={`block pl-3 pr-4 py-2 ${
                isActive("/culinaryjourney")
                  ? "border-l-4 border-blue-400 text-blue-400 bg-gray-700 font-medium"
                  : "border-l-4 border-transparent text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Learning Plan Overview
            </Link>
            <Link
              to="/notifications"
              className={`block pl-3 pr-4 py-2 relative ${
                isActive("/notifications")
                  ? "border-l-4 border-blue-400 text-blue-400 bg-gray-700 font-medium"
                  : "border-l-4 border-transparent text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Notifications
              {notificationCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </Link>
            <Link
              to="/profile"
              className={`block pl-3 pr-4 py-2 ${
                isActive("/profile")
                  ? "border-l-4 border-blue-400 text-blue-400 bg-gray-700 font-medium"
                  : "border-l-4 border-transparent text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              My Profile
            </Link>
            <div className="border-t border-gray-600 pt-2 mt-2">
              <button
                onClick={handleLogout}
                className="block w-full text-left pl-3 pr-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}