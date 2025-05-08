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
    <div className="flex justify-center items-start min-h-screen bg-gray-50 py-12">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-2xl w-full">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-2">{plan.title}</h1>
        <p className="text-gray-600 mb-6 text-lg">{plan.description}</p>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-gray-700">Progress</span>
            <span className="font-bold text-blue-600">{plan.progress || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${plan.progress || 0}%` }}
            ></div>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">Topics</h2>
          <ul className="space-y-2">
            {plan.topics && plan.topics.length > 0 ? (
              plan.topics.map((topic, idx) => (
                <li
                  key={idx}
                  className={`flex items-center px-4 py-2 rounded-lg border ${topic.completed ? 'bg-green-50 border-green-200 text-green-700 line-through' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
                >
                  <span className="mr-2">{topic.completed ? '✔️' : '⬜'}</span>
                  {topic.title}
                </li>
              ))
            ) : (
              <li className="text-gray-400 italic">No topics found.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
} 