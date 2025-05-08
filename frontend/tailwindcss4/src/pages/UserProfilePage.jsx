import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserPlus, UserMinus, MapPin, Book, ChefHat, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserPosts, setCurrentUserPosts] = useState([]);

  // Fetch user profile and posts
  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserPosts();
    }
  }, [userId]);

  // Fetch user profile
  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsFollowing(data.isFollowing);
      } else {
        console.error('Failed to fetch user profile:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user posts
  const fetchUserPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Note: This endpoint doesn't exist yet. You'd need to create it to fetch a specific user's posts
      const response = await fetch(`http://localhost:8080/api/posts/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUserPosts(data);
      } else {
        console.error('Failed to fetch user posts:', response.status);
        // Setting empty array as fallback
        setCurrentUserPosts([]);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setCurrentUserPosts([]);
    }
  };

  // Follow user
  const handleFollow = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:8080/api/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsFollowing(true);
        
        // Update follower count
        setUser(prevUser => ({
          ...prevUser,
          followers: [...(prevUser.followers || []), 'currentUser'], // Adding current user to followers
          followersCount: (prevUser.followersCount || 0) + 1
        }));
      } else {
        console.error('Failed to follow user:', response.status);
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  // Unfollow user
  const handleUnfollow = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:8080/api/users/${userId}/unfollow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsFollowing(false);
        
        // Update follower count
        setUser(prevUser => {
          const updatedFollowers = (prevUser.followers || []).filter(id => id !== 'currentUser');
          return {
            ...prevUser,
            followers: updatedFollowers,
            followersCount: Math.max(0, (prevUser.followersCount || 0) - 1)
          };
        });
      } else {
        console.error('Failed to unfollow user:', response.status);
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />
        <div className="container mx-auto max-w-4xl px-4 pt-20 pb-10 flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />
        <div className="container mx-auto max-w-4xl px-4 pt-20 pb-10 flex-grow">
          <div className="text-center py-10">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">User Not Found</h1>
            <p className="text-gray-600 mb-6">The user you're looking for doesn't exist or you don't have permission to view this profile.</p>
            <button 
              onClick={() => navigate('/explore')} 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Back to Explore
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <div className="container mx-auto max-w-4xl px-4 pt-20 pb-10 flex-grow">
        {/* User Profile Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="relative">
            {/* Cover Image (placeholder) */}
            <div className="h-40 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
            
            {/* Profile Picture and Follow Button */}
            <div className="flex justify-between items-end px-6 -mt-16">
              <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-white bg-white">
                <img
                  src={user.profilePictureUrl || ("https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name || "User"))}
                  alt={user.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name || "User");
                  }}
                />
              </div>
              
              {isFollowing ? (
                <button
                  onClick={handleUnfollow}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full flex items-center hover:bg-gray-300 transition"
                >
                  <UserMinus className="h-5 w-5 mr-1" />
                  Unfollow
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  className="px-4 py-2 bg-blue-500 text-white rounded-full flex items-center hover:bg-blue-600 transition"
                >
                  <UserPlus className="h-5 w-5 mr-1" />
                  Follow
                </button>
              )}
            </div>
          </div>
          
          {/* User Information */}
          <div className="p-6 pt-2">
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            
            {user.location && (
              <p className="text-gray-600 flex items-center mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {user.location}
              </p>
            )}
            
            <div className="flex items-center mt-4 space-x-6 text-sm">
              <div>
                <span className="font-semibold text-gray-900">{user.followersCount || 0}</span>
                <span className="text-gray-600"> followers</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">{user.followingCount || 0}</span>
                <span className="text-gray-600"> following</span>
              </div>
            </div>
            
            {user.bio && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Bio</h2>
                <p className="text-gray-700">{user.bio}</p>
              </div>
            )}
            
            {user.favoriteCuisines && user.favoriteCuisines.length > 0 && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Favorite Cuisines</h2>
                <div className="flex flex-wrap gap-2">
                  {user.favoriteCuisines.map((cuisine, index) => (
                    <span 
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center"
                    >
                      <ChefHat className="h-3 w-3 mr-1" />
                      {cuisine}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* User Posts */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Book className="h-5 w-5 mr-2" />
              Posts
            </h2>
            
            {currentUserPosts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {currentUserPosts.map(post => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900">{post.title}</h3>
                    <p className="text-gray-700 mt-2">{post.description}</p>
                    
                    {/* Post media (if available) */}
                    {post.mediaUrls && post.mediaUrls.length > 0 && (
                      <div className="mt-3 grid grid-cols-1 gap-2">
                        {post.mediaUrls.map((mediaUrl, idx) => (
                          <img 
                            key={idx}
                            src={mediaUrl}
                            alt={`Post media ${idx + 1}`}
                            className="rounded-lg w-full h-48 object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 italic">This user hasn't posted anything yet.</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserProfilePage; 