import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Camera, Plus, Edit, Trash2, Tag, Loader2, ChefHat, Menu, LogOut, User, BookOpen } from 'lucide-react';

// Define the form schema using Zod for validation
const postSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  ingredients: z.array(z.string().min(1, 'Ingredient cannot be empty')).min(1, 'Add at least one ingredient'),
  instructions: z.array(z.string().min(1, 'Instruction cannot be empty')).min(1, 'Add at least one instruction'),
  mediaUrls: z.array(z.string().url('Must be a valid URL')).max(3, 'Maximum 3 media URLs allowed').optional(),
  tags: z.array(z.string()).optional(),
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
                to="/explore"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/explore') ? 'border-blue-400 text-white' : 'border-transparent text-gray-300 hover:border-gray-500 hover:text-white'
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
              <Plus className="mr-2 h-4 w-4" /> New Post
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
              to="/explore"
              className={`block pl-3 pr-4 py-2 ${
                isActive('/explore')
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

const PostCard = () => {
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      description: '',
      ingredients: [''],
      instructions: [''],
      mediaUrls: [],
      tags: [],
    },
  });

  // Fetch posts with JWT authentication
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('PostCard.jsx - Fetching with token:', token ? token.substring(0, 10) + '...' : 'No token');
      if (!token) {
        console.log('PostCard.jsx - No token, redirecting to /login');
        navigate('/login', { replace: true });
        return;
      }
      const response = await fetch('http://localhost:8080/api/posts/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('PostCard.jsx - Sending Authorization header:', `Bearer ${token.substring(0, 10)}...`);
      if (response.ok) {
        const data = await response.json();
        console.log('PostCard.jsx - Fetched posts:', data);
        setPosts(data);
      } else {
        console.error('PostCard.jsx - Fetch failed:', response.status);
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('PostCard.jsx - Fetch error:', error);
      localStorage.removeItem('token');
      navigate('/login', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle token from OAuth redirect and fetch posts
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      console.log('PostCard.jsx - Saving token:', token.substring(0, 10) + '...');
      localStorage.setItem('token', token);
      window.history.replaceState({}, '', '/post');
      fetchPosts();
    } else {
      const storedToken = localStorage.getItem('token');
      console.log('PostCard.jsx - Stored token:', storedToken ? storedToken.substring(0, 10) + '...' : 'No token');
      if (storedToken) {
        fetchPosts();
      } else {
        console.log('PostCard.jsx - No token, redirecting to /login');
        navigate('/login', { replace: true });
      }
    }
  }, [navigate, location]);

  // Update form when editing a post
  useEffect(() => {
    if (editingPost) {
      form.reset({
        title: editingPost.title,
        description: editingPost.description,
        ingredients: editingPost.ingredients,
        instructions: editingPost.instructions,
        mediaUrls: editingPost.mediaUrls || [],
        tags: editingPost.tags || [],
      });
    }
  }, [editingPost, form]);

  // Submit post (create or update)
  const onSubmit = async (data) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('PostCard.jsx - No token, redirecting to /login');
      navigate('/login', { replace: true });
      return;
    }

    const payload = {
      ...data,
      createdDate: new Date().toISOString(),
    };

    try {
      const url = editingPost
        ? `http://localhost:8080/api/posts/${editingPost.id}`
        : 'http://localhost:8080/api/posts';
      const method = editingPost ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await response.json();
        form.reset();
        setEditingPost(null);
        setOpen(false);
        await fetchPosts();
      } else {
        console.error('PostCard.jsx - Failed to save post:', response.status);
      }
    } catch (error) {
      console.error('PostCard.jsx - Error saving post:', error);
    }
  };

  // Add a field to ingredients, instructions, mediaUrls, or tags
  const addField = (field) => {
    const currentValues = form.getValues(field);
    form.setValue(field, [...currentValues, '']);
  };

  // Remove a field from ingredients, instructions, mediaUrls, or tags
  const removeField = (field, index) => {
    const currentValues = form.getValues(field);
    form.setValue(field, currentValues.filter((_, i) => i !== index));
  };

  // Edit a post
  const handleEditPost = (post) => {
    setEditingPost(post);
    setOpen(true);
  };

  // Delete a post
  const handleDeletePost = async (postId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('PostCard.jsx - No token, redirecting to /login');
      navigate('/login', { replace: true });
      return;
    }

    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/posts/${postId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          await fetchPosts();
        } else {
          console.error('PostCard.jsx - Failed to delete post:', response.status);
        }
      } catch (error) {
        console.error('PostCard.jsx - Error deleting post:', error);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Your Posts</h2>
            <button
              onClick={() => {
                setEditingPost(null);
                form.reset();
                setOpen(true);
              }}
              className="bg-blue-500 text-white px-3 py-1 rounded-md flex items-center hover:bg-blue-600"
            >
              <Plus className="h-4 w-4 mr-1" /> New Post
            </button>
          </div>

          {open && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                <h2 className="text-xl font-semibold">{editingPost ? 'Edit Post' : 'Create a New Post'}</h2>
                <p className="text-gray-500 mb-6">Share your cooking creations with the community!</p>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      {...form.register('title')}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="E.g., Homemade Pasta Recipe"
                    />
                    {form.formState.errors.title && (
                      <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      {...form.register('description')}
                      className="w-full border rounded-md px-3 py-2 h-20"
                      placeholder="Describe your dish or cooking experience"
                    />
                    {form.formState.errors.description && (
                      <p className="text-red-500 text-sm">{form.formState.errors.description.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Ingredients</label>
                    {form.watch('ingredients').map((_, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                          {...form.register(`ingredients.${index}`)}
                          className="w-full border rounded-md px-3 py-2"
                          placeholder={`Ingredient ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeField('ingredients', index)}
                          className="text-red-500"
                          disabled={form.watch('ingredients').length <= 1}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addField('ingredients')}
                      className="text-blue-500 flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Ingredient
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Instructions</label>
                    {form.watch('instructions').map((_, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                          {...form.register(`instructions.${index}`)}
                          className="w-full border rounded-md px-3 py-2"
                          placeholder={`Step ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeField('instructions', index)}
                          className="text-red-500"
                          disabled={form.watch('instructions').length <= 1}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addField('instructions')}
                      className="text-blue-500 flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Step
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Media URLs (up to 3)</label>
                    {form.watch('mediaUrls').map((_, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                          {...form.register(`mediaUrls.${index}`)}
                          className="w-full border rounded-md px-3 py-2"
                          placeholder="https://example.com/image.jpg"
                        />
                        <button
                          type="button"
                          onClick={() => removeField('mediaUrls', index)}
                          className="text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    {form.watch('mediaUrls').length < 3 && (
                      <button
                        type="button"
                        onClick={() => addField('mediaUrls')}
                        className="text-blue-500 flex items-center"
                      >
                        <Camera className="h-4 w-4 mr-1" /> Add Media URL
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Tags</label>
                    {form.watch('tags').map((_, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                          {...form.register(`tags.${index}`)}
                          className="w-full border rounded-md px-3 py-2"
                          placeholder="#Tag"
                        />
                        <button
                          type="button"
                          onClick={() => removeField('tags', index)}
                          className="text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addField('tags')}
                      className="text-blue-500 flex items-center"
                    >
                      <Tag className="h-4 w-4 mr-1" /> Add Tag
                    </button>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPost(null);
                        form.reset();
                        setOpen(false);
                      }}
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
                      ) : editingPost ? (
                        'Update Post'
                      ) : (
                        'Create Post'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-lg">
                <Camera className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">You haven't shared any posts yet</p>
                <button
                  onClick={() => setOpen(true)}
                  className="mt-2 text-blue-500 flex items-center mx-auto"
                >
                  <Plus className="h-4 w-4 mr-1" /> Share your first post
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
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
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPost(post)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Edit className="h-4 w-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Trash2 className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
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
                              console.log('PostCard.jsx - Post media load failed');
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PostCard;