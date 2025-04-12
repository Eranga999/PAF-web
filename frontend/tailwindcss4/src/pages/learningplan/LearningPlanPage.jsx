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
        completed: z.boolean().default(false),
      })
    )
    .min(1, "Add at least one topic or skill"),
  startDate: z.string().optional(),
  estimatedEndDate: z.string().optional(),
});

const LearningPlanPage = () => {
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [activeTab, setActiveTab] = useState("my-plans");
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [userPlans, setUserPlans] = useState([]);
  const [allPlans, setAllPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [error, setError] = useState(null);

  const form = useForm({
    resolver: zodResolver(learningPlanFormSchema),
    defaultValues: {
      title: "",
      description: "",
      topics: [{ title: "", completed: false }],
      startDate: "",
      estimatedEndDate: "",
    },
  });

  // Fetch learning plans on component mount
  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoadingPlans(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:8080/api/learning-plans");
        if (response.ok) {
          const plans = await response.json();
          setUserPlans(plans);
          setAllPlans(plans);
        } else {
          throw new Error("Failed to fetch learning plans");
        }
      } catch (err) {
        console.error("Error fetching learning plans:", err);
        setError("Failed to load your learning plans. Please try again later.");
      } finally {
        setIsLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const onSubmit = async (data) => {
    const method = isEditingPlan ? "PUT" : "POST";
    const url = isEditingPlan
      ? `http://localhost:8080/api/learning-plans/${currentPlanId}`
      : "http://localhost:8080/api/learning-plans";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          progress: isEditingPlan ? undefined : 0,
          topics: data.topics,
          startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
          estimatedEndDate: data.estimatedEndDate ? new Date(data.estimatedEndDate).toISOString() : undefined,
        }),
      });

      if (response.ok) {
        const updatedPlan = await response.json();
        if (isEditingPlan) {
          setUserPlans(
            userPlans.map((plan) =>
              plan.id === currentPlanId ? updatedPlan : plan
            )
          );
          setAllPlans(
            allPlans.map((plan) =>
              plan.id === currentPlanId ? updatedPlan : plan
            )
          );
        } else {
          setUserPlans([...userPlans, updatedPlan]);
          setAllPlans([...allPlans, updatedPlan]);
        }
        setIsCreatingPlan(false);
        setIsEditingPlan(false);
        setCurrentPlanId(null);
        form.reset();
        setSelectedStartDate("");
        setSelectedEndDate("");
      } else {
        const errorText = await response.text();
        throw new Error(
          `Failed to ${isEditingPlan ? "update" : "create"} learning plan: ${errorText}`
        );
      }
    } catch (err) {
      console.error("Error submitting learning plan:", err);
      alert(
        `Failed to ${isEditingPlan ? "update" : "create"} your learning plan. Please try again.`
      );
    }
  };

  const addTopic = () => {
    const currentTopics = form.getValues("topics");
    form.setValue("topics", [
      ...currentTopics,
      { title: "", completed: false },
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

    const totalTopics = updatedTopics.length;
    const completedTopics = updatedTopics.filter((t) => t.completed).length;
    const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    try {
      const response = await fetch(`http://localhost:8080/api/learning-plans/${planId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...plan,
          topics: updatedTopics,
          progress,
        }),
      });

      if (response.ok) {
        const updatedPlan = await response.json();
        setUserPlans(
          userPlans.map((p) => (p.id === planId ? updatedPlan : p))
        );
        setAllPlans(
          allPlans.map((p) => (p.id === planId ? updatedPlan : p))
        );
      } else {
        throw new Error("Failed to update topic completion");
      }
    } catch (err) {
      console.error("Error toggling topic completion:", err);
      alert("Failed to update topic completion. Please try again.");
    }
  };

  const calculateProgress = (plan) => {
    if (!plan.topics || plan.topics.length === 0) return 0;
    const total = plan.topics.length;
    const completed = plan.topics.filter((topic) => topic.completed).length;
    return Math.round((completed / total) * 100);
  };

  const copyPlan = async (plan) => {
    try {
      const response = await fetch("http://localhost:8080/api/learning-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...plan,
          id: undefined,
          progress: 0,
          topics: plan.topics.map((topic) => ({
            ...topic,
            completed: false,
          })),
        }),
      });

      if (response.ok) {
        const newPlan = await response.json();
        setUserPlans([...userPlans, newPlan]);
        setAllPlans([...allPlans, newPlan]);
        alert("Plan copied successfully!");
      } else {
        throw new Error("Failed to copy plan");
      }
    } catch (err) {
      console.error("Error copying plan:", err);
      alert("Failed to copy the plan. Please try again.");
    }
  };

  const deletePlan = async (planId) => {
    if (!window.confirm("Are you sure you want to delete this learning plan?")) return;

    try {
      const response = await fetch(`http://localhost:8080/api/learning-plans/${planId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUserPlans(userPlans.filter((plan) => plan.id !== planId));
        setAllPlans(allPlans.filter((plan) => plan.id !== planId));
      } else {
        throw new Error("Failed to delete plan");
      }
    } catch (err) {
      console.error("Error deleting plan:", err);
      alert("Failed to delete the plan. Please try again.");
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
      topics: plan.topics && plan.topics.length > 0 ? plan.topics : [{ title: "", completed: false }],
      startDate: startDateStr,
      estimatedEndDate: endDateStr,
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

          {/* Tabs */}
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

            {/* My Plans Tab */}
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
                                <span className="text-sm font-medium text-blue-600">{calculateProgress(plan)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                                  style={{ width: `${calculateProgress(plan)}%` }}
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

            {/* Explore Tab */}
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
                ) : allPlans.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allPlans.map((plan) => (
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
                    <h3 className="text-2xl font-medium text-gray-700 mb-3">No Community Plans Yet</h3>
                    <p className="text-gray-500 text-lg">Be the first to create and share a learning plan!</p>
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
                  <div key={index} className="flex items-start gap-3">
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
                ))}
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