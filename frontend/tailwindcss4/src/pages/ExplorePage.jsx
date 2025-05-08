import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ExplorePage = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const navigate = useNavigate();

  // Fetch all users initially
  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Fetch all users
  const fetchAllUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:8080/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Check follow status for each user by making individual requests
        const usersWithFollowStatus = await Promise.all(
          data.map(async (user) => {
            try {
              const followResponse = await fetch(`http://localhost:8080/api/users/${user.id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (followResponse.ok) {
                const followData = await followResponse.json();
                return {
                  ...user,
                  isFollowing: followData.isFollowing
                };
              }
              return user;
            } catch (error) {
              console.error(`Error checking follow status for user ${user.id}:`, error);
              return user;
            }
          })
        );
        
        setUsers(usersWithFollowStatus);
      } else {
        console.error('Failed to fetch users:', response.status);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Search users with debounce
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      if (query.trim() === '') {
        fetchAllUsers();
      } else {
        searchUsers(query);
      }
    }, 500);

    setSearchTimeout(timeout);
  };

  // Search users
  const searchUsers = async (query) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:8080/api/users/search?query=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Check follow status for each user by making individual requests
        const usersWithFollowStatus = await Promise.all(
          data.map(async (user) => {
            try {
              const followResponse = await fetch(`http://localhost:8080/api/users/${user.id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (followResponse.ok) {
                const followData = await followResponse.json();
                return {
                  ...user,
                  isFollowing: followData.isFollowing
                };
              }
              return user;
            } catch (error) {
              console.error(`Error checking follow status for user ${user.id}:`, error);
              return user;
            }
          })
        );
        
        setUsers(usersWithFollowStatus);
      } else {
        console.error('Failed to search users:', response.status);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to user profile
  const viewUserProfile = (userId) => {
    navigate(`/users/${userId}`);
  };

  // Follow user
  const followUser = async (userId, event) => {
    event.stopPropagation(); // Prevent triggering the card click
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
        // Update the users list to reflect the follow status
        setUsers(users.map(user => {
          if (user.id === userId) {
            return {
              ...user,
              followers: [...(user.followers || []), 'currentUser'], // Just a temporary marker
              isFollowing: true // Add this flag for UI state
            };
          }
          return user;
        }));
      } else {
        console.error('Failed to follow user:', response.status);
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  // Unfollow user
  const unfollowUser = async (userId, event) => {
    event.stopPropagation(); // Prevent triggering the card click
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
        // Update the users list to reflect the unfollow status
        setUsers(users.map(user => {
          if (user.id === userId) {
            const updatedFollowers = (user.followers || []).filter(
              id => id !== 'currentUser' // Remove the temporary marker
            );
            return {
              ...user,
              followers: updatedFollowers,
              isFollowing: false // Update this flag for UI state
            };
          }
          return user;
        }));
      } else {
        console.error('Failed to unfollow user:', response.status);
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <div className="container mx-auto max-w-6xl px-4 pt-20 pb-10 flex-grow">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Explore Cooking Enthusiasts</h1>
        
        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-white w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search for users by name..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
        
        {/* User List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map(user => (
              <div 
                key={user.id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition transform hover:scale-105 hover:shadow-lg"
                onClick={() => viewUserProfile(user.id)}
              >
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <div className="h-14 w-14 rounded-full overflow-hidden bg-gray-200 mr-3">
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
                    <div className="flex-grow">
                      <h2 className="text-lg font-semibold text-gray-800">{user.name}</h2>
                      <p className="text-sm text-gray-500">{user.location || ''}</p>
                    </div>
                    <div>
                      {user.isFollowing ? (
                        <button 
                          className="rounded-full bg-gray-200 p-2 text-gray-700 hover:bg-gray-300 transition"
                          onClick={(e) => unfollowUser(user.id, e)}
                        >
                          <UserMinus className="h-5 w-5" />
                        </button>
                      ) : (
                        <button 
                          className="rounded-full bg-blue-500 p-2 text-white hover:bg-blue-600 transition"
                          onClick={(e) => followUser(user.id, e)}
                        >
                          <UserPlus className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {user.bio || 'No bio available'}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                    <div>
                      <span className="font-semibold">{user.followersCount || 0}</span> followers
                    </div>
                    <div>
                      <span className="font-semibold">{user.followingCount || 0}</span> following
                    </div>
                    {user.favoriteCuisines && user.favoriteCuisines.length > 0 && (
                      <div>
                        <span className="font-semibold">{user.favoriteCuisines.length}</span> cuisines
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Empty State */}
        {!isLoading && users.length === 0 && (
          <div className="text-center py-10">
            <p className="text-lg text-gray-600">No users found. Try a different search.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ExplorePage; 