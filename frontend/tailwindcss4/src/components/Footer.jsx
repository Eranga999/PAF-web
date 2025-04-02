import { ChefHat } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-800 border-t border-gray-600 mt-8 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="flex items-center">
              <ChefHat className="h-5 w-5 text-blue-400 mr-2" />
              <h2 className="text-blue-400 font-display text-xl font-bold">CookSkill</h2>
            </Link>
            <p className="text-gray-400 text-sm">Share your culinary journey with the world</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="#" className="text-gray-400 hover:text-white">
              About
            </Link>
            <Link to="#" className="text-gray-400 hover:text-white">
              Help Center
            </Link>
            <Link to="#" className="text-gray-400 hover:text-white">
              Privacy
            </Link>
            <Link to="#" className="text-gray-400 hover:text-white">
              Terms
            </Link>
          </div>
        </div>
        
        <div className="mt-6 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} CookSkill. All rights reserved.
        </div>
      </div>
    </footer>
  );
}