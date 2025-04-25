// LearningPlanPreview.jsx
import { format } from "date-fns";
import { useLocation } from "wouter";
import { Calendar, Target, Award, ChevronRight, BookOpen } from "lucide-react";

const LearningPlanPreview = ({ plan }) => {
  const [_, setLocation] = useLocation();

  // Calculate progress percentage
  const progressPercentage = plan.total > 0
    ? Math.round((plan.progress / plan.total) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
              {plan.title}
            </h4>
            <p className="text-sm text-gray-500 line-clamp-2">{plan.description}</p>
          </div>
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600">
            <BookOpen className="w-5 h-5" />
          </span>
        </div>

        {/* Progress Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-blue-600">{progressPercentage}%</span>
          </div>
          <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500 flex items-center">
            <Award className="w-3 h-3 mr-1" />
            {plan.progress} of {plan.total} skills mastered
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium">Started:</span>
            <span className="ml-2">
              {plan.startDate ? format(new Date(plan.startDate), 'MMM d, yyyy') : 'Not started'}
            </span>
          </div>
          {plan.estimatedEndDate && (
            <div className="flex items-center text-sm text-gray-600">
              <Target className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium">Target:</span>
              <span className="ml-2">
                {format(new Date(plan.estimatedEndDate), 'MMM d, yyyy')}
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={() => setLocation("/learning-plans")}
          className="w-full bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 font-medium px-6 py-3 rounded-lg flex items-center justify-center group-hover:border-blue-300 transition-all duration-300"
        >
          Continue Learning
          <ChevronRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
        </button>

        {/* Achievement Badge */}
        {progressPercentage >= 50 && (
          <div className="mt-4 flex items-center justify-center bg-amber-50 rounded-lg py-2 px-3">
            <Award className="w-4 h-4 text-amber-500 mr-2" />
            <span className="text-xs font-medium text-amber-700">
              {progressPercentage >= 100 ? 'Course Completed!' : 'Making Great Progress!'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPlanPreview;