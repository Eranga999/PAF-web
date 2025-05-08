import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function LearningPlanDetailPage() {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/api/learning-plans/${id}`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (response.ok) {
          const data = await response.json();
          setPlan(data);
        } else {
          setPlan(null);
        }
      } catch (error) {
        setPlan(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!plan) return <div className="p-8 text-red-500">Plan not found.</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{plan.title}</h1>
      <p className="text-gray-600 mb-4">{plan.description}</p>
      <div className="mb-4">
        <span className="font-semibold">Progress:</span> {plan.progress || 0}%
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Topics</h2>
        <ul className="list-disc pl-6">
          {plan.topics && plan.topics.length > 0 ? (
            plan.topics.map((topic, idx) => (
              <li key={idx} className={topic.completed ? "line-through text-gray-400" : ""}>
                {topic.title}
              </li>
            ))
          ) : (
            <li>No topics found.</li>
          )}
        </ul>
      </div>
    </div>
  );
} 