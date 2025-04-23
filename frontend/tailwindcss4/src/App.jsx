import { Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Learning plan pages
import CulinaryJourneyPage from "./pages/learningplan/CulinaryJourneyPage";
import CommunityExplorePage from "./pages/learningplan/CommunityExplorePage";
import LearningPlanPage from "./pages/learningplan/LearningPlanPage";
import RecipesPage from "./pages/Recipes/RecipesPage";
import Login from "./pages/login";
import ProfilePage from "./pages/ProfilePage";
import Homepage from "./pages/homepage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/culinaryjourney" element={<CulinaryJourneyPage />} />
      <Route path="/community" element={<CommunityExplorePage />} />
      <Route path="/learningplan" element={<LearningPlanPage />} />
      <Route path="/recipes" element={<RecipesPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}

export default App;