
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { 
  PlusCircle, 
  ChefHat, 
  Loader2, 
  Calendar as CalendarIcon, 
  Check, 
  Clock, 
  XCircle, 
  Edit, 
  Trash2 
} from "lucide-react";

// Mock Navbar and Footer (replace with your actual components)
const Navbar = () => <div className="bg-gray-800 text-white p-4">Navbar</div>;
const Footer = () => <div className="bg-gray-800 text-white p-4 mt-8">Footer</div>;

// Define the form schema
const learningPlanFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  topics: z.array(z.object({
    title: z.string().min(1, "Topic title is required"),
    description: z.string().optional(),
    completed: z.boolean().default(false),
  })).min(1, "Add at least one topic"),
  startDate: z.date().optional(),
  estimatedEndDate: z.date().optional(),
});

const LearningPlanPage = () => {
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [activeTab, setActiveTab] = useState("my-plans");
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState(null);

  // Remove hardcoded dummy data
  const userPlans = []; // Empty array to simulate no user plans
  const allPlans = [];  // Empty array to simulate no community plans

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

  const onSubmit = (data) => {
    console.log("Creating plan:", data);
    setIsCreatingPlan(false);
    form.reset();
  };

  const addTopic = () => {
    const currentTopics = form.getValues("topics");
    form.setValue("topics", [...currentTopics, { title: "", description: "", completed: false }]);
  };

  const removeTopic = (index) => {
    const currentTopics = form.getValues("topics");
    form.setValue("topics", currentTopics.filter((_, i) => i !== index));
  };

  const toggleTopicCompletion = (planId, topicIndex) => {
    console.log(`Toggling completion for plan ${planId}, topic ${topicIndex}`);
  };

  const calculateProgress = (plan) => {
    if (!plan.total || plan.total === 0 || plan.progress === null || plan.progress === undefined) return 0;
    return Math.round((plan.progress / plan.total) * 100);
  };

  const copyPlan = (plan) => {
    console.log("Copying plan:", plan);
  };

  const deletePlan = (planId) => {
    console.log("Deleting plan:", planId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Learning Plans</h1>
            <button
              onClick={() => setIsCreatingPlan(true)}
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
                {userPlans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Render User Plans */}
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
                {allPlans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Render Community Plans */}
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

      {/* Create Plan Modal */}
      {isCreatingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-semibold">Create a New Learning Plan</h2>
            <p className="text-gray-500 mb-6">Structure your cooking learning journey with a clear plan.</p>

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
                  onClick={() => setIsCreatingPlan(false)}
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
