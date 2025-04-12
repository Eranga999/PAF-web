import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Home, Bell, User, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [learningPlans, setLearningPlans] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const navigate = useNavigate();

  // Fetch all posts from all users
  const fetchPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const response = await fetch('http://localhost:8080/api/posts', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
        console.log('HomePage.jsx - Fetched posts:', data);
      } else {
        console.error('Failed to fetch posts');
      }
    } catch (error) {
      console.error('HomePage.jsx - Fetch posts error:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Fetch learning plans
  const fetchLearningPlans = async () => {
    setIsLoadingPlans(true);
    try {
      const response = await fetch('http://localhost:8080/api/learning-plans', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const plans = await response.json();
        setLearningPlans(plans);
        console.log('HomePage.jsx - Fetched learning plans:', plans);
      } else {
        console.error('Failed to fetch learning plans');
      }
    } catch (error) {
      console.error('HomePage.jsx - Fetch learning plans error:', error);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  // Calculate progress for learning plans
  const calculateProgress = (plan) => {
    if (!plan.topics || plan.topics.length === 0) return 0;
    const total = plan.topics.length;
    const completed = plan.topics.filter((topic) => topic.completed).length;
    return Math.round((completed / total) * 100);
  };

  // Initial fetch
  useEffect(() => {
    fetchPosts();
    fetchLearningPlans();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        {/* Discover Header */}
        <h1 className="text-2xl font-bold mb-6">Discover</h1>

        {/* Horizontal Learning Plans Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Your Learning Plans</h2>
          {isLoadingPlans ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : learningPlans.length > 0 ? (
            <div className="flex overflow-x-auto space-x-4 pb-4">
              {learningPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white rounded-xl shadow-md p-4 w-64 flex-shrink-0"
                >
                  <h3 className="text-md font-semibold text-gray-900 truncate">{plan.title}</h3>
                  <p className="text-gray-600 text-sm mt-1 truncate">{plan.description}</p>
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-700">Progress</span>
                      <span className="text-xs font-medium text-blue-600">{calculateProgress(plan)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${calculateProgress(plan)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-xs font-medium text-gray-700 mb-1">Topics</h4>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {plan.topics && plan.topics.map((topic, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className={`h-4 w-4 rounded-full ${topic.completed ? 'bg-green-500' : 'border-2 border-gray-300'}`}></div>
                          <span className={`text-xs ${topic.completed ? 'line-through text-gray-500' : 'text-gray-800'} truncate`}>
                            {topic.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <p className="text-gray-500">No learning plans yet. Create one to get started!</p>
            </div>
          )}
        </div>

        {/* Vertical Posts Feed */}
        <div className="space-y-6 mb-20">
          {isLoadingPosts ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl shadow-md p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">
                      {post.userEmail ? post.userEmail.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{post.userEmail || 'Unknown User'}</p>
                    <p className="text-xs text-gray-500">{post.createdDate}</p>
                  </div>
                </div>
                {post.mediaUrls && post.mediaUrls.length > 0 ? (
                  <img
                    src={`http://localhost:8080/api/images/${post.mediaUrls[0]}`}
                    alt="Post media"
                    className="w-full h-64 object-cover rounded-lg mb-3"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300';
                    }}
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg mb-3">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
                <div className="flex gap-4">
                  <button className="flex items-center gap-1 text-gray-600">
                    <Heart className="h-5 w-5" />
                    <span className="text-sm">247</span>
                  </button>
                  <button className="flex items-center gap-1 text-gray-600">
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm">57</span>
                  </button>
                  <button className="flex items-center gap-1 text-gray-600">
                    <Share2 className="h-5 w-5" />
                    <span className="text-sm">33</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl shadow-md p-6 text-center">
              <p className="text-gray-500">No posts yet. Be the first to share something!</p>
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => navigate('/profile')}
          className="fixed bottom-16 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 z-50"
        >
          <Plus className="h-6 w-6" />
        </button>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-t-lg flex justify-around items-center py-2">
          <button onClick={() => navigate('/')} className="p-2">
            <Home className="h-6 w-6 text-gray-500" />
          </button>
          <button onClick={() => navigate('/chat')} className="p-2">
            <MessageCircle className="h-6 w-6 text-gray-500" />
          </button>
          <div className="w-12 h-12" /> {/* Spacer for FAB */}
          <button onClick={() => navigate('/notifications')} className="p-2">
            <Bell className="h-6 w-6 text-gray-500" />
          </button>
          <button onClick={() => navigate('/profile')} className="p-2">
            <User className="h-6 w-6 text-gray-500" />
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;