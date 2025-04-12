import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Camera, Edit, Trash2, Loader2, ChefHat, Menu, LogOut, User, BookOpen } from 'lucide-react';

// Define the form schema using Zod
const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bio: z.string().max(200, 'Bio cannot exceed 200 characters').optional(),
  location: z.string().max(100, 'Location cannot exceed 100 characters').optional(),
  profilePictureUrl: z.string().url('Must be a valid URL').optional(),
  favoriteCuisines: z.array(z.string()).optional(),
});

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Fetch user data for navbar
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('http://localhost:8080/api/profile', {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data);
            console.log('Navbar - Fetched user:', data);
          } else {
            console.error('Navbar - Fetch user failed:', response.status);
            localStorage.removeItem('token');
            navigate('/login', { replace: true });
          }
        } catch (error) {
          console.error('Navbar - Fetch user error:', error);
          localStorage.removeItem('token');
          navigate('/login', { replace: true });
        }
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login', { replace: true });
    console.log('Navbar - User logged out');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gray-800 shadow fixed w-full z-50 top-0">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-blue-400 font-bold text-2xl flex items-center">
                <ChefHat className="mr-2 h-6 w-6" />
                CookSkill
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/') ? 'border-blue-400 text-white' : 'border-transparent text-gray-300 hover:border-gray-500 hover:text-white'
                }`}
              >
                Home
              </Link>
              <Link
                to="/community"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/community') ? 'border-blue-400 text-white' : 'border-transparent text-gray-300 hover:border-gray-500 hover:text-white'
                }`}
              >
                Explore
              </Link>
              <Link
                to="/learningplan"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/learningplan') ? 'border-blue-400 text-white' : 'border-transparent text-gray-300 hover:border-gray-500 hover:text-white'
                }`}
              >
                Learning Plans
              </Link>
              <Link
                to="/culinaryjourney"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/culinaryjourney') ? 'border-blue-400 text-white' : 'border-transparent text-gray-300 hover:border-gray-500 hover:text-white'
                }`}
              >
                Learning Plan Overview
              </Link>
              <Link
                to="/profile"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/profile') ? 'border-blue-400 text-white' : 'border-transparent text-gray-300 hover:border-gray-500 hover:text-white'
                }`}
              >
                My Profile
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Link
              to="/post"
              className="ml-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <Edit className="mr-2 h-4 w-4" /> New Post
            </Link>
            {user && (
              <div className="ml-3 relative">
                <button
                  className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center text-white"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {user.profilePictureUrl ? (
                    <img src={user.profilePictureUrl} alt="User" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </button>
                <div
                  className={`absolute right-0 mt-2 w-48 bg-gray-700 shadow-lg rounded-md ${
                    dropdownOpen ? 'block' : 'hidden'
                  }`}
                >
                  <div className="p-2">
                    <div className="flex flex-col p-2">
                      <span className="text-white">{user.name}</span>
                      <span className="text-xs text-gray-400">{user.email}</span>
                    </div>
                    <hr className="my-1 border-gray-600" />
                    <Link
                      to="/profile"
                      className="w-full text-left p-2 hover:bg-gray-600 flex items-center text-gray-300 hover:text-white"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="mr-2 h-4 w-4" /> Profile
                    </Link>
                    <Link
                      to="/learningplan"
                      className="w-full text-left p-2 hover:bg-gray-600 flex items-center text-gray-300 hover:text-white"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <BookOpen className="mr-2 h-4 w-4" /> Learning Plans
                    </Link>
                    <hr className="my-1 border-gray-600" />
                    <button
                      className="w-full text-left p-2 hover:bg-gray-600 flex items-center text-gray-300 hover:text-white"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Log out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="sm:hidden flex items-center">
            <button className="p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-600">
          <div className="pt-2 pb-4 space-y-1">
            <Link
              to="/"
              className={`block pl-3 pr-4 py-2 ${
                isActive('/')
                  ? 'border-l-4 border-blue-400 text-blue-400 bg-gray-700 font-medium'
                  : 'border-l-4 border-transparent text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              to="/community"
              className={`block pl-3 pr-4 py-2 ${
                isActive('/community')
                  ? 'border-l-4 border-blue-400 text-blue-400 bg-gray-700 font-medium'
                  : 'border-l-4 border-transparent text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              Explore
            </Link>
            <Link
              to="/learningplan"
              className={`block pl-3 pr-4 py-2 ${
                isActive('/learningplan')
                  ? 'border-l-4 border-blue-400 text-blue-400 bg-gray-700 font-medium'
                  : 'border-l-4 border-transparent text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              Learning Plans
            </Link>
            <Link
              to="/culinaryjourney"
              className={`block pl-3 pr-4 py-2 ${
                isActive('/culinaryjourney')
                  ? 'border-l-4 border-blue-400 text-blue-400 bg-gray-700 font-medium'
                  : 'border-l-4 border-transparent text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              Learning Plan Overview
            </Link>
            <Link
              to="/profile"
              className={`block pl-3 pr-4 py-2 ${
                isActive('/profile')
                  ? 'border-l-4 border-blue-400 text-blue-400 bg-gray-700 font-medium'
                  : 'border-l-4 border-transparent text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              My Profile
            </Link>
            <div className="border-t border-gray-600 pt-2 mt-2">
              <button
                onClick={handleLogout}
                className="block w-full text-left pl-3 pr-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-800 border-t border-gray-600 mt-8 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="flex items-center">
              <ChefHat className="h-5 w-5 text-blue-400 mr-2" />
              <h2 className="text-blue-400 font-display text-xl font-bold">CookSkill</h2>
            </Link>
            <p className="text-gray-400 text-sm">Share your culinary journey with the world</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="#" className="text-gray-400 hover:text-white">
              About
            </Link>
            <Link to="#" className="text-gray-400 hover:text-white">
              Help Center
            </Link>
            <Link to="#" className="text-gray-400 hover:text-white">
              Privacy
            </Link>
            <Link to="#" className="text-gray-400 hover:text-white">
              Terms
            </Link>
          </div>
        </div>
        <div className="mt-6 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} CookSkill. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      bio: '',
      location: '',
      profilePictureUrl: '',
      favoriteCuisines: [],
    },
  });

  // Fetch user profile
  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('ProfilePage.jsx - No token, redirecting to /login');
        navigate('/login', { replace: true });
        return;
      }
      const response = await fetch('http://localhost:8080/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('ProfilePage.jsx - Fetched profile:', data);
        setUser(data);
        form.reset({
          name: data.name || '',
          bio: data.bio || '',
          location: data.location || '',
          profilePictureUrl: data.profilePictureUrl || '',
          favoriteCuisines: data.favoriteCuisines || [],
        });
      } else {
        console.error('ProfilePage.jsx - Fetch profile failed:', response.status);
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('ProfilePage.jsx - Fetch profile error:', error);
      localStorage.removeItem('token');
      navigate('/login', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user posts
  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('ProfilePage.jsx - No token, redirecting to /login');
        navigate('/login', { replace: true });
        return;
      }
      const response = await fetch('http://localhost:8080/api/profile/posts', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('ProfilePage.jsx - Fetched posts:', data);
        setPosts(data);
      } else {
        console.error('ProfilePage.jsx - Fetch posts failed:', response.status);
      }
    } catch (error) {
      console.error('ProfilePage.jsx - Fetch posts error:', error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [navigate]);

  // Update profile
  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('ProfilePage.jsx - No token, redirecting to /login');
        navigate('/login', { replace: true });
        return;
      }
      const response = await fetch('http://localhost:8080/api/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const updatedUser = await response.json();
        console.log('ProfilePage.jsx - Updated profile:', updatedUser);
        setUser(updatedUser);
        setIsEditing(false);
      } else {
        console.error('ProfilePage.jsx - Update failed:', response.status);
      }
    } catch (error) {
      console.error('ProfilePage.jsx - Update error:', error);
    }
  };

  // Delete profile
  const handleDeleteProfile = async () => {
    if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('ProfilePage.jsx - No token, redirecting to /login');
          navigate('/login', { replace: true });
          return;
        }
        const response = await fetch('http://localhost:8080/api/profile', {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          console.log('ProfilePage.jsx - Profile deleted');
          localStorage.removeItem('token');
          navigate('/login', { replace: true });
        } else {
          console.error('ProfilePage.jsx - Delete failed:', response.status);
        }
      } catch (error) {
        console.error('ProfilePage.jsx - Delete error:', error);
      }
    }
  };

  // Add/remove cuisine
  const addCuisine = () => {
    const currentCuisines = form.getValues('favoriteCuisines') || [];
    form.setValue('favoriteCuisines', [...currentCuisines, '']);
  };

  const removeCuisine = (index) => {
    const currentCuisines = form.getValues('favoriteCuisines');
    form.setValue('favoriteCuisines', currentCuisines.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-8">Unable to load profile</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 mt-16 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Your Profile</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 text-white px-3 py-1 rounded-md flex items-center hover:bg-blue-600"
              >
                <Edit className="h-4 w-4 mr-1" /> Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  {...form.register('name')}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Your name"
                />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  {...form.register('bio')}
                  className="w-full border rounded-md px-3 py-2 h-20"
                  placeholder="Tell us about yourself"
                />
                {form.formState.errors.bio && (
                  <p className="text-red-500 text-sm">{form.formState.errors.bio.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  {...form.register('location')}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="E.g., New York, NY"
                />
                {form.formState.errors.location && (
                  <p className="text-red-500 text-sm">{form.formState.errors.location.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Profile Picture URL</label>
                <input
                  {...form.register('profilePictureUrl')}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="https://example.com/image.jpg"
                />
                {form.formState.errors.profilePictureUrl && (
                  <p className="text-red-500 text-sm">{form.formState.errors.profilePictureUrl.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Favorite Cuisines</label>
                {form.watch('favoriteCuisines').map((_, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      {...form.register(`favoriteCuisines.${index}`)}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="E.g., Italian"
                    />
                    <button
                      type="button"
                      onClick={() => removeCuisine(index)}
                      className="text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCuisine}
                  className="text-blue-500 flex items-center"
                >
                  <Camera className="h-4 w-4 mr-1" /> Add Cuisine
                </button>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="bg-blue-500 text-white px-6 py-2 rounded-md flex items-center disabled:opacity-50"
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="mr-2 animate-spin h-4 w-4" />
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                {user.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/128';
                      console.log('ProfilePage.jsx - Profile picture load failed');
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-gray-600">{user.email}</p>
                {user.bio && <p className="mt-2">{user.bio}</p>}
                {user.location && <p className="mt-1 text-gray-600">📍 {user.location}</p>}
                {user.favoriteCuisines && user.favoriteCuisines.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {user.favoriteCuisines.map((cuisine, index) => (
                      <span key={index} className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {cuisine}
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-gray-500">
                  Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
                <button
                  onClick={handleDeleteProfile}
                  className="mt-4 text-red-500 flex items-center hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete Account
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Your Posts</h2>
          {posts.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <Camera className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">You haven't shared any posts yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border rounded-lg p-4">
                  <h4 className="font-medium">{post.title}</h4>
                  <p className="text-gray-600 text-sm">{post.description}</p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-2 flex gap-2">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="text-xs bg-gray-200 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className="mt-2 flex gap-2">
                      {post.mediaUrls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt="Post media"
                          className="w-20 h-20 object-cover rounded"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/80';
                            console.log('ProfilePage.jsx - Post media load failed');
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;