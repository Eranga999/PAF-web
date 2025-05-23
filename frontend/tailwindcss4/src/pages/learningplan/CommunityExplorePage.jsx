import { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Search, 
  Users, 
  BookOpen, 
  ChefHat, 
  Loader2, 
  Clock, 
  Check, 
  ThumbsUp, 
  MessageSquare 
} from "lucide-react";
import { useLocation } from "wouter";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";

const CommunityExplorePage = () => {
  const [activeTab, setActiveTab] = useState("plans");
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useLocation();
  const [allUsers, setAllUsers] = useState([]);
  const [allPlans, setAllPlans] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState(null);

  const user = { id: 1 }; // Replace with actual auth user

  // Fetch learning plans
  useEffect(() => {
    const fetchPlans = async () => {
      setPlansLoading(true);
      try {
        const response = await fetch("http://localhost:8080/api/learning-plans", {
          headers: {
            "Content-Type": "application/json",
            // Add auth headers if needed
          },
        });
        if (!response.ok) throw new Error("Failed to fetch learning plans");
        const data = await response.json();
        setAllPlans(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const followUser = (userId) => {
    console.log("Following user:", userId);
    // Implement API call to follow user
  };

  const copyPlan = async (plan) => {
    try {
      const newPlan = {
        ...plan,
        id: null, // Let backend generate new ID
        userId: user.id, // Assign to current user
        progress: 0, // Reset progress
        topics: plan.topics.map(topic => ({ ...topic, completed: false })), // Reset topic completion
      };
      
      const response = await fetch("http://localhost:8080/api/learning-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPlan),
      });
      
      if (!response.ok) throw new Error("Failed to copy plan");
      const createdPlan = await response.json();
      setAllPlans([...allPlans, createdPlan]);
      alert("Plan copied successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  const calculateProgress = (plan) => {
    if (!plan.topics || plan.topics.length === 0) return 0;
    const completed = plan.topics.filter(topic => topic.completed).length;
    return Math.round((completed / plan.topics.length) * 100);
  };

  const filteredUsers = searchQuery 
    ? allUsers.filter(u => 
        (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
         u.username?.toLowerCase().includes(searchQuery.toLowerCase())))
    : allUsers;

  const filteredPlans = searchQuery
    ? allPlans.filter(plan => 
        plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (plan.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false))
    : allPlans;

  const filteredPosts = searchQuery
    ? allPosts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : allPosts;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Explore</h1>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                className="w-full pl-10 pr-3 py-2 border rounded-md"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="mb-6">
            <div className="flex border-b">
              <button
                className={`px-4 py-2 flex items-center ${activeTab === "users" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setActiveTab("users")}
              >
                <Users className="h-4 w-4 mr-2" />
                Cooks
              </button>
              <button
                className={`px-4 py-2 flex items-center ${activeTab === "plans" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setActiveTab("plans")}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Learning Plans
              </button>
              <button
                className={`px-4 py-2 flex items-center ${activeTab === "recipes" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setActiveTab("recipes")}
              >
                <ChefHat className="h-4 w-4 mr-2" />
                Recipes
              </button>
            </div>

            {activeTab === "users" && (
              <div className="mt-6">
                {usersLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : filteredUsers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.map((u) => (
                      <div key={u.id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                              {u.avatarUrl ? (
                                <img 
                                  src={u.avatarUrl} 
                                  alt={u.name || u.username} 
                                  className="rounded-full"
                                  onError={e => {
                                    e.target.onerror = null;
                                    e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(u.name || u.username);
                                  }}
                                />
                              ) : (
                                <img 
                                  src={"https://ui-avatars.com/api/?name=" + encodeURIComponent(u.name || u.username)} 
                                  alt={u.name || u.username} 
                                  className="rounded-full"
                                />
                              )}
                            </div>
                            <div className="ml-4">
                              <h3 className="font-medium text-gray-900">{u.name || u.username}</h3>
                              <p className="text-sm text-gray-600">@{u.username}</p>
                              {u.location && (
                                <p className="text-xs text-gray-500 mt-1">{u.location}</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => followUser(u.id)}
                            className="border border-gray-300 px-3 py-1 rounded-md text-sm hover:bg-gray-50"
                          >
                            Follow
                          </button>
                        </div>
                        {u.bio && (
                          <p className="text-sm text-gray-700 mt-4 line-clamp-2">{u.bio}</p>
                        )}
                        <div className="mt-4">
                          <button
                            onClick={() => setLocation(`/profile/${u.id}`)}
                            className="text-gray-600 hover:text-blue-500 text-sm"
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No Users Found</h3>
                    <p className="text-gray-500">
                      {searchQuery ? `No users match "${searchQuery}"` : "There are no other users yet."}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "plans" && (
              <div className="mt-6">
                {plansLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : filteredPlans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPlans.map((plan) => (
                      <div key={plan.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="bg-blue-100 p-4">
                          <h3 className="text-lg font-semibold truncate">{plan.title}</h3>
                          <p className="text-sm text-gray-600">By: User {plan.userId || "Unknown"}</p>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{plan.description}</p>
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{plan.topics.filter(t => t.completed).length} / {plan.topics.length}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${calculateProgress(plan)}%` }}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Topics Preview:</p>
                            {plan.topics.slice(0, 3).map((topic, index) => (
                              <div key={index} className="flex items-center">
                                {topic.completed ? (
                                  <Check className="h-4 w-4 text-blue-500 mr-2" />
                                ) : (
                                  <div className="h-4 w-4 border border-gray-400 rounded-sm mr-2" />
                                )}
                                <span className={`${topic.completed ? "line-through text-gray-400" : "text-gray-700"} text-sm`}>
                                  {topic.title}
                                </span>
                              </div>
                            ))}
                            {plan.topics.length > 3 && (
                              <p className="text-xs text-gray-500">+ {plan.topics.length - 3} more topics</p>
                            )}
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Created: {plan.startDate ? format(new Date(plan.startDate), 'MMM d, yyyy') : 'N/A'}
                          </div>
                        </div>
                        <div className="flex justify-between border-t p-4">
                          <button
                            onClick={() => copyPlan(plan)}
                            className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition-colors"
                          >
                            Copy Plan
                          </button>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {plan.estimatedEndDate ? (
                              <span>Target: {format(new Date(plan.estimatedEndDate), 'MMM d, yyyy')}</span>
                            ) : (
                              <span>No target date</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No Learning Plans Found</h3>
                    <p className="text-gray-500">
                      {searchQuery ? `No plans match "${searchQuery}"` : "No learning plans available yet."}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "recipes" && (
              <div className="mt-6">
                {postsLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : filteredPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map((post) => (
                      <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        {post.mediaUrls && post.mediaUrls.length > 0 && (
                          <div className="h-48 bg-gray-200">
                            <img
                              src={post.mediaUrls[0]}
                              className="w-full h-full object-cover"
                              alt={post.title}
                            />
                          </div>
                        )}
                        <div className={`${post.mediaUrls?.length ? "" : "border-b"} p-4`}>
                          <div className="flex items-center mb-2">
                            <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                              <span className="text-gray-500">U{post.userId}</span>
                            </div>
                            <span className="text-sm text-gray-600">User {post.userId}</span>
                          </div>
                          <h3 className="text-xl font-semibold truncate">{post.title}</h3>
                        </div>
                        <div className="p-4 pt-0">
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{post.content}</p>
                        </div>
                        <div className="flex justify-between border-t p-4">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              <span>0</span>
                            </div>
                            <div className="flex items-center">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              <span>0</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {post.createdAt ? format(new Date(post.createdAt), 'MMM d, yyyy') : 'Recently'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No Recipes Found</h3>
                    <p className="text-gray-500">
                      {searchQuery ? `No recipes match "${searchQuery}"` : "There are no recipes yet."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CommunityExplorePage;