// ProgressCard.jsx
import { useState } from "react";
import { Trophy } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const progressSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  planId: z.string().optional(),
  progressPercentage: z.number().min(1).max(100),
});

const ProgressCard = () => {
  const [open, setOpen] = useState(false);
  const [progressValue, setProgressValue] = useState(50);

  // Mock plans data (replace with actual API call in your implementation)
  const plans = [
    { id: 1, title: "Italian Cooking Basics" },
    { id: 2, title: "French Pastry Mastery" },
  ];

  const form = useForm({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      title: "",
      description: "",
      planId: "",
      progressPercentage: 50,
    },
  });

  const onSubmit = (data) => {
    // Here you would typically handle the API call
    console.log("Progress submitted:", {
      ...data,
      planId: data.planId ? parseInt(data.planId) : undefined,
    });
    form.reset();
    setOpen(false);
    setProgressValue(50);
  };

  return (
    <div>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center w-full py-2 border border-gray-300 rounded-md text-sm text-gray-500 hover:text-blue-500 hover:bg-gray-50 transition-colors"
      >
        <Trophy className="h-4 w-4 mr-2" />
        <span>Share Progress Update</span>
      </button>

      {/* Dialog/Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Share Learning Progress</h3>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Title Field */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Skill / Achievement Title
                </label>
                <input
                  {...form.register("title")}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="e.g., Knife Skills Mastery"
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  What did you learn or accomplish?
                </label>
                <textarea
                  {...form.register("description")}
                  className="w-full border rounded-md px-3 py-2 h-32"
                  placeholder="e.g., Today I mastered the julienne cut! It took a lot of practice, but I can now cut vegetables into perfect matchsticks."
                />
                {form.formState.errors.description && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              {/* Learning Plan Select */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Related Learning Plan (optional)
                </label>
                <select
                  {...form.register("planId")}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">None</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id.toString()}>
                      {plan.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Progress Slider */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Progress: {progressValue}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progressValue}
                  onChange={(e) => {
                    setProgressValue(parseInt(e.target.value));
                    form.setValue("progressPercentage", parseInt(e.target.value));
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                {form.formState.errors.progressPercentage && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.progressPercentage.message}
                  </p>
                )}
              </div>

              {/* Footer Buttons */}
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
                  Share Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressCard;