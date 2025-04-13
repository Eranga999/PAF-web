import { useState, useEffect } from "react";
import { Plus, Book, PenSquare, Trash2, PlusCircle, XCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import ProgressCard from "./ProgressCard";

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
  total: z.coerce.number().default(0),
});

const LearningPlanCard = ({ onProgressUpdate }) => { // Ensure onProgressUpdate is passed as a prop
  const [open, setOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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
      total: 0,
    },
  });

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/learning-plans");
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      } else {
        console.error("Failed to fetch plans:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (editingPlan) {
      form.reset({
        title: editingPlan.title,
        description: editingPlan.description,
        topics: editingPlan.topics,
        startDate: editingPlan.startDate ? new Date(editingPlan.startDate) : null,
        estimatedEndDate: editingPlan.estimatedEndDate ? new Date(editingPlan.estimatedEndDate) : null,
        progress: editingPlan.progress,
        total: editingPlan.total,
      });
      setSelectedStartDate(editingPlan.startDate ? new Date(editingPlan.startDate) : null);
      setSelectedEndDate(editingPlan.estimatedEndDate ? new Date(editingPlan.estimatedEndDate) : null);
    }
  }, [editingPlan, form]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      startDate: data.startDate ? format(data.startDate, "yyyy-MM-dd") : null,
      estimatedEndDate: data.estimatedEndDate ? format(data.estimatedEndDate, "yyyy-MM-dd") : null,
    };
    console.log("Request payload:", payload);
    try {
      const url = editingPlan
        ? `http://localhost:8080/api/learning-plans/${editingPlan.id}`
        : "http://localhost:8080/api/learning-plans";
      const method = editingPlan ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedPlan = await response.json();
        if (editingPlan) {
          setPlans(plans.map((plan) => (plan.id === updatedPlan.id ? updatedPlan : plan)));
        } else {
          setPlans([...plans, updatedPlan]);
        }
        form.reset();
        setSelectedStartDate(null);
        setSelectedEndDate(null);
        setEditingPlan(null);
        setOpen(false);
      } else {
        const errorText = await response.text();
        console.error(editingPlan ? "Failed to update learning plan" : "Failed to create learning plan", response.status, errorText);
        alert(`Error: ${errorText || "Failed to create learning plan"}`);
      }
    } catch (error) {
      console.error("Error creating learning plan:", error);
      alert("Failed to create learning plan. Please check if the backend server is running and try again.");
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
    if (window.confirm("Are you sure you want to delete this learning plan?")) {
      try {
        const response = await fetch(`http://localhost:8080/api/learning-plans/${planId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setPlans(plans.filter((plan) => plan.id !== planId));
        } else {
          console.error("Failed to delete learning plan:", response.statusText);
        }
      } catch (error) {
        console.error("Error deleting plan:", error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Your Learning Plans</h2>
          <button
            onClick={() => {
              setEditingPlan(null);
              form.reset();
              setOpen(true);
            }}
            className="bg-blue-500 text-white px-3 py-1 rounded-md flex items-center hover:bg-blue-600"
          >
            <Plus className="h-4 w-4 mr-1" /> New Plan
          </button>
        </div>

        {/* Modal for creating/editing plan */}
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
                        value={selectedStartDate ? format(selectedStartDate, "yyyy-MM-dd") : ""}
                        onChange={(e) => {
                          const date = new Date(e.target.value);
                          setSelectedStartDate(date);
                          form.setValue("startDate", date);
                        }}
                        className="w-full border rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Target Completion Date</label>
                      <input
                        type="date"
                        value={selectedEndDate ? format(selectedEndDate, "yyyy-MM-dd") : ""}
                        onChange={(e) => {
                          const date = new Date(e.target.value);
                          setSelectedEndDate(date);
                          form.setValue("estimatedEndDate", date);
                        }}
                        min={selectedStartDate ? format(selectedStartDate, "yyyy-MM-dd") : ""}
                        className="w-full border rounded-md px-3 py-2"
                      />
                      <p className="text-sm text-gray-500">Optional</p>
                    </div>
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

        {/* Plans list */}
        <div>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin h-6 w-6 border-t-2 border-blue-500 rounded-full"></div>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <Book className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">You don't have any learning plans yet</p>
              <p className="text-sm text-gray-400 mt-1 mb-4">Create one to track your culinary journey</p>
              <button
                onClick={() => setOpen(true)}
                className="border border-gray-300 px-3 py-1 rounded-md text-sm hover:bg-gray-50"
              >
                <Plus className="h-4 w-4 mr-1 inline" /> Create your first plan
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{plan.title}</h4>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditPlan(plan)} className="p-1 hover:bg-gray-100 rounded">
                        <PenSquare className="h-4 w-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">Progress</span>
                      <span className="text-xs text-gray-500">{plan.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${plan.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  setEditingPlan(null);
                  form.reset();
                  setOpen(true);
                }}
                className="w-full border border-dashed rounded-lg p-3 text-gray-500 hover:bg-gray-50 flex items-center justify-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create a new learning plan
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <ProgressCard onProgressUpdate={onProgressUpdate} />
      </div>
    </div>
  );
};

export default LearningPlanCard;