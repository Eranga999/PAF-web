import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAuthHeaders } from "../../utils/auth";

const progressSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  planId: z.string().optional(),
});

const ProgressCard = ({ onProgressUpdate }) => {
  const [open, setOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [progressUpdates, setProgressUpdates] = useState([]);

  const form = useForm({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      title: "",
      description: "",
      planId: "",
    },
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/learning-plans", {
          credentials: "include",
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          if (response.status === 401) {
            alert("Your session has expired. Please try again or contact support.");
            return;
          }
          throw new Error("Failed to fetch plans");
        }
        const data = await response.json();
        setPlans(data);
      } catch (error) {
        console.error("Error fetching plans:", error);
        alert(`Error fetching plans: ${error.message}`);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    if (open) {
      setSelectedPlanId("");
      form.reset();
    }
  }, [open, form]);

  useEffect(() => {
    if (selectedPlanId) {
      const fetchProgressUpdates = async () => {
        try {
          const response = await fetch(`http://localhost:8080/api/progress-updates/${selectedPlanId}`, {
            credentials: "include",
            headers: getAuthHeaders(),
          });
          if (!response.ok) {
            if (response.status === 404) {
              setProgressUpdates([]);
              return;
            }
            const errorText = await response.text();
            alert(`Error fetching progress updates: ${errorText}`);
            return;
          }
          const data = await response.json();
          setProgressUpdates(data);
        } catch (error) {
          console.error("Error fetching progress updates:", error);
          alert(`Error fetching progress updates: ${error.message}`);
        }
      };
      fetchProgressUpdates();
    } else {
      setProgressUpdates([]);
    }
  }, [selectedPlanId]);

  const onSubmit = async (data) => {
    try {
      const selectedPlan = plans.find((plan) => plan.id === data.planId);
      const progressPercentage = selectedPlan
        ? Math.round(
            (selectedPlan.topics.filter((t) => t.completed).length / selectedPlan.topics.length) * 100
          )
        : 0;

      const response = await fetch("http://localhost:8080/api/progress-updates", {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...data,
          planId: data.planId || undefined,
          progressPercentage,
        }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          alert("Your session has expired. Please try again or contact support.");
          return;
        }
        throw new Error("Failed to create progress update");
      }

      alert("Progress shared successfully!");
      form.reset();
      setOpen(false);
      setSelectedPlanId("");
      if (onProgressUpdate) {
        onProgressUpdate();
      }
    } catch (error) {
      console.error("Error creating progress update:", error);
      alert(`Error creating progress update: ${error.message}`);
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center w-full py-2 border border-gray-300 rounded-md text-sm text-gray-500 hover:text-blue-500 hover:bg-gray-50 transition-colors"
      >
        <Trophy className="h-4 w-4 mr-2" />
        <span>Share Progress Update</span>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Share Learning Progress</h3>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Skill / Achievement Title
                </label>
                <input
                  {...form.register("title")}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Knife Skills Mastery"
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  What did you learn or accomplish?
                </label>
                <textarea
                  {...form.register("description")}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 h-32 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Today I mastered the julienne cut!"
                />
                {form.formState.errors.description && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">None</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.title}
                    </option>
                  ))}
                </select>
              </div>

              {progressUpdates.length > 0 ? (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Recent Progress Updates</h4>
                  <ul className="space-y-2">
                    {progressUpdates.map((update) => (
                      <li key={update.id} className="border border-gray-200 p-2 rounded-md">
                        <p className="text-sm font-medium">{update.title}</p>
                        <p className="text-sm text-gray-600">{update.description}</p>
                        <p className="text-sm text-gray-500">Progress: {update.progressPercentage}%</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-gray-500 text-sm mt-2">No progress updates yet for this plan.</div>
              )}

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