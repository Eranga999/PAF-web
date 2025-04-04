import { useState, useEffect } from "react";
import { Calendar, LineChart, GraduationCap, Award, Trash2 } from "lucide-react";
import LearningPlanCard from "../../components/learning/LearningPlanCard.jsx";
import ProgressCard from "../../components/learning/ProgressCard.jsx";

// Mock Navbar and Footer (replace with your actual components)
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
const CulinaryJourneyPage = () => {
  const [activeTab, setActiveTab] = useState("plans");
  const [learningPlans, setLearningPlans] = useState([]);
  const [progressUpdates, setProgressUpdates] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  // Fetching data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const plansResponse = await fetch("http://localhost:8080/api/learning-plans");
        if (!plansResponse.ok) {
          throw new Error(`Failed to fetch learning plans: ${plansResponse.status} ${await plansResponse.text()}`);
        }
        const plansData = await plansResponse.json();
        console.log("Fetched learning plans in CulinaryJourneyPage:", plansData);

        const progressResponse = await fetch("http://localhost:8080/api/progress-updates");
        if (!progressResponse.ok) {
          throw new Error(`Failed to fetch progress updates: ${progressResponse.status} ${await progressResponse.text()}`);
        }
        const progressData = await progressResponse.json();
        console.log("Fetched progress updates in CulinaryJourneyPage:", progressData);

        setLearningPlans(plansData);
        setProgressUpdates(progressData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoadingPlans(false);
        setIsLoadingProgress(false);
      }
    };

    fetchData();
  }, []);

  // Function to refresh data when a progress update is shared or deleted
  const handleProgressUpdate = () => {
    const fetchData = async () => {
      try {
        const plansResponse = await fetch("http://localhost:8080/api/learning-plans");
        if (plansResponse.ok) {
          const plansData = await plansResponse.json();
          setLearningPlans(plansData);
        }

        const progressResponse = await fetch("http://localhost:8080/api/progress-updates");
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          setProgressUpdates(progressData);
        }
      } catch (error) {
        console.error("Error refreshing data:", error);
      }
    };
    fetchData();
  };

  // Function to delete a progress update
  const handleDeleteProgressUpdate = async (progressId) => {
    if (window.confirm("Are you sure you want to delete this progress update?")) {
      try {
        const response = await fetch(`http://localhost:8080/api/progress-updates/${progressId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          // Remove the progress update from the state
          setProgressUpdates(progressUpdates.filter((progress) => progress.id !== progressId));
          // Refresh learning plans to update progress percentages
          const plansResponse = await fetch("http://localhost:8080/api/learning-plans");
          if (plansResponse.ok) {
            const plansData = await plansResponse.json();
            setLearningPlans(plansData);
          }
        } else {
          console.error("Failed to delete progress update:", response.status, await response.text());
          alert("Failed to delete progress update. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting progress update:", error);
        alert("Error deleting progress update. Please check if the backend server is running and try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />

      <main className="flex-grow pt-20 md:pt-24 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Culinary Learning Journey</h1>
            <p className="text-gray-600">Track your progress, set goals, and master new cooking skills</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Plans</p>
                <p className="text-2xl font-bold">{learningPlans.length}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                <LineChart className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Progress Updates</p>
                <p className="text-2xl font-bold">{progressUpdates.length}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                <GraduationCap className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Skills Learned</p>
                <p className="text-2xl font-bold">
                  {progressUpdates.filter((p) => p.progressPercentage >= 100).length}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <Award className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Achievements</p>
                <p className="text-2xl font-bold">{Math.min(progressUpdates.length, 3)}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="space-y-6">
            <div className="flex border-b">
              <button
                className={`py-3 px-6 text-gray-500 ${activeTab === "plans" ? "border-b-2 border-blue-500 text-blue-500" : "hover:text-gray-700 hover:border-gray-300"}`}
                onClick={() => setActiveTab("plans")}
              >
                Learning Plans
              </button>
              <button
                className={`py-3 px-6 text-gray-500 ${activeTab === "progress" ? "border-b-2 border-blue-500 text-blue-500" : "hover:text-gray-700 hover:border-gray-300"}`}
                onClick={() => setActiveTab("progress")}
              >
                Progress History
              </button>
            </div>

            {/* Plans Tab */}
            {activeTab === "plans" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <LearningPlanCard plans={learningPlans} isLoading={isLoadingPlans} onProgressUpdate={handleProgressUpdate} />
                </div>
                <div>
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6">
                      <h3 className="text-lg font-bold">Share Progress</h3>
                    </div>
                    <div className="p-6 pt-0">
                      <ProgressCard onProgressUpdate={handleProgressUpdate} />
                      <div className="mt-6 bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-sm mb-2">Tips for Effective Learning</h4>
                        <ul className="text-sm text-gray-600 space-y-2">
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            Break complex recipes into simpler steps
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            Practice knife skills regularly
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            Document your progress with photos
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            Seek feedback from other chefs
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Progress Tab */}
            {activeTab === "progress" && (
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6">
                  <h3 className="text-lg font-bold">Progress History</h3>
                </div>
                <div className="p-6 pt-0">
                  {isLoadingProgress ? (
                    <div className="flex justify-center py-6">
                      <div className="animate-spin h-6 w-6 border-t-2 border-blue-500 rounded-full"></div>
                    </div>
                  ) : progressUpdates.length === 0 ? (
                    <div className="text-center py-8 border border-dashed rounded-lg">
                      <Award className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">You haven't shared any progress updates yet</p>
                      <p className="text-sm text-gray-400 mt-1 mb-4">Track your cooking journey by sharing your progress</p>
                      <ProgressCard onProgressUpdate={handleProgressUpdate} />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {progressUpdates
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((progress) => (
                          <div key={progress.id} className="border rounded-lg p-4 relative">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{progress.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{progress.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                  {progress.progressPercentage}%
                                </div>
                                <button
                                  onClick={() => handleDeleteProgressUpdate(progress.id)}
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <Trash2 className="h-4 w-4 text-gray-500" />
                                </button>
                              </div>
                            </div>
                            <div className="mt-3">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${progress.progressPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                            {progress.planId && (
                              <div className="mt-2 text-xs text-gray-500">
                                Part of: {learningPlans.find((p) => p.id === progress.planId)?.title || "Learning Plan"}
                              </div>
                            )}
                       
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CulinaryJourneyPage;