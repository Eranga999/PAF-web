import { useState, useEffect, Component } from "react";
import { Calendar, LineChart, GraduationCap, Award, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LearningPlanCard from "../../components/learning/LearningPlanCard.jsx";
import ProgressCard from "../../components/learning/ProgressCard.jsx";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-red-500 p-4">Something went wrong. Please try again.</div>;
    }
    return this.props.children;
  }
}

const CulinaryJourneyPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("plans");
  const [learningPlans, setLearningPlans] = useState([]);
  const [progressUpdates, setProgressUpdates] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  const handleAuthError = () => {
    localStorage.removeItem("token");
    navigate("/login", { 
      state: { 
        message: "Your session has expired. Please log in again.",
        redirectTo: "/learning-journey"
      } 
    });
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      handleAuthError();
      return null;
    }
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingPlans(true);
      setIsLoadingProgress(true);

      const headers = getAuthHeaders();
      if (!headers) return;

      try {
        const plansResponse = await fetch("http://localhost:8080/api/learning-plans", { headers });
        if (!plansResponse.ok) {
          if (plansResponse.status === 401) {
            handleAuthError();
            return;
          }
          throw new Error("Failed to fetch learning plans");
        }
        const plansData = await plansResponse.json();
        setLearningPlans(plansData);

        const progressResponse = await fetch("http://localhost:8080/api/progress-updates/user", { headers });
        if (!progressResponse.ok) {
          if (progressResponse.status === 401) {
            handleAuthError();
            return;
          }
          setProgressUpdates([]);
        } else {
          const progressData = await progressResponse.json();
          setProgressUpdates(progressData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        alert(`Error fetching data: ${error.message}`);
      } finally {
        setIsLoadingPlans(false);
        setIsLoadingProgress(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleProgressUpdate = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const plansResponse = await fetch("http://localhost:8080/api/learning-plans", { headers });
      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        setLearningPlans(plansData);
      } else {
        if (plansResponse.status === 401) {
          handleAuthError();
          return;
        }
        throw new Error("Failed to fetch learning plans");
      }

      const progressResponse = await fetch("http://localhost:8080/api/progress-updates/user", { headers });
      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        setProgressUpdates(progressData);
      } else {
        if (progressResponse.status === 401) {
          handleAuthError();
          return;
        }
        setProgressUpdates([]);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      alert(`Error refreshing data: ${error.message}`);
    }
  };

  const handleDeleteProgressUpdate = async (progressId) => {
    if (window.confirm("Are you sure you want to delete this progress update?")) {
      const headers = getAuthHeaders();
      if (!headers) return;

      try {
        const response = await fetch(`http://localhost:8080/api/progress-updates/${progressId}`, {
          method: "DELETE",
          headers,
        });
        if (response.ok) {
          setProgressUpdates(progressUpdates.filter((progress) => progress.id !== progressId));
          alert("Progress update deleted successfully!");
          await handleProgressUpdate();
        } else {
          if (response.status === 401) {
            handleAuthError();
            return;
          }
          throw new Error("Failed to delete progress update");
        }
      } catch (error) {
        console.error("Error deleting progress update:", error);
        alert(`Error deleting progress update: ${error.message}`);
      }
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        <main className="flex-grow pt-20 md:pt-24 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                Your Culinary Learning Journey
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Track your progress, set goals, and master new cooking skills with personalized learning plans
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center transform hover:scale-105 transition-all duration-300 border border-gray-100">
                <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <Calendar className="h-7 w-7 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Plans</p>
                  <p className="text-2xl font-bold text-gray-900">{learningPlans.length}</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center transform hover:scale-105 transition-all duration-300 border border-gray-100">
                <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <LineChart className="h-7 w-7 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Progress Updates</p>
                  <p className="text-2xl font-bold text-gray-900">{progressUpdates.length}</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center transform hover:scale-105 transition-all duration-300 border border-gray-100">
                <div className="h-14 w-14 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                  <GraduationCap className="h-7 w-7 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Skills Learned</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {progressUpdates.filter((p) => p.progressPercentage >= 100).length}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center transform hover:scale-105 transition-all duration-300 border border-gray-100">
                <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                  <Award className="h-7 w-7 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Achievements</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.min(progressUpdates.length, 3)}</p>
                </div>
              </div>
            </div>

            {/* Tabs and Content */}
            <div className="space-y-8">
              <div className="flex border-b border-gray-200">
                <button
                  id="plans-tab"
                  className={`py-4 px-6 text-lg font-medium relative ${
                    activeTab === "plans"
                      ? "text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("plans")}
                  aria-selected={activeTab === "plans"}
                  role="tab"
                >
                  Learning Plans
                  {activeTab === "plans" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-b"></div>
                  )}
                </button>
                <button
                  id="progress-tab"
                  className={`py-4 px-6 text-lg font-medium relative ${
                    activeTab === "progress"
                      ? "text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("progress")}
                  aria-selected={activeTab === "progress"}
                  role="tab"
                >
                  Progress History
                  {activeTab === "progress" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-b"></div>
                  )}
                </button>
              </div>

              {activeTab === "plans" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <LearningPlanCard 
                      plans={learningPlans} 
                      isLoading={isLoadingPlans} 
                      onProgressUpdate={handleProgressUpdate} 
                    />
                  </div>
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Share Your Progress</h3>
                      <ProgressCard onProgressUpdate={handleProgressUpdate} />
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Learning Tips</h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-blue-600 font-bold">1</span>
                          </div>
                          <p className="text-gray-600">Break complex recipes into simpler steps</p>
                        </div>
                        <div className="flex items-start">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-blue-600 font-bold">2</span>
                          </div>
                          <p className="text-gray-600">Practice knife skills regularly</p>
                        </div>
                        <div className="flex items-start">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-blue-600 font-bold">3</span>
                          </div>
                          <p className="text-gray-600">Document your progress with photos</p>
                        </div>
                        <div className="flex items-start">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-blue-600 font-bold">4</span>
                          </div>
                          <p className="text-gray-600">Seek feedback from other chefs</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "progress" && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Progress History</h3>
                  {isLoadingProgress ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                  ) : progressUpdates.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                      <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-xl font-semibold text-gray-700 mb-2">No Progress Updates Yet</h4>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Start tracking your cooking journey by sharing your progress
                      </p>
                      <ProgressCard onProgressUpdate={handleProgressUpdate} />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {progressUpdates
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((progress) => (
                          <div key={progress.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-blue-200 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">{progress.title}</h4>
                                <p className="text-gray-600">{progress.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="bg-green-500 text-white text-sm px-3 py-1 rounded-full">
                                  {progress.progressPercentage}%
                                </div>
                                <button
                                  id={`delete-progress-${progress.id}`}
                                  onClick={() => handleDeleteProgressUpdate(progress.id)}
                                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                  aria-label={`Delete progress update: ${progress.title}`}
                                >
                                  <Trash2 className="h-5 w-5 text-gray-400 hover:text-red-500" />
                                </button>
                              </div>
                            </div>
                            <div className="mt-4">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                                  style={{ width: `${progress.progressPercentage}%` }}
                                  role="progressbar"
                                  aria-valuenow={progress.progressPercentage}
                                  aria-valuemin="0"
                                  aria-valuemax="100"
                                ></div>
                              </div>
                            </div>
                            {progress.planId && (
                              <div className="mt-3 text-sm text-gray-500">
                                Part of: {learningPlans.find((p) => p.id === progress.planId)?.title || "Learning Plan"}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default CulinaryJourneyPage;