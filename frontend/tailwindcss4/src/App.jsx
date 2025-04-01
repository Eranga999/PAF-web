import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//learning planpages
import CulinaryJourneyPage from "./pages/learningplan/CulinaryJourneyPage";
import CommunityExplorePage from  "./pages/learningplan/CommunityExplorePage";
import LearningPlanPage from    "./pages/learningplan/LearningPlanPage";
import AddPostForm from "./components/AddPostForm";
function App() {

  return (
    <Router>
    <Routes>

      <Route path="/" element={<CulinaryJourneyPage />} />

      <Route path="/community" element={<CommunityExplorePage />} />
      <Route path="/learningplan" element={<LearningPlanPage />} />
      
      <Route path="/community" element={<CommunityExplorePage />} />
      <Route path="/profile" element={<AddPostForm />} />


    </Routes>
  </Router>
  )
}

export default App
