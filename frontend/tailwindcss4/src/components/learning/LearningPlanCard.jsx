import { useState, useEffect, Component } from "react";
import { Plus, Book, PenSquare, Trash2, PlusCircle, XCircle, Loader2, Calendar, Globe } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isValid } from "date-fns";

const learningPlanSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional().nullable(),
  topics: z.array(z.object({
    title: z.string().min(1, "Topic title is required"),
    completed: z.boolean().default(false),
  })).min(1, "Add at least one topic"),
  startDate: z.date().optional().nullable(),
  estimatedEndDate: z.date().optional().nullable(),
  progress: z.coerce.number().default(0),
  isPublic: z.boolean().default(false),
});

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-red-500 p-4">Something went wrong with this plan.</div>;
    }
    return this.props.children;
  }
}

const LearningPlanCard = ({ plans, isLoading, onProgressUpdate }) => {
  const [open, setOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);

  const form = useForm({
    resolver: zodResolver(learningPlanSchema),
    defaultValues: {
      title: "",
      description: "",
      topics: [{ title: "", completed: false }],
      startDate: null,
      estimatedEndDate: null,
      progress: 0,
      isPublic: false,
    },
  });

  const safeFormatDate = (dateString) => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      return isValid(date) ? format(date, "MMM d, yyyy") : "Not set";
    } catch {
      return "Not set";
    }
  };

  useEffect(() => {
    if (editingPlan) {
      form.reset({
        title: editingPlan.title || "",
        description: editingPlan.description || "",
        topics: editingPlan.topics && editingPlan.topics.length > 0
          ? editingPlan.topics
          : [{ title: "", completed: false }],
        startDate: editingPlan.startDate ? new Date(editingPlan.startDate) : null,
        estimatedEndDate: editingPlan.estimatedEndDate ? new Date(editingPlan.estimatedEndDate) : null,
        progress: editingPlan.progress || 0,
        isPublic: editingPlan.isPublic || false,
      });
      setSelectedStartDate(editingPlan.startDate ? new Date(editingPlan.startDate) : null);
      setSelectedEndDate(editingPlan.estimatedEndDate ? new Date(editingPlan.estimatedEndDate) : null);
    }
  }, [editingPlan, form]);

  const handleToggleTopic = async (planId, topicIndex) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication required to update topics. Please try again.");
      return;
    }

    try {
      const plan = plans.find((p) => p.id === planId);
      if (!plan) {
        throw new Error("Learning plan not found");
      }

      const updatedTopics = [...plan.topics];
      updatedTopics[topicIndex].completed = !updatedTopics[topicIndex].completed;

      const completedCount = updatedTopics.filter((topic) => topic.completed).length;
      const totalTopics = updatedTopics.length;
      const newProgress = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

      const response = await fetch(`http://localhost:8080/api/learning-plans/${planId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...plan,
          topics: updatedTopics,
          progress: newProgress,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert("Your session has expired. Please try again or contact support.");
          return;
        }
        throw new Error("Failed to update learning plan");
      }

      alert("Topic updated successfully!");
      onProgressUpdate();
    } catch (error) {
      console.error("Error updating topic:", error);
      alert(`Error updating topic: ${error.message}`);
    }
  };

  const onSubmit = async (data) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication required to create or update a learning plan.");
      return;
    }

    const completedTopics = data.topics.filter(topic => topic.completed).length;
    const progressPercentage = data.topics.length > 0 
      ? Math.round((completedTopics / data.topics.length) * 100)
      : 0;

    const payload = {
      ...data,
      progress: progressPercentage,
      startDate: data.startDate ? format(data.startDate, "yyyy-MM-dd") : null,
      estimatedEndDate: data.estimatedEndDate ? format(data.estimatedEndDate, "yyyy-MM-dd") : null,
    };

    try {
      const url = editingPlan
        ? `http://localhost:8080/api/learning-plans/${editingPlan.id}`
        : "http://localhost:8080/api/learning-plans";
      const method = editingPlan ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert("Your session has expired. Please try again or contact support.");
          return;
        }
        throw new Error(`${editingPlan ? "Failed to update" : "Failed to create"} learning plan`);
      }

      alert(`${editingPlan ? "Plan updated" : "Plan created"} successfully!`);
      onProgressUpdate();
      form.reset();
      setSelectedStartDate(null);
      setSelectedEndDate(null);
      setEditingPlan(null);
      setOpen(false);
    } catch (error) {
      console.error("Error creating/updating learning plan:", error);
      alert(`Failed to ${editingPlan ? "update" : "create"} learning plan: ${error.message}`);
    }
  };

  const addTopic = () => {
    const currentTopics = form.getValues("topics");
    form.setValue("topics", [...currentTopics, { title: "", completed: false }]);
  };

  const removeTopic = (index) => {
    const currentTopics = form.getValues("topics");
    form.setValue("topics", currentTopics.filter((_, i) => i !== index));
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setOpen(true);
  };

  const handleDeletePlan = async (planId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication required to delete a learning plan.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this learning plan?")) {
      try {
        const response = await fetch(`http://localhost:8080/api/learning-plans/${planId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          if (response.status === 401) {
            alert("Your session has expired. Please try again or contact support.");
            return;
          }
          throw new Error("Failed to delete learning plan");
        }
        alert("Plan deleted successfully!");
        onProgressUpdate();
      } catch (error) {
        console.error("Error deleting plan:", error);
        alert(`Error deleting plan: ${error.message}`);
      }
    }
  };

  return (
    <ErrorBoundary>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Learning Plans</h2>
              <p className="text-gray-500 mt-1">Track and manage your culinary journey</p>
            </div>
            <button
              onClick={() => {
                setEditingPlan(null);
                form.reset();
                setOpen(true);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-md"
            >
              <Plus className="h-5 w-5 mr-2" /> Create Plan
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
              <Book className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Start Your Learning Journey</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">Create your first learning plan to track your progress and achieve your culinary goals.</p>
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-md"
              >
                <Plus className="h-5 w-5 mr-2" /> Create Your First Plan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <div 
                  key={plan.id} 
                  className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{plan.title}</h4>
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">{plan.description}</p>
                      {plan.isPublic && (
                        <div className="mt-2 inline-flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          <Globe className="h-3 w-3 mr-1" />
                          Public
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditPlan(plan)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit plan"
                      >
                        <PenSquare className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete plan"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-medium text-blue-600">{plan.progress || 0}%</span>
                    </div>
                    <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${plan.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <h5 className="text-sm font-medium text-gray-700">Topics to Learn</h5>
                    <div className="space-y-2">
                      {plan.topics && plan.topics.map((topic, index) => (
                        <div key={index} className="flex items-center group/topic">
                          <button
                            onClick={() => handleToggleTopic(plan.id, index)}
                            className={`flex-shrink-0 w-6 h-6 rounded-full mr-3 flex items-center justify-center transition-colors ${
                              topic.completed 
                                ? 'bg-green-500 text-white' 
                                : 'border-2 border-gray-300 group-hover/topic:border-blue-400'
                            }`}
                          >
                            {topic.completed && (
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          <span className={`text-sm transition-colors ${
                            topic.completed 
                              ? 'text-gray-500 line-through' 
                              : 'text-gray-700 group-hover/topic:text-blue-600'
                          }`}>
                            {topic.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {safeFormatDate(plan.startDate)} - {safeFormatDate(plan.estimatedEndDate)}
                    </span>
                  </div>
                </div>
              ))}
              
              <button
                onClick={() => {
                  setEditingPlan(null);
                  form.reset();
                  setOpen(true);
                }}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-gray-600 group-hover:text-blue-600 font-medium transition-colors">Create New Plan</span>
              </button>
            </div>
          )}
        </div>

        {open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl">
              <div className="p-6">
                <h2 className="text-xl font-semibold">{editingPlan ? "Edit Learning Plan" : "Create a New Learning Plan"}</h2>
                <p className="text-gray-500 mb-6">Structure your cooking learning journey with a clear plan.</p>
              </div>
              <div className="max-h-[70vh] overflow-y-auto px-6 pb-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label htmlFor="plan-title" className="block text-sm font-medium mb-1">Plan Title</label>
                    <input
                      id="plan-title"
                      name="title"
                      {...form.register("title")}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="E.g., Master Italian Cooking"
                      aria-describedby={form.formState.errors.title ? "title-error" : undefined}
                    />
                    {form.formState.errors.title && (
                      <p id="title-error" className="text-red-500 text-sm">{form.formState.errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="plan-description" className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      id="plan-description"
                      name="description"
                      {...form.register("description")}
                      className="w-full border rounded-md px-3 py-2 h-20"
                      placeholder="Describe your learning plan goals and what you want to achieve"
                      aria-describedby={form.formState.errors.description ? "description-error" : undefined}
                    />
                    {form.formState.errors.description && (
                      <p id="description-error" className="text-red-500 text-sm">{form.formState.errors.description.message}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Topics/Skills to Learn</label>
                      <button
                        type="button"
                        onClick={addTopic}
                        className="border border-gray-300 px-3 py-1 rounded-md text-sm hover:bg-gray-50 flex items-center"
                        aria-label="Add new topic"
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Add Topic
                      </button>
                    </div>
                    {form.watch("topics").map((_, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="flex-1">
                          <label htmlFor={`topic-${index}`} className="sr-only">Topic {index + 1}</label>
                          <input
                            id={`topic-${index}`}
                            name={`topics.${index}.title`}
                            {...form.register(`topics.${index}.title`)}
                            className="w-full border rounded-md px-3 py-2"
                            placeholder={`Topic ${index + 1} (e.g., Pasta Making)`}
                            aria-describedby={form.formState.errors.topics?.[index]?.title ? `topic-${index}-error` : undefined}
                          />
                          {form.formState.errors.topics?.[index]?.title && (
                            <p id={`topic-${index}-error`} className="text-red-500 text-sm">
                              {form.formState.errors.topics[index].title.message}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTopic(index)}
                          className="mt-1 p-2 hover:bg-gray-100 rounded"
                          disabled={form.watch("topics").length <= 1}
                          aria-label={`Remove topic ${index + 1}`}
                        >
                          <XCircle className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="start-date" className="block text-sm font-medium mb-1">Start Date</label>
                      <input
                        id="start-date"
                        name="startDate"
                        type="date"
                        value={selectedStartDate ? format(selectedStartDate, "yyyy-MM-dd") : ""}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : null;
                          setSelectedStartDate(date);
                          form.setValue("startDate", date);
                        }}
                        className="w-full border rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label htmlFor="end-date" className="block text-sm font-medium mb-1">Target Completion Date</label>
                      <input
                        id="end-date"
                        name="estimatedEndDate"
                        type="date"
                        value={selectedEndDate ? format(selectedEndDate, "yyyy-MM-dd") : ""}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : null;
                          setSelectedEndDate(date);
                          form.setValue("estimatedEndDate", date);
                        }}
                        min={selectedStartDate ? format(selectedStartDate, "yyyy-MM-dd") : ""}
                        className="w-full border rounded-md px-3 py-2"
                      />
                      <p className="text-sm text-gray-500">Optional</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isPublic"
                      {...form.register("isPublic")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPublic" className="text-sm text-gray-700">
                      Share this plan with the community
                    </label>
                  </div>

                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPlan(null);
                        form.reset();
                        setOpen(false);
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
                      ) : editingPlan ? (
                        "Update Plan"
                      ) : (
                        "Create Plan"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default LearningPlanCard;