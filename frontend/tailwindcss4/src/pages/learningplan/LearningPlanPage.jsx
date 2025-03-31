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
} from "lucide-react";

// Mock Navbar and Footer (replace with your actual components)
const Navbar = () => <div className="bg-gray-800 text-white p-4">Navbar</div>;
const Footer = () => <div className="bg-gray-800 text-white p-4 mt-8">Footer</div>;

// Define the form schema
const learningPlanFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  topics: z
    .array(
      z.object({
        title: z.string().min(1, "Topic title is required"),
        description: z.string().optional(),
        completed: z.boolean().default(false),
      })
    )
    .min(1, "Add at least one topic"),
  startDate: z.date().optional(),
  estimatedEndDate: z.date().optional(),
});

const LearningPlanPage = () => {
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [activeTab, setActiveTab] = useState("my-plans");
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [userPlans, setUserPlans] = useState([]);
  const [allPlans, setAllPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [error, setError] = useState(null);

  const form = useForm({
    resolver: zodResolver(learningPlanFormSchema),
    defaultValues: {
      title: "",
      description: "",
      topics: [{ title: "", description: "", completed: false }],
      startDate: new Date(),
      estimatedEndDate: undefined,
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
          setUserPlans(plans); // For now, treat all plans as user plans
          setAllPlans(plans); // For the "Explore" tab, you might want to fetch from a different endpoint in the future
        } else {
          throw new Error("Failed to fetch learning plans");
        }
      } catch (err) {
        console.error("Error fetching learning plans:", err);
        setError("Failed to load learning plans. Please try again later.");
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
          progress: isEditingPlan ? undefined : 0, // Progress is managed by topics or progress updates
          topics: data.topics, // Include topics in the request
          startDate: data.startDate ? data.startDate.toISOString() : undefined,
          estimatedEndDate: data.estimatedEndDate ? data.estimatedEndDate.toISOString() : undefined,
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
        setSelectedStartDate(new Date());
        setSelectedEndDate(null);
      } else {
        const errorText = await response.text();
        throw new Error(
          `Failed to ${isEditingPlan ? "update" : "create"} learning plan: ${errorText}`
        );
      }
    } catch (err) {
      console.error("Error submitting learning plan:", err);
      alert(
        `Failed to ${isEditingPlan ? "update" : "create"} learning plan. Please try again.`
      );
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

    // Calculate progress based on completed topics
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
          id: undefined, // Let the backend generate a new ID
          progress: 0, // Reset progress for the copied plan
          topics: plan.topics.map((topic) => ({
            ...topic,
            completed: false, // Reset topic completion
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
      alert("Failed to copy plan. Please try again.");
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
      alert("Failed to delete plan. Please try again.");
    }
  };

  const editPlan = (plan) => {
    console.log("Editing plan:", plan);
    console.log("plan.estimatedEndDate:", plan.estimatedEndDate);

    setIsCreatingPlan(true);
    setIsEditingPlan(true);
    setCurrentPlanId(plan.id);

    // Safely parse dates
    const startDate = plan.startDate ? new Date(plan.startDate) : new Date();
    const endDate = plan.estimatedEndDate ? new Date(plan.estimatedEndDate) : null;

    // Validate dates before setting
    const validStartDate = isValid(startDate) ? startDate : new Date();
    const validEndDate = isValid(endDate) ? endDate : null;

    // Reset form with validated values
    form.reset({
      title: plan.title || "",
      description: plan.description || "",
      topics: plan.topics && plan.topics.length > 0 ? plan.topics : [{ title: "", description: "", completed: false }],
      startDate: validStartDate,
      estimatedEndDate: validEndDate,
    });

    // Set state with validated dates
    setSelectedStartDate(validStartDate);
    setSelectedEndDate(validEndDate);
  };

  // Helper function to safely format dates
  const safeFormatDate = (dateString, dateFormat) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isValid(date) ? format(date, dateFormat) : "";
  };

  // Helper function to safely format dates for input fields
  const safeFormatDateForInput = (date) => {
    if (!date || !isValid(date)) return "";
    return format(date, "yyyy-MM-dd");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Learning Plans</h1>
            <button
              onClick={() => {
                setIsCreatingPlan(true);
                setIsEditingPlan(false);
                setCurrentPlanId(null);
                form.reset();
                setSelectedStartDate(new Date());
                setSelectedEndDate(null);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-600"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Plan
            </button>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex border-b">
              <button
                className={`px-4 py-2 ${activeTab === "my-plans" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
                onClick={() => setActiveTab("my-plans")}
              >
                My Plans
              </button>
              <button
                className={`px-4 py-2 ${activeTab === "explore" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
                onClick={() => setActiveTab("explore")}
              >
                Explore
              </button>
            </div>

            {/* My Plans Tab */}
            {activeTab === "my-plans" && (
              <div className="mt-6">
                {isLoadingPlans ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
                  </div>
                ) : error ? (
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : userPlans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userPlans.map((plan) => (
                      <div key={plan.id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                            <p className="text-sm text-gray-500">{plan.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => editPlan(plan)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Edit className="h-4 w-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => deletePlan(plan.id)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Trash2 className="h-4 w-4 text-gray-500" />
                            </button>
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${calculateProgress(plan)}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{calculateProgress(plan)}% Complete</p>
                        </div>
                        <div className="space-y-2">
                          {plan.topics && plan.topics.map((topic, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleTopicCompletion(plan.id, index)}
                                  className="p-1"
                                >
                                  {topic.completed ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <div className="h-4 w-4 border rounded-full"></div>
                                  )}
                                </button>
                                <span className={`text-sm ${topic.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                                  {topic.title}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {(plan.startDate || plan.estimatedEndDate) && (
                          <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            <span>
                              {safeFormatDate(plan.startDate, "MMM d, yyyy")}
                              {plan.estimatedEndDate && safeFormatDate(plan.estimatedEndDate, "MMM d, yyyy") ? ` - ${safeFormatDate(plan.estimatedEndDate, "MMM d, yyyy")}` : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No Learning Plans Yet</h3>
                    <p className="text-gray-500 mb-6">Create your first learning plan to track your cooking skills progress.</p>
                    <button
                      onClick={() => setIsCreatingPlan(true)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                      Create Learning Plan
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Explore Tab */}
            {activeTab === "explore" && (
              <div className="mt-6">
                {isLoadingPlans ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
                  </div>
                ) : error ? (
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : allPlans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allPlans.map((plan) => (
                      <div key={plan.id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                            <p className="text-sm text-gray-500">{plan.description}</p>
                          </div>
                          <button
                            onClick={() => copyPlan(plan)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Copy className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          {plan.topics && plan.topics.map((topic, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="h-4 w-4 border rounded-full"></div>
                              <span className="text-sm text-gray-900">{topic.title}</span>
                            </div>
                          ))}
                        </div>
                        {(plan.startDate || plan.estimatedEndDate) && (
                          <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            <span>
                              {safeFormatDate(plan.startDate, "MMM d, yyyy")}
                              {plan.estimatedEndDate && safeFormatDate(plan.estimatedEndDate, "MMM d, yyyy") ? ` - ${safeFormatDate(plan.estimatedEndDate, "MMM d, yyyy")}` : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No Community Plans Yet</h3>
                    <p className="text-gray-500">Be the first to create and share a learning plan!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Plan Modal */}
      {isCreatingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-semibold">
              {isEditingPlan ? "Edit Learning Plan" : "Create a New Learning Plan"}
            </h2>
            <p className="text-gray-500 mb-6">
              Structure your cooking learning journey with a clear plan.
            </p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Plan Title</label>
                <input
                  {...form.register("title")}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="E.g., Master Italian Cooking"
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  {...form.register("description")}
                  className="w-full border rounded-md px-3 py-2 h-20"
                  placeholder="Describe your learning plan goals and what you want to achieve"
                />
                {form.formState.errors.description && (
                  <p className="text-red-500 text-sm">{form.formState.errors.description.message}</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Topics/Skills to Learn</label>
                  <button
                    type="button"
                    onClick={addTopic}
                    className="border border-gray-300 px-3 py-1 rounded-md text-sm hover:bg-gray-50 flex items-center"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add Topic
                  </button>
                </div>
                {form.watch("topics").map((_, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="flex-1">
                      <input
                        {...form.register(`topics.${index}.title`)}
                        className="w-full border rounded-md px-3 py-2"
                        placeholder={`Topic ${index + 1} (e.g., Pasta Making)`}
                      />
                      {form.formState.errors.topics?.[index]?.title && (
                        <p className="text-red-500 text-sm">{form.formState.errors.topics[index].title.message}</p>
                      )}
                      <textarea
                        {...form.register(`topics.${index}.description`)}
                        className="w-full border rounded-md px-3 py-2 mt-2 h-16"
                        placeholder="Optional description"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTopic(index)}
                      className="mt-1 p-2 hover:bg-gray-100 rounded"
                      disabled={form.watch("topics").length <= 1}
                    >
                      <XCircle className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={safeFormatDateForInput(selectedStartDate)}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : new Date();
                      if (isValid(date)) {
                        setSelectedStartDate(date);
                        form.setValue("startDate", date);
                      }
                    }}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    value={safeFormatDateForInput(selectedEndDate)}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : null;
                      setSelectedEndDate(date);
                      form.setValue("estimatedEndDate", date);
                    }}
                    min={safeFormatDateForInput(selectedStartDate)}
                    className="w-full border rounded-md px-3 py-2"
                  />
                  <p className="text-sm text-gray-500">Optional</p>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingPlan(false);
                    setIsEditingPlan(false);
                    setCurrentPlanId(null);
                    form.reset();
                    setSelectedStartDate(new Date());
                    setSelectedEndDate(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="bg-blue-500 text-white px-6 py-2 rounded-md flex items-center disabled:opacity-50"
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="mr-2 animate-spin h-4 w-4" />
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