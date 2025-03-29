import { useState } from "react";
import { Plus, Book, PenSquare, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const learningPlanSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional().nullable(),
  topics: z.string().transform(val => {
    try {
      const topics = val.split('\n')
        .filter(line => line.trim() !== '')
        .map(line => ({ name: line.trim(), completed: false }));
      return topics;
    } catch {
      return [];
    }
  }),
  startDate: z.coerce.date().optional().nullable(),
  estimatedEndDate: z.coerce.date().optional().nullable(),
  progress: z.coerce.number().default(0),
  total: z.coerce.number().default(0)
});

const LearningPlanCard = ({ plans = [], isLoading = false }) => {
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(learningPlanSchema),
    defaultValues: {
      title: "",
      description: "",
      topics: "",
      startDate: null,
      estimatedEndDate: null,
      progress: 0,
      total: 0
    },
  });

  const onSubmit = (data) => {
    // Here you would typically handle the API call
    console.log("Form submitted:", data);
    form.reset();
    setOpen(false);
  };

  const handleDeletePlan = (planId) => {
    if (window.confirm("Are you sure you want to delete this learning plan?")) {
      // Handle delete logic here
      console.log("Deleting plan:", planId);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Your Learning Plans</h2>
          <button
            onClick={() => setOpen(true)}
            className="bg-blue-500 text-white px-3 py-1 rounded-md flex items-center hover:bg-blue-600"
          >
            <Plus className="h-4 w-4 mr-1" /> New Plan
          </button>
        </div>

        {/* Dialog/Modal for creating new plan */}
        {open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Create Learning Plan</h3>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Plan Title</label>
                  <input
                    {...form.register("title")}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="e.g., Italian Cooking Mastery"
                  />
                  {form.formState.errors.title && (
                    <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    {...form.register("description")}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Describe your learning goals..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Initial Progress</label>
                    <input
                      type="number"
                      {...form.register("progress")}
                      className="w-full border rounded-md px-3 py-2"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Total Steps</label>
                    <input
                      type="number"
                      {...form.register("total")}
                      className="w-full border rounded-md px-3 py-2"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Learning Topics</label>
                  <textarea
                    {...form.register("topics")}
                    className="w-full border rounded-md px-3 py-2 h-32"
                    placeholder="Enter one topic per line, e.g.:
Week 1: Pasta Basics
Week 2: Sauce Foundations
Week 3: Risotto Techniques"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    Create Plan
                  </button>
                </div>
              </form>
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
                      <button className="p-1 hover:bg-gray-100 rounded">
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

                  {plan.currentFocus && (
                    <div className="mt-3 text-sm">
                      <span className="font-medium">Current focus:</span>
                      <span className="ml-1 text-gray-600">{plan.currentFocus}</span>
                    </div>
                  )}

                  {plan.duration && (
                    <div className="text-xs mt-2 text-right">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {plan.progress >= 100 ? 'Completed' : `Week ${Math.ceil(plan.duration * plan.progress / 100)}/${plan.duration}`}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => setOpen(true)}
                className="w-full border border-dashed rounded-lg p-3 text-gray-500 hover:bg-gray-50 flex items-center justify-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create a new learning plan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPlanCard;