import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Camera, Plus, Edit, Trash2, Loader2, X, Heart, MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Define schemas for profile and post using Zod
const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bio: z.string().max(200, 'Bio cannot exceed 200 characters').optional(),
  location: z.string().max(100, 'Location cannot exceed 100 characters').optional(),
  profilePictureUrl: z.string().url('Must be a valid URL').optional(),
  favoriteCuisines: z.array(z.string()).optional(),
});

const postSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  ingredients: z.array(z.string().min(1, 'Ingredient cannot be empty')).min(1, 'Add at least one ingredient'),
  instructions: z.array(z.string().min(1, 'Instruction cannot be empty')).min(1, 'Add at least one instruction'),
  tags: z.array(z.string()).optional(),
});

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [openPostModal, setOpenPostModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [commentText, setCommentText] = useState('');
  const navigate = useNavigate();

  // Profile form
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      bio: '',
      location: '',
      profilePictureUrl: '',
      favoriteCuisines: [],
    },
  });

  // Post form
  const postForm = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      description: '',
      ingredients: [''],
      instructions: [''],
      tags: [],
    },
  });

  // Fetch user profile
  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
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
        setUser(data);
        profileForm.reset({
          name: data.name || '',
          bio: data.bio || '',
          location: data.location || '',
          profilePictureUrl: data.profilePictureUrl || '',
          favoriteCuisines: data.favoriteCuisines || [],
        });
      } else {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } catch (error) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user posts
  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      const response = await fetch('http://localhost:8080/api/posts/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
        console.log('ProfilePage.jsx - Fetched posts:', data);
      }
    } catch (error) {
      console.error('ProfilePage.jsx - Fetch posts error:', error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, []);

  // Update profile
  const onProfileSubmit = async (data) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
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
        setUser(updatedUser);
        setIsEditingProfile(false);
      }
    } catch (error) {
      console.error('ProfilePage.jsx - Update error:', error);
    }
  };

  // Upload profile picture
  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Show loading state
      setIsLoading(true);

      const response = await fetch('http://localhost:8080/api/profile/picture', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const profilePictureUrl = await response.text();
        console.log('ProfilePage.jsx - Uploaded profile picture URL:', profilePictureUrl);
        
        // Update the form value
        profileForm.setValue('profilePictureUrl', profilePictureUrl);
        
        // Update the user state to show the new image immediately
        setUser(prevUser => ({
          ...prevUser,
          profilePictureUrl: profilePictureUrl
        }));
      } else {
        console.error('Profile picture upload failed:', await response.text());
        alert('Failed to upload profile picture. Please try again.');
      }
    } catch (error) {
      console.error('ProfilePage.jsx - Profile picture upload error:', error);
      alert('An error occurred while uploading your profile picture.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add/remove cuisine
  const addCuisine = () => {
    const currentCuisines = profileForm.getValues('favoriteCuisines') || [];
    profileForm.setValue('favoriteCuisines', [...currentCuisines, '']);
  };

  const removeCuisine = (index) => {
    const currentCuisines = profileForm.getValues('favoriteCuisines');
    profileForm.setValue('favoriteCuisines', currentCuisines.filter((_, i) => i !== index));
  };

  // Update post form when editing
  useEffect(() => {
    if (editingPost) {
      postForm.reset({
        title: editingPost.title,
        description: editingPost.description,
        ingredients: editingPost.ingredients,
        instructions: editingPost.instructions,
        tags: editingPost.tags || [],
      });
      setUploadedFiles(editingPost.mediaUrls || []);
    } else {
      setUploadedFiles([]);
    }
  }, [editingPost, postForm]);

  // Handle file upload
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    if (uploadedFiles.length + files.length > 3) {
      alert('You can upload a maximum of 3 images.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const newImageIds = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('http://localhost:8080/api/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          const imageId = await response.text();
          console.log('ProfilePage.jsx - Uploaded image ID:', imageId);
          newImageIds.push(imageId);
        } else {
          console.error('File upload failed for', file.name);
        }
      } catch (error) {
        console.error('ProfilePage.jsx - File upload error:', error);
      }
    }

    setUploadedFiles((prev) => [...prev, ...newImageIds]);
  };

  // Remove uploaded file
  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit post
  const onPostSubmit = async (data) => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const payload = {
      ...data,
      mediaUrls: uploadedFiles,
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
        postForm.reset();
        setUploadedFiles([]);
        setEditingPost(null);
        setOpenPostModal(false);
        await fetchPosts();
      }
    } catch (error) {
      console.error('ProfilePage.jsx - Error saving post:', error);
    }
  };

  // Add a field to ingredients, instructions, or tags
  const addField = (field) => {
    const currentValues = postForm.getValues(field);
    postForm.setValue(field, [...currentValues, '']);
  };

  // Remove a field from ingredients, instructions, or tags
  const removeField = (field, index) => {
    const currentValues = postForm.getValues(field);
    postForm.setValue(field, currentValues.filter((_, i) => i !== index));
  };

  // Edit a post
  const handleEditPost = (post) => {
    setEditingPost(post);
    setOpenPostModal(true);
    setSelectedPost(null);
  };

  // Delete a post
  const handleDeletePost = async (postId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
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
          setSelectedPost(null);
        }
      } catch (error) {
        console.error('ProfilePage.jsx - Error deleting post:', error);
      }
    }
  };

  // Like or unlike a post
  const handleLikePost = async (postId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const updatedPost = await response.json();
        setPosts((prevPosts) =>
          prevPosts.map((post) => (post.id === postId ? updatedPost : post))
        );
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(updatedPost);
        }
      } else {
        console.error('ProfilePage.jsx - Failed to like/unlike post');
      }
    } catch (error) {
      console.error('ProfilePage.jsx - Error liking/unliking post:', error);
    }
  };

  // Add a comment
  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: commentText }),
      });
      if (response.ok) {
        const updatedPost = await response.json();
        setPosts((prevPosts) =>
          prevPosts.map((post) => (post.id === postId ? updatedPost : post))
        );
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(updatedPost);
        }
        setCommentText('');
      }
    } catch (error) {
      console.error('ProfilePage.jsx - Error adding comment:', error);
    }
  };

  // Handle post click to show details
  const handlePostClick = (post) => {
    setSelectedPost(post);
    setCommentText('');
  };

  // Get current user's email from token
  const getCurrentUserEmail = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || null;
      } catch (e) {
        console.error('ProfilePage.jsx - Error decoding token:', e);
      }
    }
    return null;
  };

  const currentUserEmail = getCurrentUserEmail();

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
      </div>
    );
  }

  if (!user || Object.keys(user).length === 0) {
    return <div className="text-center py-8">Unable to load profile</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      {selectedPost ? (
        // Full-screen post detail view
        <div className="flex flex-col min-h-screen bg-gray-100">
          <div className="sticky top-0 bg-white shadow-md z-10 px-4 py-3 flex justify-between items-center">
            <h2 className="text-xl font-semibold truncate">{selectedPost.title}</h2>
            <button
              onClick={() => setSelectedPost(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <main className="flex-grow container mx-auto px-4 py-6 overflow-y-auto">
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">
                    {selectedPost.userEmail ? selectedPost.userEmail.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold">{selectedPost.userEmail || 'Unknown User'}</p>
                  <p className="text-xs text-gray-500">{selectedPost.createdDate}</p>
                </div>
              </div>
              {selectedPost.mediaUrls && selectedPost.mediaUrls.length > 0 ? (
                <img
                  src={`http://localhost:8080/api/images/${selectedPost.mediaUrls[0]}`}
                  alt="Post media"
                  className="w-full h-96 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    console.error('ProfilePage.jsx - Failed to load image in detail view:', selectedPost.mediaUrls[0]);
                    e.target.src = 'https://via.placeholder.com/300';
                  }}
                  onLoad={() => console.log('ProfilePage.jsx - Detail view image loaded successfully:', selectedPost.mediaUrls[0])}
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg mb-4">
                  <Camera className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => handleLikePost(selectedPost.id)}
                  className="flex items-center gap-1 text-gray-600 hover:text-red-500"
                >
                  <Heart
                    className={`h-5 w-5 ${selectedPost.likedBy && selectedPost.likedBy.includes(currentUserEmail) ? 'fill-red-500 text-red-500' : ''}`}
                  />
                  <span className="text-sm">{selectedPost.likedBy ? selectedPost.likedBy.length : 0} Likes</span>
                </button>
                <button className="flex items-center gap-1 text-gray-600">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm">{selectedPost.comments ? selectedPost.comments.length : 0} Comments</span>
                </button>
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Liked By</h4>
                {selectedPost.likedBy && selectedPost.likedBy.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.likedBy.map((email, index) => (
                      <span key={index} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {email}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No likes yet.</p>
                )}
              </div>
              {selectedPost.description && (
                <p className="text-gray-600 mb-4">{selectedPost.description}</p>
              )}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Ingredients</h4>
                {selectedPost.ingredients && selectedPost.ingredients.length > 0 ? (
                  <ul className="list-disc list-inside text-gray-600">
                    {selectedPost.ingredients.map((ingredient, index) => (
                      <li key={index} className="text-sm">{ingredient}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No ingredients listed.</p>
                )}
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Instructions</h4>
                {selectedPost.instructions && selectedPost.instructions.length > 0 ? (
                  <ol className="list-decimal list-inside text-gray-600">
                    {selectedPost.instructions.map((instruction, index) => (
                      <li key={index} className="text-sm">{instruction}</li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-gray-500 text-sm">No instructions provided.</p>
                )}
              </div>
              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedPost.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Comments</h4>
                {selectedPost.comments && selectedPost.comments.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPost.comments.map((comment, index) => (
                      <div key={index} className="border-t pt-3">
                        <p className="text-sm font-semibold">{comment.userEmail}</p>
                        <p className="text-sm text-gray-600">{comment.content}</p>
                        <p className="text-xs text-gray-500">{comment.createdDate}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No comments yet.</p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
                <button
                  onClick={() => handleAddComment(selectedPost.id)}
                  disabled={!commentText.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50 text-sm"
                >
                  Post
                </button>
              </div>
              <div className="flex justify-end gap-4 mt-4">
                <button
                  onClick={() => handleEditPost(selectedPost)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Edit Post
                </button>
                <button
                  onClick={() => handleDeletePost(selectedPost.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  Delete Post
                </button>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      ) : (
        // Main profile content
        <main className="flex-grow container mx-auto px-4 py-8 mt-16">
          {/* Profile Section */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                {user.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/96';
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              {user.location && <p className="text-gray-600 mt-1">{user.location}</p>}
              {user.bio && <p className="text-gray-600 mt-2">{user.bio}</p>}
              <div className="flex justify-center gap-6 mt-4">
                <div className="text-center">
                  <p className="font-semibold">{posts.length}</p>
                  <p className="text-sm text-gray-500">Posts</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{user.followersCount || 0}</p>
                  <p className="text-sm text-gray-500">Followers</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{user.followingCount || 0}</p>
                  <p className="text-sm text-gray-500">Following</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600"
              >
                Edit Profile
              </button>
            </div>

            {/* Edit Profile Form */}
            {isEditingProfile && (
              <div className="mt-6">
                <h2 className="text-xl font-bold mb-4 text-center">Edit Profile</h2>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      {...profileForm.register('name')}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="Your name"
                    />
                    {profileForm.formState.errors.name && (
                      <p className="text-red-500 text-sm">{profileForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Bio</label>
                    <textarea
                      {...profileForm.register('bio')}
                      className="w-full border rounded-md px-3 py-2 h-20"
                      placeholder="Tell us about yourself"
                    />
                    {profileForm.formState.errors.bio && (
                      <p className="text-red-500 text-sm">{profileForm.formState.errors.bio.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input
                      {...profileForm.register('location')}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="E.g., New York, NY"
                    />
                    {profileForm.formState.errors.location && (
                      <p className="text-red-500 text-sm">{profileForm.formState.errors.location.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Profile Picture</label>
                    
                    {/* Profile Picture Upload */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Upload an image:</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureUpload}
                          className="w-full border rounded-md px-3 py-2"
                          id="profile-picture-upload"
                        />
                        {isLoading && <Loader2 className="animate-spin h-5 w-5 text-blue-500" />}
                      </div>
                    </div>
                    
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="border-t border-gray-300 w-full"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-2 text-sm text-gray-500">OR</span>
                      </div>
                    </div>
                    
                    {/* Profile Picture URL */}
                    <p className="text-sm text-gray-600 mb-2">Enter an image URL:</p>
                    <input
                      {...profileForm.register('profilePictureUrl')}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="https://example.com/image.jpg"
                    />
                    {profileForm.formState.errors.profilePictureUrl && (
                      <p className="text-red-500 text-sm">{profileForm.formState.errors.profilePictureUrl.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Favorite Cuisines</label>
                    {profileForm.watch('favoriteCuisines').map((_, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                          {...profileForm.register(`favoriteCuisines.${index}`)}
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

                  <div className="flex justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={profileForm.formState.isSubmitting}
                      className="bg-blue-500 text-white px-6 py-2 rounded-md flex items-center disabled:opacity-50"
                    >
                      {profileForm.formState.isSubmitting ? (
                        <Loader2 className="mr-2 animate-spin h-4 w-4" />
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Posts Section */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-20">
            <h2 className="text-xl font-bold mb-4">Your Posts</h2>
            {posts.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {posts.map((post) => (
                  <div key={post.id} className="relative">
                    {post.mediaUrls && post.mediaUrls.length > 0 ? (
                      <>
                        {console.log('ProfilePage.jsx - Rendering image for post:', post.id, 'Image ID:', post.mediaUrls[0])}
                        <img
                          src={`http://localhost:8080/api/images/${post.mediaUrls[0]}`}
                          alt="Post media"
                          className="w-full h-48 object-cover rounded-lg cursor-pointer"
                          onError={(e) => {
                            console.error('ProfilePage.jsx - Failed to load image:', post.mediaUrls[0]);
                            e.target.src = 'https://via.placeholder.com/150';
                          }}
                          onLoad={() => console.log('ProfilePage.jsx - Image loaded successfully:', post.mediaUrls[0])}
                          onClick={() => handlePostClick(post)}
                        />
                      </>
                    ) : (
                      <div
                        className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg cursor-pointer"
                        onClick={() => handlePostClick(post)}
                      >
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="mt-2">
                      <p className="text-sm font-semibold text-gray-800 truncate">{post.title || 'Untitled Post'}</p>
                    </div>
                    <div className="flex gap-4 mt-1">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className="flex items-center gap-1 text-gray-600 hover:text-red-500"
                      >
                        <Heart
                          className={`h-5 w-5 ${post.likedBy && post.likedBy.includes(currentUserEmail) ? 'fill-red-500 text-red-500' : ''}`}
                        />
                        <span className="text-sm">{post.likedBy ? post.likedBy.length : 0}</span>
                      </button>
                      <button
                        onClick={() => handlePostClick(post)}
                        className="flex items-center gap-1 text-gray-600"
                      >
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-sm">{post.comments ? post.comments.length : 0}</span>
                      </button>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => handleEditPost(post)}
                        className="p-1 bg-white rounded-full shadow hover:bg-gray-100"
                      >
                        <Edit className="h-4 w-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-1 bg-white rounded-full shadow hover:bg-gray-100"
                      >
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">No posts yet. Create one to get started!</p>
            )}
          </div>

          {/* Floating Action Button */}
          <button
            onClick={() => {
              setEditingPost(null);
              postForm.reset();
              setOpenPostModal(true);
            }}
            className="fixed bottom-16 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 z-50"
          >
            <Plus className="h-6 w-6" />
          </button>

          {/* Post Creation/Editing Modal */}
          {openPostModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <h2 className="text-xl font-semibold">{editingPost ? 'Edit Post' : 'Create a New Post'}</h2>
                <p className="text-gray-500 mb-6">Share your cooking creations with the community!</p>

                <form onSubmit={postForm.handleSubmit(onPostSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      {...postForm.register('title')}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="E.g., Homemade Pasta Recipe"
                    />
                    {postForm.formState.errors.title && (
                      <p className="text-red-500 text-sm">{postForm.formState.errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      {...postForm.register('description')}
                      className="w-full border rounded-md px-3 py-2 h-20"
                      placeholder="Describe your dish or cooking experience"
                    />
                    {postForm.formState.errors.description && (
                      <p className="text-red-500 text-sm">{postForm.formState.errors.description.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Ingredients</label>
                    {postForm.watch('ingredients').map((_, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                          {...postForm.register(`ingredients.${index}`)}
                          className="w-full border rounded-md px-3 py-2"
                          placeholder={`Ingredient ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeField('ingredients', index)}
                          className="text-red-500"
                          disabled={postForm.watch('ingredients').length <= 1}
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
                    {postForm.watch('instructions').map((_, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                          {...postForm.register(`instructions.${index}`)}
                          className="w-full border rounded-md px-3 py-2"
                          placeholder={`Step ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeField('instructions', index)}
                          className="text-red-500"
                          disabled={postForm.watch('instructions').length <= 1}
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
                    <label className="block text-sm font-medium mb-1">Upload Images (up to 3)</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="w-full border rounded-md px-3 py-2"
                    />
                    {uploadedFiles.length > 0 && (
                      <div className="mt-2">
                        {uploadedFiles.map((imageId, index) => (
                          <div key={index} className="flex items-center gap-2 mb-2">
                            <img
                              src={`http://localhost:8080/api/images/${imageId}`}
                              alt={`Uploaded ${index}`}
                              className="w-16 h-16 object-cover rounded"
                              onError={(e) => {
                                console.error('ProfilePage.jsx - Failed to load uploaded image:', imageId);
                                e.target.src = 'https://via.placeholder.com/64';
                              }}
                              onLoad={() => console.log('ProfilePage.jsx - Uploaded image loaded successfully:', imageId)}
                            />
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-500"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Tags</label>
                    {postForm.watch('tags').map((_, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                          {...postForm.register(`tags.${index}`)}
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
                      <Plus className="h-4 w-4 mr-1" /> Add Tag
                    </button>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPost(null);
                        postForm.reset();
                        setUploadedFiles([]);
                        setOpenPostModal(false);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={postForm.formState.isSubmitting}
                      className="bg-blue-500 text-white px-6 py-2 rounded-md flex items-center disabled:opacity-50"
                    >
                      {postForm.formState.isSubmitting ? (
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
        </main>
      )}
      {!selectedPost && <Footer />}
    </div>
  );
};

export default ProfilePage;