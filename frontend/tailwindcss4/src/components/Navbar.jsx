import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/hooks/use-auth";
import { 
  ChefHat, 
  Menu, 
  Plus, 
  LogOut, 
  User, 
  BookOpen 
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
    navigate("/");
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
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive("/") ? "border-blue-400 text-white" : "border-transparent text-gray-300 hover:border-gray-500 hover:text-white"}`}
              >
                Home
              </Link>
              <Link 
                to="/community" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive("/community") ? "border-blue-400 text-white" : "border-transparent text-gray-300 hover:border-gray-500 hover:text-white"}`}
              >
                Explore
              </Link>
              <Link 
                to="/learningplan" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive("/learningplan") ? "border-blue-400 text-white" : "border-transparent text-gray-300 hover:border-gray-500 hover:text-white"}`}
              >
                Learning Plans
              </Link>
              <Link 
                to="/culinaryjourney" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive("/culinaryjourney") ? "border-blue-400 text-white" : "border-transparent text-gray-300 hover:border-gray-500 hover:text-white"}`}
              >
                learning plan overview
              </Link>
              <Link 
                //to={`/profile/${user?.id}`} 
                to="/profile"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location.pathname.startsWith("/profile") ? "border-blue-400 text-white" : "border-transparent text-gray-300 hover:border-gray-500 hover:text-white"}`}
              >
                My Profile
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Link 
              to="/" 
              className="ml-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" /> New Post
            </Link>
            <div className="ml-3 relative">
              <button 
                className="h-8 w-8 rounded-full bg-gray-600"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
              <div className={`absolute right-0 mt-2 w-48 bg-gray-700 shadow-lg rounded-md ${dropdownOpen ? "block" : "hidden"}`}>
                <div className="p-2">
                  <div className="flex flex-col p-2">
                    <span className="text-white">{user?.name || user?.username}</span>
                    {user?.name && <span className="text-xs text-gray-400">@{user.username}</span>}
                  </div>
                  <hr className="my-1 border-gray-600" />
                  <Link 
                    to={`/profile/${user?.id}`} 
                    className="w-full text-left p-2 hover:bg-gray-600 flex items-center text-gray-300 hover:text-white"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User className="mr-2 h-4 w-4" /> Profile
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
              className={`block pl-3 pr-4 py-2 ${isActive("/") ? "border-l-4 border-blue-400 text-blue-400 bg-gray-700 font-medium" : "border-l-4 border-transparent text-gray-300 hover:bg-gray-700 hover:text-white"}`}
            >
              Home
            </Link>
            <Link 
              to="/community" 
              className={`block pl-3 pr-4 py-2 ${isActive("/community") ? "border-l-4 border-blue-400 text-blue-400 bg-gray-700 font-medium" : "border-l-4 border-transparent text-gray-300 hover:bg-gray-700 hover:text-white"}`}
            >
              Explore
            </Link>
            <Link 
              to="/learningplan" 
              className={`block pl-3 pr-4 py-2 ${isActive("/learningplan") ? "border-l-4 border-blue-400 text-blue-400 bg-gray-700 font-medium" : "border-l-4 border-transparent text-gray-300 hover:bg-gray-700 hover:text-white"}`}
            >
              Learning Plans
            </Link>
            <Link 
              to={`/profile/${user?.id}`}
              className={`block pl-3 pr-4 py-2 ${location.pathname.startsWith("/profile") ? "border-l-4 border-blue-400 text-blue-400 bg-gray-700 font-medium" : "border-l-4 border-transparent text-gray-300 hover:bg-gray-700 hover:text-white"}`}
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