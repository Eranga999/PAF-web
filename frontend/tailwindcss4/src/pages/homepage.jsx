import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Plus, X, Camera, Edit, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [learningPlans, setLearningPlans] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
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
        const postsWithNames = await Promise.all(
          data.map(async (post) => {
            try {
              const userResponse = await fetch(`http://localhost:8080/api/profile/email/${post.userEmail}`, {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
              });
              if (userResponse.ok) {
                const userData = await userResponse.json();
                return { ...post, userName: userData.name || 'Unknown User' };
              }
              return { ...post, userName: 'Unknown User' };
            } catch (error) {
              console.error('HomePage.jsx - Error fetching user name for email:', post.userEmail, error);
              return { ...post, userName: 'Unknown User' };
            }
          })
        );
        setPosts(postsWithNames);
        console.log('HomePage.jsx - Fetched posts with names:', postsWithNames);
      } else {
        console.error('HomePage.jsx - Failed to fetch posts');
      }
    } catch (error) {
      console.error('HomePage.jsx - Fetch posts error:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

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
        console.error('HomePage.jsx - Failed to fetch learning plans');
      }
    } catch (error) {
      console.error('HomePage.jsx - Fetch learning plans error:', error);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const calculateProgress = (plan) => {
    if (!plan.topics || plan.topics.length === 0) return 0;
    const total = plan.topics.length;
    const completed = plan.topics.filter((topic) => topic.completed).length;
    return Math.round((completed / total) * 100);
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
        console.error('HomePage.jsx - Failed to like/unlike post');
      }
    } catch (error) {
      console.error('HomePage.jsx - Error liking/unliking post:', error);
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
      console.error('HomePage.jsx - Error adding comment:', error);
    }
  };

  // Edit a comment
  const handleEditComment = async (postId, commentIndex) => {
    if (!editCommentText.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/posts/${postId}/comment/${commentIndex}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editCommentText }),
      });
      if (response.ok) {
        const updatedPost = await response.json();
        setPosts((prevPosts) =>
          prevPosts.map((post) => (post.id === postId ? updatedPost : post))
        );
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(updatedPost);
        }
        setEditingComment(null);
        setEditCommentText('');
      } else {
        console.error('HomePage.jsx - Failed to edit comment');
      }
    } catch (error) {
      console.error('HomePage.jsx - Error editing comment:', error);
    }
  };

  // Delete a comment
  const handleDeleteComment = async (postId, commentIndex) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/posts/${postId}/comment/${commentIndex}`, {
        method: 'DELETE',
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
        console.error('HomePage.jsx - Failed to delete comment');
      }
    } catch (error) {
      console.error('HomePage.jsx - Error deleting comment:', error);
    }
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setCommentText('');
    setEditingComment(null);
  };

  useEffect(() => {
    fetchPosts();
    fetchLearningPlans();
  }, []);

  // Get current user's email from token
  const getCurrentUserEmail = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || null;
      } catch (e) {
        console.error('HomePage.jsx - Error decoding token:', e);
      }
    }
    return null;
  };

  const currentUserEmail = getCurrentUserEmail();

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
                    {selectedPost.userName ? selectedPost.userName.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold">{selectedPost.userName || 'Unknown User'}</p>
                  <p className="text-xs text-gray-500">{selectedPost.createdDate}</p>
                </div>
              </div>
              {selectedPost.mediaUrls && selectedPost.mediaUrls.length > 0 ? (
                <img
                  src={`http://localhost:8080/api/images/${selectedPost.mediaUrls[0]}`}
                  alt="Post media"
                  className="w-full h-96 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    console.error('HomePage.jsx - Failed to load image in detail view:', selectedPost.mediaUrls[0]);
                    e.target.src = 'https://via.placeholder.com/300';
                  }}
                  onLoad={() => console.log('HomePage.jsx - Detail view image loaded successfully:', selectedPost.mediaUrls[0])}
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
                      <div key={index} className="border-t pt-3 relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-semibold">{comment.userEmail}</p>
                            <p className="text-sm text-gray-600">{comment.content}</p>
                            <p className="text-xs text-gray-500">{comment.createdDate}</p>
                          </div>
                          {(comment.userEmail === currentUserEmail || selectedPost.userEmail === currentUserEmail) && (
                            <div className="flex gap-2">
                              {comment.userEmail === currentUserEmail && (
                                <button
                                  onClick={() => {
                                    setEditingComment({ postId: selectedPost.id, commentIndex: index });
                                    setEditCommentText(comment.content);
                                  }}
                                  className="text-blue-500 hover:text-blue-600"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteComment(selectedPost.id, index)}
                                className="text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No comments yet.</p>
                )}
              </div>
              {editingComment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <h3 className="text-lg font-semibold mb-4">Edit Comment</h3>
                    <textarea
                      value={editCommentText}
                      onChange={(e) => setEditCommentText(e.target.value)}
                      className="w-full border rounded-md px-3 py-2 h-20 mb-4"
                      placeholder="Edit your comment..."
                    />
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => setEditingComment(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEditComment(editingComment.postId, editingComment.commentIndex)}
                        disabled={!editCommentText.trim()}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
            </div>
          </main>
          <Footer />
        </div>
      ) : (
        // Main homepage content
        <main className="flex-grow container mx-auto px-4 py-8 mt-16">
          <h1 className="text-2xl font-bold mb-6">Discover</h1>

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
                        {post.userName ? post.userName.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{post.userName || 'Unknown User'}</p>
                      <p className="text-xs text-gray-500">{post.createdDate}</p>
                    </div>
                  </div>
                  {post.mediaUrls && post.mediaUrls.length > 0 ? (
                    <img
                      src={`http://localhost:8080/api/images/${post.mediaUrls[0]}`}
                      alt="Post media"
                      className="w-full h-64 object-cover rounded-lg mb-3 cursor-pointer"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300';
                      }}
                      onClick={() => handlePostClick(post)}
                    />
                  ) : (
                    <div
                      className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg mb-3 cursor-pointer"
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
        </main>
      )}
      {!selectedPost && <Footer />}
    </div>
  );
};

export default HomePage;