import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isValid } from "date-fns";
import {
  PlusCircle,
  ChefHat,
  Loader2,
  Calendar as CalendarIcon,
  Check,
  XCircle,
  Edit,
  Trash2,
  Copy,
  Info,
  Globe,
  Search,
  Grid,
  List,
  Filter,
  ChevronLeft,
  ChevronRight,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";

// Define the form schema
const learningPlanFormSchema = z.object({
  title: z.string().min(3, "Learning Plan Name must be at least 3 characters"),
  description: z.string().min(10, "Plan Overview must be at least 10 characters"),
  topics: z
    .array(
      z.object({
        title: z.string().min(1, "Topic or skill name is required"),
        description: z.string().optional(),
        completed: z.boolean().default(false),
      })
    )
    .min(1, "Add at least one topic or skill"),
  startDate: z.string().optional(),
  estimatedEndDate: z.string().optional(),
  isPublic: z.boolean().default(false),
});

const LearningPlanPage = () => {
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [activeTab, setActiveTab] = useState("my-plans");
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [userPlans, setUserPlans] = useState([]);
  const [communityPlans, setCommunityPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterProgress, setFilterProgress] = useState("all");
  const itemsPerPage = 9;

  const form = useForm({
    resolver: zodResolver(learningPlanFormSchema),
    defaultValues: {
      title: "",
      description: "",
      topics: [{ title: "", description: "", completed: false }],
      startDate: "",
      estimatedEndDate: "",
      isPublic: false,
    },
  });

  const fetchUserPlans = async (token) => {
    try {
      const response = await fetch("http://localhost:8080/api/learning-plans", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
          return false;
        }
        throw new Error(`Failed to fetch user plans: ${errorText}`);
      }
      const plans = await response.json();
      setUserPlans(plans);
      return true;
    } catch (err) {
      console.error("Error fetching user plans:", err);
      setError(`Failed to load user plans: ${err.message}`);
      return false;
    }
  };

  const fetchCommunityPlans = async (token) => {
    try {
      const response = await fetch("http://localhost:8080/api/learning-plans/public", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
          return false;
        }
        throw new Error(`Failed to fetch community plans: ${errorText}`);
      }
      const plans = await response.json();
      setCommunityPlans(plans);
      return true;
    } catch (err) {
      console.error("Error fetching community plans:", err);
      setError(`Failed to load community plans: ${err.message}`);
      return false;
    }
  };

  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoadingPlans(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to view your learning plans.");
          navigate("/login");
          return;
        }

        await Promise.all([fetchUserPlans(token), fetchCommunityPlans(token)]);
      } catch (err) {
        console.error("Error fetching plans:", err);
        setError(`Failed to load plans: ${err.message}`);
      } finally {
        setIsLoadingPlans(false);
      }
    };
    fetchPlans();
  }, [navigate]);

  const onSubmit = async (data) => {
    const method = isEditingPlan ? "PUT" : "POST";
    const url = isEditingPlan
      ? `http://localhost:8080/api/learning-plans/${currentPlanId}`
      : "http://localhost:8080/api/learning-plans";

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to create or update plans.");
        navigate("/login");
        return;
      }

      console.log("Token being sent:", token.substring(0, 10) + "...");
      console.log("Editing plan ID:", currentPlanId);
      const payload = {
        title: data.title,
        description: data.description,
        progress: isEditingPlan ? undefined : 0,
        topics: data.topics,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        estimatedEndDate: data.estimatedEndDate ? new Date(data.estimatedEndDate).toISOString() : undefined,
        isPublic: data.isPublic,
      };
      console.log("Sending payload:", payload);

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        try {
          const errorJson = JSON.parse(errorText);
          if (response.status === 401 && errorJson.error.toLowerCase().includes("expired")) {
            setError("Session expired. Please log in again.");
            localStorage.removeItem("token");
            navigate("/login");
            return;
          }
          if (response.status === 401) {
            setError("Authentication failed: " + errorJson.error);
            return;
          }
          if (response.status === 403) {
            setError("You are not authorized to edit this plan.");
            return;
          }
          setError(`Failed to ${isEditingPlan ? "update" : "create"} learning plan: ${errorJson.error || errorText}`);
        } catch (e) {
          setError(`Failed to ${isEditingPlan ? "update" : "create"} learning plan: ${errorText}`);
        }
        return;
      }

      const updatedPlan = await response.json();
      console.log("Plan updated/created:", updatedPlan);

      await Promise.all([fetchUserPlans(token), fetchCommunityPlans(token)]);

      setIsCreatingPlan(false);
      setIsEditingPlan(false);
      setCurrentPlanId(null);
      form.reset();
      setSelectedStartDate("");
      setSelectedEndDate("");
      setError(null);
    } catch (err) {
      console.error("Error submitting learning plan:", err);
      setError(`Failed to ${isEditingPlan ? "update" : "create"} your learning plan: ${err.message}`);
    }
  };

  const addTopic = () => {
    const currentTopics = form.getValues("topics");
    form.setValue("topics", [
      ...currentTopics,
      { title: "", description: "", completed: false },
    ]);
  };

  const removeTopic = (index) => {
    const currentTopics = form.getValues("topics");
    form.setValue("topics", currentTopics.filter((_, i) => i !== index));
  };

  const toggleTopicCompletion = async (planId, topicIndex) => {
    const plan = userPlans.find((p) => p.id === planId);
    if (!plan) return;

    const updatedTopics = [...plan.topics];
    updatedTopics[topicIndex].completed = !updatedTopics[topicIndex].completed;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to update plans.");
        navigate("/login");
        return;
      }

      const response = await fetch(`http://localhost:8080/api/learning-plans/${planId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...plan,
          topics: updatedTopics,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        if (response.status === 403) {
          setError("You are not authorized to edit this plan.");
          return;
        }
        throw new Error(`Failed to update topic completion: ${errorText}`);
      }

      const totalTopics = updatedTopics.length;
      const completedTopics = updatedTopics.filter((t) => t.completed).length;
      const progressPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

      const progressResponse = await fetch("http://localhost:8080/api/progress-updates", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          progressPercentage,
        }),
      });

      if (!progressResponse.ok) {
        const errorText = await progressResponse.text();
        if (progressResponse.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        throw new Error(`Failed to create progress update: ${errorText}`);
      }

      await Promise.all([fetchUserPlans(token), fetchCommunityPlans(token)]);
    } catch (err) {
      console.error("Error toggling topic completion:", err);
      setError(`Failed to update topic completion: ${err.message}`);
    }
  };

  const copyPlan = async (plan) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to copy plans.");
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:8080/api/learning-plans", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: plan.title,
          description: plan.description,
          progress: 0,
          topics: plan.topics.map((topic) => ({
            title: topic.title,
            description: topic.description,
            completed: false,
          })),
          startDate: plan.startDate,
          estimatedEndDate: plan.estimatedEndDate,
          isPublic: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        throw new Error(`Failed to copy plan: ${errorText}`);
      }

      // Immediately refresh the plans
      await Promise.all([fetchUserPlans(token), fetchCommunityPlans(token)]);
      
      // Switch to my-plans tab
      setActiveTab("my-plans");
      
      // Show success message with animation
      setShowSuccessMessage(true);
      setError(null);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);

    } catch (err) {
      console.error("Error copying plan:", err);
      setError(`Failed to copy the plan: ${err.message}`);
    }
  };

  const deletePlan = async (planId) => {
    if (!window.confirm("Are you sure you want to delete this learning plan?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to delete plans.");
        navigate("/login");
        return;
      }

      const response = await fetch(`http://localhost:8080/api/learning-plans/${planId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        if (response.status === 403) {
          setError("You are not authorized to delete this plan.");
          return;
        }
        throw new Error(`Failed to delete plan: ${errorText}`);
      }

      // Immediately refresh both user plans and community plans
      await Promise.all([fetchUserPlans(token), fetchCommunityPlans(token)]);
      
      // Show success message with animation
      setShowSuccessMessage(true);
      setError(null);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);

    } catch (err) {
      console.error("Error deleting plan:", err);
      setError(`Failed to delete the plan: ${err.message}`);
    }
  };

  const editPlan = (plan) => {
    setIsCreatingPlan(true);
    setIsEditingPlan(true);
    setCurrentPlanId(plan.id);

    const startDate = plan.startDate ? new Date(plan.startDate) : null;
    const endDate = plan.estimatedEndDate ? new Date(plan.estimatedEndDate) : null;

    const startDateStr = startDate && isValid(startDate) ? startDate.toISOString().split("T")[0] : "";
    const endDateStr = endDate && isValid(endDate) ? endDate.toISOString().split("T")[0] : "";

    form.reset({
      title: plan.title || "",
      description: plan.description || "",
      topics: plan.topics && plan.topics.length > 0 ? plan.topics : [{ title: "", description: "", completed: false }],
      startDate: startDateStr,
      estimatedEndDate: endDateStr,
      isPublic: plan.isPublic || false,
    });

    setSelectedStartDate(startDateStr);
    setSelectedEndDate(endDateStr);
  };

  const safeFormatDate = (dateString, dateFormat) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return isValid(date) ? format(date, dateFormat) : "Not set";
  };

  const filterPlans = (plans) => {
    return plans
      .filter(plan => {
        // Search filter
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = plan.title.toLowerCase().includes(searchLower) ||
          plan.description.toLowerCase().includes(searchLower) ||
          plan.topics.some(topic => topic.title.toLowerCase().includes(searchLower));

        // Progress filter
        let progressMatch = true;
        if (filterProgress === "notStarted") {
          progressMatch = plan.progress === 0;
        } else if (filterProgress === "inProgress") {
          progressMatch = plan.progress > 0 && plan.progress < 100;
        } else if (filterProgress === "completed") {
          progressMatch = plan.progress === 100;
        }

        return matchesSearch && progressMatch;
      })
      .sort((a, b) => {
        if (sortBy === "date") {
          const dateA = new Date(a.startDate || 0);
          const dateB = new Date(b.startDate || 0);
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        } else if (sortBy === "progress") {
          return sortOrder === "asc" 
            ? (a.progress || 0) - (b.progress || 0)
            : (b.progress || 0) - (a.progress || 0);
        } else {
          return sortOrder === "asc"
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        }
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <Navbar />
      {showSuccessMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5" />
            <span>Plan copied successfully!</span>
          </div>
        </div>
      )}

      <div className="pt-20">
        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-50 rounded-full px-4 py-2 mb-4">
              <span className="text-blue-600 font-medium">Learning Journey</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              My Learning Plans
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create, manage, and track your culinary learning journey with personalized plans
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                className={`px-8 py-4 text-lg font-medium relative group ${
                  activeTab === "my-plans"
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("my-plans")}
              >
                <span className="relative z-10">My Plans</span>
                {activeTab === "my-plans" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-b transform transition-transform duration-300"></div>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-100 rounded-b transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </button>
              <button
                className={`px-8 py-4 text-lg font-medium relative group ${
                  activeTab === "explore"
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("explore")}
              >
                <span className="relative z-10">Explore Community Plans</span>
                {activeTab === "explore" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-b transform transition-transform duration-300"></div>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-100 rounded-b transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </button>
            </div>

            {/* Create Plan Button */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setIsCreatingPlan(true);
                  setIsEditingPlan(false);
                  setCurrentPlanId(null);
                  form.reset();
                  setSelectedStartDate("");
                  setSelectedEndDate("");
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                aria-label="Create a new learning plan"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Add New Plan
              </button>
            </div>

            {/* Content Area */}
            {activeTab === "my-plans" && (
              <div className="space-y-8">
                {/* Search and Filters Bar */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                    {/* Search */}
                    <div className="relative w-full md:w-96">
                      <input
                        type="text"
                        placeholder="Search plans..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>

                    {/* View Mode and Sort Controls */}
                    <div className="flex items-center gap-4">
                      {/* View Mode Toggle */}
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setViewMode("grid")}
                          className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                          aria-label="Grid view"
                        >
                          <Grid className="h-5 w-5 text-gray-600" />
                        </button>
                        <button
                          onClick={() => setViewMode("list")}
                          className={`p-2 rounded-lg ${viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                          aria-label="List view"
                        >
                          <List className="h-5 w-5 text-gray-600" />
                        </button>
                      </div>

                      {/* Sort Controls */}
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="date">Sort by Date</option>
                        <option value="progress">Sort by Progress</option>
                        <option value="title">Sort by Title</option>
                      </select>

                      <button
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        aria-label="Toggle sort order"
                      >
                        {sortOrder === "asc" ? (
                          <SortAsc className="h-5 w-5 text-gray-600" />
                        ) : (
                          <SortDesc className="h-5 w-5 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Progress Filter */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilterProgress("all")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filterProgress === "all"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      All Plans
                    </button>
                    <button
                      onClick={() => setFilterProgress("notStarted")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filterProgress === "notStarted"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Not Started
                    </button>
                    <button
                      onClick={() => setFilterProgress("inProgress")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filterProgress === "inProgress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => setFilterProgress("completed")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filterProgress === "completed"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Completed
                    </button>
                  </div>
                </div>

                {isLoadingPlans ? (
                  <div className="flex justify-center py-16">
                    <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 rounded-2xl p-8 text-center shadow-md">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <XCircle className="h-6 w-6 text-red-500" />
                      <p className="text-red-600 text-lg font-medium">{error}</p>
                    </div>
                  </div>
                ) : userPlans.length > 0 ? (
                  <>
                    {/* Plans Grid/List */}
                    {viewMode === "grid" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filterPlans(userPlans)
                          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                          .map((plan) => (
                            <div
                              key={plan.id}
                              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div className="space-y-4">
                                  <div>
                                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{plan.title}</h3>
                                    <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                                    {plan.isPublic && (
                                      <div className="mt-2 inline-flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                        <Globe className="h-3 w-3 mr-1" />
                                        Public
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex justify-between items-center mb-2">
                                      <h4 className="text-sm font-medium text-gray-700">Progress</h4>
                                      <span className="text-sm font-medium text-blue-600">{plan.progress ?? 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                      <div
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                                        style={{ width: `${plan.progress ?? 0}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Topics to Learn</h4>
                                    <div className="space-y-2">
                                      {plan.topics && plan.topics.map((topic, index) => (
                                        <div key={index} className="flex items-center justify-between group/topic">
                                          <div className="flex items-center gap-3">
                                            <button
                                              onClick={() => toggleTopicCompletion(plan.id, index)}
                                              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                              aria-label={topic.completed ? `Mark ${topic.title} as incomplete` : `Mark ${topic.title} as complete`}
                                            >
                                              {topic.completed ? (
                                                <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white">
                                                  <Check className="h-3 w-3" />
                                                </div>
                                              ) : (
                                                <div className="h-5 w-5 border-2 border-gray-300 rounded-full group-hover/topic:border-blue-400 transition-colors"></div>
                                              )}
                                            </button>
                                            <span className={`text-sm ${topic.completed ? "line-through text-gray-500" : "text-gray-800 group-hover/topic:text-blue-600"} transition-colors`}>
                                              {topic.title}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  {(plan.startDate || plan.estimatedEndDate) && (
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-700 mb-2">Timeline</h4>
                                      <div className="text-gray-600 text-sm flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                                        <span>
                                          {safeFormatDate(plan.startDate, "MMM d, yyyy")}
                                          {plan.estimatedEndDate && safeFormatDate(plan.estimatedEndDate, "MMM d, yyyy") ? ` - ${safeFormatDate(plan.estimatedEndDate, "MMM d, yyyy")}` : ""}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => editPlan(plan)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    aria-label={`Edit ${plan.title} plan`}
                                  >
                                    <Edit className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => deletePlan(plan.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    aria-label={`Delete ${plan.title} plan`}
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filterPlans(userPlans)
                          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                          .map((plan) => (
                            <div
                              key={plan.id}
                              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                      {plan.title}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => editPlan(plan)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        aria-label={`Edit ${plan.title} plan`}
                                      >
                                        <Edit className="h-5 w-5" />
                                      </button>
                                      <button
                                        onClick={() => deletePlan(plan.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        aria-label={`Delete ${plan.title} plan`}
                                      >
                                        <Trash2 className="h-5 w-5" />
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                                  <div className="flex items-center gap-4 mb-4">
                                    <div className="flex-1">
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-700">Progress</span>
                                        <span className="text-sm font-medium text-blue-600">{plan.progress ?? 0}%</span>
                                      </div>
                                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <div
                                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                                          style={{ width: `${plan.progress ?? 0}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                    {plan.isPublic && (
                                      <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                        <Globe className="h-3 w-3 mr-1" />
                                        Public
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-gray-600 text-sm flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                                    <span>
                                      {safeFormatDate(plan.startDate, "MMM d, yyyy")}
                                      {plan.estimatedEndDate && safeFormatDate(plan.estimatedEndDate, "MMM d, yyyy") 
                                        ? ` - ${safeFormatDate(plan.estimatedEndDate, "MMM d, yyyy")}` 
                                        : ""}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Pagination */}
                    {filterPlans(userPlans).length > itemsPerPage && (
                      <div className="flex justify-center items-center gap-4 mt-8">
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Previous page"
                        >
                          <ChevronLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <span className="text-gray-600">
                          Page {currentPage} of {Math.ceil(filterPlans(userPlans).length / itemsPerPage)}
                        </span>
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage >= Math.ceil(filterPlans(userPlans).length / itemsPerPage)}
                          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Next page"
                        >
                          <ChevronRight className="h-5 w-5 text-gray-600" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ChefHat className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-medium text-gray-700 mb-3">No Learning Plans Yet</h3>
                    <p className="text-gray-500 mb-6 text-lg">Create your first learning plan to track your cooking skills progress.</p>
                    <button
                      onClick={() => setIsCreatingPlan(true)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                      aria-label="Create your first learning plan"
                    >
                      Create Your First Plan
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "explore" && (
              <div className="space-y-8">
                {isLoadingPlans ? (
                  <div className="flex justify-center py-16">
                    <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 rounded-2xl p-8 text-center shadow-md">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <XCircle className="h-6 w-6 text-red-500" />
                      <p className="text-red-600 text-lg font-medium">{error}</p>
                    </div>
                  </div>
                ) : communityPlans.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {communityPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{plan.title}</h3>
                              <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                              <p className="text-gray-500 text-sm mt-1">Created by: {plan.userEmail}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Topics to Learn</h4>
                              <div className="space-y-2">
                                {plan.topics && plan.topics.map((topic, index) => (
                                  <div key={index} className="flex items-center gap-3">
                                    <div className="h-5 w-5 border-2 border-gray-300 rounded-full"></div>
                                    <span className="text-sm text-gray-800">{topic.title}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            {(plan.startDate || plan.estimatedEndDate) && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Timeline</h4>
                                <div className="text-gray-600 text-sm flex items-center gap-2">
                                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                                  <span>
                                    {safeFormatDate(plan.startDate, "MMM d, yyyy")}
                                    {plan.estimatedEndDate && safeFormatDate(plan.estimatedEndDate, "MMM d, yyyy") ? ` - ${safeFormatDate(plan.estimatedEndDate, "MMM d, yyyy")}` : ""}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => copyPlan(plan)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            aria-label={`Copy ${plan.title} plan`}
                          >
                            <Copy className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Globe className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-medium text-gray-700 mb-3">No Community Plans Available</h3>
                    <p className="text-gray-500 text-lg">No plans have been shared yet. Create and share your own!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Plan Modal */}
      {isCreatingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEditingPlan ? "Edit Your Learning Plan" : "Create a New Learning Plan"}
                </h2>
                <p className="text-gray-600 text-sm">
                  Structure your cooking learning journey with a clear plan.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCreatingPlan(false);
                  setIsEditingPlan(false);
                  setCurrentPlanId(null);
                  form.reset();
                  setSelectedStartDate("");
                  setSelectedEndDate("");
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <XCircle className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  Learning Plan Name
                  <span className="text-gray-400 cursor-pointer" title="The name of your learning plan (e.g., 'Master Italian Cooking')">
                    <Info className="h-4 w-4" />
                  </span>
                </label>
                <input
                  {...form.register("title")}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                  placeholder="E.g., Master Italian Cooking"
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  Plan Overview
                  <span className="text-gray-400 cursor-pointer" title="A brief overview of your learning goals">
                    <Info className="h-4 w-4" />
                  </span>
                </label>
                <textarea
                  {...form.register("description")}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 h-24 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                  placeholder="Describe your learning goals (e.g., 'Learn to cook authentic Italian dishes')"
                />
                {form.formState.errors.description && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.description.message}</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">Topics or Skills to Learn</label>
                  <button
                    type="button"
                    onClick={addTopic}
                    className="border border-gray-200 px-4 py-1 rounded-lg text-sm text-gray-700 hover:bg-gray-100 flex items-center transition-colors shadow-sm"
                    aria-label="Add a new topic or skill"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add Topic
                  </button>
                </div>
                {form.watch("topics").map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <input
                          {...form.register(`topics.${index}.title`)}
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                          placeholder={`Topic ${index + 1} (e.g., Pasta Making)`}
                        />
                        {form.formState.errors.topics?.[index]?.title && (
                          <p className="text-red-500 text-xs mt-1">{form.formState.errors.topics[index].title.message}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTopic(index)}
                        className="mt-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={form.watch("topics").length <= 1}
                        aria-label={`Remove topic ${index + 1}`}
                      >
                        <XCircle className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>
                    <div>
                      <textarea
                        {...form.register(`topics.${index}.description`)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                        placeholder="Optional topic description"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <input
                    type="checkbox"
                    {...form.register("isPublic")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Share this plan with the community
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={selectedStartDate}
                    onChange={(e) => {
                      setSelectedStartDate(e.target.value);
                      form.setValue("startDate", e.target.value);
                    }}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Completion Date</label>
                  <input
                    type="date"
                    value={selectedEndDate}
                    onChange={(e) => {
                      setSelectedEndDate(e.target.value);
                      form.setValue("estimatedEndDate", e.target.value);
                    }}
                    min={selectedStartDate}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional</p>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingPlan(false);
                    setIsEditingPlan(false);
                    setCurrentPlanId(null);
                    form.reset();
                    setSelectedStartDate("");
                    setSelectedEndDate("");
                  }}
                  className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  aria-label="Cancel creating or editing plan"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center disabled:opacity-50 hover:bg-blue-700 transition-colors shadow-md"
                  aria-label={isEditingPlan ? "Update your learning plan" : "Create your learning plan"}
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="mr-2 animate-spin h-5 w-5" />
                  ) : isEditingPlan ? (
                    "Update Plan"
                  ) : (
                    "Create Plan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default LearningPlanPage;