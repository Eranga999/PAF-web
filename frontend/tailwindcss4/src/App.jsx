import { Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google"; // Add this import

// Learning plan pages
import CulinaryJourneyPage from "./pages/learningplan/CulinaryJourneyPage";
import CommunityExplorePage from "./pages/learningplan/CommunityExplorePage";
import LearningPlanPage from "./pages/learningplan/LearningPlanPage";
import PostCard from "./components/Post/PostCard";
import RecipesPage from "./pages/Recipes/RecipesPage";
import Login from "./pages/login";
// Todo
import Homepage from "./pages/homepage";

function App() {
  return (
    <GoogleOAuthProvider clientId="840520138364-ndr0gm76o7hpr726lkqldl2km2floq0h.apps.googleusercontent.com">
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/culinaryjourney" element={<CulinaryJourneyPage />} />
        <Route path="/community" element={<CommunityExplorePage />} />
        <Route path="/learningplan" element={<LearningPlanPage />} />
        <Route path="/post" element={<PostCard />} />
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;