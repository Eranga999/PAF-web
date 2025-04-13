
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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

  // Function to fetch user plans (will be reused for auto-refresh)
  const fetchUserPlans = async (token) => {
    try {
      const userPlansResponse = await fetch("http://localhost:8080/api/learning-plans", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userPlansResponse.ok) {
        const errorText = await userPlansResponse.text();
        if (userPlansResponse.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
          return false;
        }
        throw new Error(`Failed to fetch user plans: ${userPlansResponse.status} - ${errorText}`);
      }
      const userPlansData = await userPlansResponse.json();
      setUserPlans(userPlansData);
      return true;
    } catch (err) {
      console.error("Error fetching user plans:", err);
      setError(`Failed to load user plans: ${err.message}`);
      return false;
    }
  };

  // Function to fetch community plans
  const fetchCommunityPlans = async (token) => {
    try {
      console.log("Fetching community plans...");
      const communityPlansResponse = await fetch("http://localhost:8080/api/learning-plans/public", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!communityPlansResponse.ok) {
        const errorText = await communityPlansResponse.text();
        if (communityPlansResponse.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
          return false;
        }
        throw new Error(`Failed to fetch community plans: ${communityPlansResponse.status} - ${errorText}`);
      }
      const communityPlansData = await communityPlansResponse.json();
      console.log("Community plans response:", communityPlansData);
      setCommunityPlans(communityPlansData);
      return true;
    } catch (err) {
      console.error("Error fetching community plans:", err);
      setError(`Failed to load community plans: ${err.message}`);
      return false;
    }
  };

  // Fetch learning plans on component mount
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

        // Fetch user plans
        await fetchUserPlans(token);

        // Fetch community plans
        await fetchCommunityPlans(token);

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

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          progress: isEditingPlan ? undefined : 0,
          topics: data.topics,
          startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
          estimatedEndDate: data.estimatedEndDate ? new Date(data.estimatedEndDate).toISOString() : undefined,
          isPublic: data.isPublic,
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
        throw new Error(`Failed to ${isEditingPlan ? "update" : "create"} learning plan: ${errorText}`);
      }

      // Refetch plans to update the UI
      await fetchUserPlans(token);
      await fetchCommunityPlans(token);

      setIsCreatingPlan(false);
      setIsEditingPlan(false);
      setCurrentPlanId(null);
      form.reset();
      setSelectedStartDate("");
      setSelectedEndDate("");
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

      // Update the learning plan with new topic completion status
      const updatePlanResponse = await fetch(`http://localhost:8080/api/learning-plans/${planId}`, {
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

      if (!updatePlanResponse.ok) {
        const errorText = await updatePlanResponse.text();
        if (updatePlanResponse.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        throw new Error(`Failed to update topic completion: ${errorText}`);
      }

      const updatedPlan = await updatePlanResponse.json();

      // Calculate progress
      const totalTopics = updatedTopics.length;
      const completedTopics = updatedTopics.filter((t) => t.completed).length;
      const progressPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

      // Create a progress update
      const progressUpdateResponse = await fetch("http://localhost:8080/api/progress-updates", {
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

      if (!progressUpdateResponse.ok) {
        const errorText = await progressUpdateResponse.text();
        if (progressUpdateResponse.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        throw new Error(`Failed to create progress update: ${errorText}`);
      }

      // Refetch plans to update the UI with the new progress
      await fetchUserPlans(token);
      await fetchCommunityPlans(token);
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
          progress: 0, // Reset progress for the copied plan
          topics: plan.topics.map((topic) => ({
            title: topic.title,
            description: topic.description,
            completed: false, // Reset completion status
          })),
          startDate: plan.startDate,
          estimatedEndDate: plan.estimatedEndDate,
          isPublic: false, // Copied plan is private by default
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

      // Re-fetch user plans to auto-refresh the "My Plans" tab
      const success = await fetchUserPlans(token);
      if (success) {
        // Switch to "My Plans" tab
        setActiveTab("my-plans");
        setError("Plan copied successfully!");
      }
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
        throw new Error(`Failed to delete plan: ${errorText}`);
      }

      setUserPlans(userPlans.filter((plan) => plan.id !== planId));
      setCommunityPlans(communityPlans.filter((plan) => plan.id !== planId));
    } catch (err) {
      console.error("Error deleting plan:", err);
      setError(`Failed to delete the plan: ${err.message}`);
    }
  };

  const editPlan = (plan) => {
    setIsCreatingPlan(true);
    setIsEditingPlan(true);
    setCurrentPlanId(plan.id);

    const startDateStr = plan.startDate ? new Date(plan.startDate).toISOString().split("T")[0] : "";
    const endDateStr = plan.estimatedEndDate ? new Date(plan.estimatedEndDate).toISOString().split("T")[0] : "";

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">My Learning Plans</h1>
            <button
              onClick={() => {
                setIsCreatingPlan(true);
                setIsEditingPlan(false);
                setCurrentPlanId(null);
                form.reset();
                setSelectedStartDate("");
                setSelectedEndDate("");
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors shadow-md"
              aria-label="Create a new learning plan"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Add New Plan
            </button>
          </div>

          <div className="mb-10">
            <div className="flex border-b border-gray-200">
              <button
                className={`px-6 py-3 text-lg font-medium ${activeTab === "my-plans" ? "border-b-4 border-blue-600 text-blue-600" : "text-gray-600 hover:text-blue-600"} transition-colors`}
                onClick={() => setActiveTab("my-plans")}
              >
                My Plans
              </button>
              <button
                className={`px-6 py-3 text-lg font-medium ${activeTab === "explore" ? "border-b-4 border-blue-600 text-blue-600" : "text-gray-600 hover:text-blue-600"} transition-colors`}
                onClick={() => setActiveTab("explore")}
              >
                Explore Community Plans
              </button>
            </div>

            {activeTab === "my-plans" && (
              <div className="mt-10">
                {isLoadingPlans ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                  </div>
                ) : error ? (
                  <div className="bg-red-50 rounded-lg p-6 text-center shadow-md">
                    <p className="text-red-600 text-lg">{error}</p>
                  </div>
                ) : userPlans.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">{plan.title}</h3>
                              <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                            </div>
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-medium text-gray-700">Progress</h4>
                                <span className="text-sm font-medium text-blue-600">{plan.progress ?? 0}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                                  style={{ width: `${plan.progress ?? 0}%` }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Topics to Learn</h4>
                              <div className="space-y-2">
                                {plan.topics && plan.topics.map((topic, index) => (
                                  <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <button
                                        onClick={() => toggleTopicCompletion(plan.id, index)}
                                        className="p-1"
                                        aria-label={topic.completed ? `Mark ${topic.title} as incomplete` : `Mark ${topic.title} as complete`}
                                      >
                                        {topic.completed ? (
                                          <Check className="h-5 w-5 text-green-600" />
                                        ) : (
                                          <div className="h-5 w-5 border-2 border-gray-300 rounded-full"></div>
                                        )}
                                      </button>
                                      <span className={`text-sm ${topic.completed ? "line-through text-gray-500" : "text-gray-800"}`}>
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
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                              aria-label={`Edit ${plan.title} plan`}
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => deletePlan(plan.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
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
                  <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-medium text-gray-700 mb-3">No Learning Plans Yet</h3>
                    <p className="text-gray-500 mb-6 text-lg">Create your first learning plan to track your cooking skills progress.</p>
                    <button
                      onClick={() => setIsCreatingPlan(true)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                      aria-label="Create your first learning plan"
                    >
                      Create Your First Plan
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "explore" && (
              <div className="mt-10">
                {isLoadingPlans ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                  </div>
                ) : error ? (
                  <div className="bg-red-50 rounded-lg p-6 text-center shadow-md">
                    <p className="text-red-600 text-lg">{error}</p>
                  </div>
                ) : communityPlans.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {communityPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">{plan.title}</h3>
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
                            className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                            aria-label={`Copy ${plan.title} plan`}
                          >
                            <Copy className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <h3 className="text-2xl font-medium text-gray-700 mb-3">No Community Plans Available</h3>
                    <p className="text-gray-500 text-lg">No plans have been shared yet. Create and share your own!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isCreatingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isEditingPlan ? "Edit Your Learning Plan" : "Create a New Learning Plan"}
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              Structure your cooking learning journey with a clear plan.
            </p>

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
                        className="mt-2 p-2 hover:bg-gray-100 rounded-full transition-colors"
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

