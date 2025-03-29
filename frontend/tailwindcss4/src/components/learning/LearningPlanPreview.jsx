// LearningPlanPreview.jsx
import { format } from "date-fns";
import { useLocation } from "wouter";


const LearningPlanPreview = ({ plan }) => {
  const [_, setLocation] = useLocation();

  // Calculate progress percentage
  const progressPercentage = plan.total > 0
    ? Math.round((plan.progress / plan.total) * 100)
    : 0;

  return (
    <div className="bg-neutral-50 rounded-lg shadow-md">
      <div className="p-3">
        <h4 className="font-medium text-neutral-900 mb-1">{plan.title}</h4>

        {/* Progress Bar */}
        <div className="mb-2 w-full bg-neutral-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* Progress Text */}
        <p className="text-xs text-neutral-600">
          {plan.progress} of {plan.total} skills completed
        </p>

        {/* Dates */}
        <div className="flex justify-between mt-2">
          <span className="text-xs text-neutral-600">
            Started: {plan.startDate ? format(new Date(plan.startDate), 'MMM d') : 'Not started'}
          </span>
          {plan.estimatedEndDate && (
            <span className="text-xs text-neutral-600">
              Est. completion: {format(new Date(plan.estimatedEndDate), 'MMM d')}
            </span>
          )}
        </div>

        {/* Continue Button */}
        <button
          onClick={() => setLocation("/learning-plans")}
          className="w-full mt-3 border border-blue-500 text-blue-500 px-3 py-1 rounded-md text-sm hover:bg-blue-500 hover:text-white transition-colors"
        >
          Continue Learning
        </button>
      </div>
    </div>
  );
};

export default LearningPlanPreview;