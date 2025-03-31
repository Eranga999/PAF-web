import { useState, useEffect } from "react";
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

const ProgressCard = ({ onProgressUpdate }) => {
  const [open, setOpen] = useState(false);
  const [progressValue, setProgressValue] = useState(50);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [progressUpdates, setProgressUpdates] = useState([]);

  const form = useForm({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      title: "",
      description: "",
      planId: "",
      progressPercentage: 50,
    },
  });

  // Fetch plans from the backend
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/learning-plans");
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched plans in ProgressCard:", data); // Debug log
          setPlans(data);
        } else {
          console.error("Failed to fetch plans:", response.status, await response.text());
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
      }
    };
    fetchPlans();
  }, []);

  // Fetch progress updates when a plan is selected
  useEffect(() => {
    if (selectedPlanId) {
      const fetchProgressUpdates = async () => {
        try {
          const response = await fetch(`http://localhost:8080/api/progress-updates/plan/${selectedPlanId}`);
          if (response.ok) {
            const data = await response.json();
            console.log("Fetched progress updates in ProgressCard:", data); // Debug log
            setProgressUpdates(data);
          } else {
            console.error("Failed to fetch progress updates:", response.status, await response.text());
          }
        } catch (error) {
          console.error("Error fetching progress updates:", error);
        }
      };
      fetchProgressUpdates();
    } else {
      setProgressUpdates([]);
    }
  }, [selectedPlanId]);

  const onSubmit = async (data) => {
    try {
      const response = await fetch("http://localhost:8080/api/progress-updates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          planId: data.planId ? data.planId : undefined,
        }),
      });
      if (response.ok) {
        const newProgressUpdate = await response.json();
        console.log("Progress update created:", newProgressUpdate);
        form.reset();
        setOpen(false);
        setProgressValue(50);
        // Refresh progress updates for the selected plan
        if (data.planId) {
          const response = await fetch(`http://localhost:8080/api/progress-updates/plan/${data.planId}`);
          if (response.ok) {
            const updatedData = await response.json();
            console.log("Refreshed progress updates after submission:", updatedData); // Debug log
            setProgressUpdates(updatedData);
          } else {
            console.error("Failed to refresh progress updates:", response.status, await response.text());
          }
        }
        // Notify LearningPlanCard to refresh plans
        if (onProgressUpdate) {
          onProgressUpdate();
        }
      } else {
        console.error("Failed to create progress update:", response.status, await response.text());
        alert("Failed to create progress update. Please try again.");
      }
    } catch (error) {
      console.error("Error creating progress update:", error);
      alert("Failed to create progress update. Please check if the backend server is running and try again.");
    }
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
                  onChange={(e) => {
                    setSelectedPlanId(e.target.value);
                    form.setValue("planId", e.target.value);
                  }}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">None</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
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

              {/* Display Progress Updates */}
              {progressUpdates.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Recent Progress Updates</h4>
                  <ul className="space-y-2">
                    {progressUpdates.map((update) => (
                      <li key={update.id} className="border p-2 rounded-md">
                        <p className="text-sm font-medium">{update.title}</p>
                        <p className="text-sm text-gray-600">{update.description}</p>
                        <p className="text-sm text-gray-500">Progress: {update.progressPercentage}%</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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