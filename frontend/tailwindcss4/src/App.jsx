import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//learning planpages
import CulinaryJourneyPage from "./pages/learningplan/CulinaryJourneyPage";
import CommunityExplorePage from  "./pages/learningplan/CommunityExplorePage";
import LearningPlanPage from    "./pages/learningplan/LearningPlanPage";

//todo
import Homepage from "./pages/homepage";
function App() {

  return (
    <Router>
    <Routes>
    <Route path="/" element={<Homepage />} />
    <Route path="/culinaryjourney" element={<CulinaryJourneyPage />} />
      <Route path="/community" element={<CommunityExplorePage />} />
      <Route path="/learningplan" element={<LearningPlanPage />} />
    </Routes>
  </Router>
  )
}

export default App
