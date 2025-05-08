import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Plus, X, Camera, Edit, Trash2, Search, ChevronRight, Smile, Send, MoreHorizontal, Clock, ThumbsUp, Award, Grid, List } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ImageCarousel from '../components/ImageCarousel';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [learningPlans, setLearningPlans] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const postsPerPage = 12;
  const navigate = useNavigate();
  const location = useLocation();
  const observer = useRef();

  const availableTags = [
    "Vegan", "Quick", "Spicy", "Healthy", "Gluten-Free", "Dessert", "Breakfast", "Dinner"
  ];
  const [selectedTags, setSelectedTags] = useState([]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const lastPostElementRef = useCallback(node => {
    if (isLoadingPosts) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoadingPosts, hasMore]);

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let postsToFilter = posts
      .filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
        return matchesSearch && matchesCategory;
      });
    if (selectedTags.length > 0) {
      postsToFilter = postsToFilter.filter(post =>
        post.tags && selectedTags.every(tag => post.tags.includes(tag))
      );
    }
    return postsToFilter.sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.createdDate) - new Date(a.createdDate);
        case 'oldest':
          return new Date(a.createdDate) - new Date(b.createdDate);
        case 'popular':
          return (b.likedBy?.length || 0) - (a.likedBy?.length || 0);
        default:
          return 0;
      }
    });
  }, [posts, searchTerm, filterCategory, sortBy, selectedTags]);

  // Get paginated posts
  const paginatedPosts = useMemo(() => {
    const lastPostIndex = currentPage * postsPerPage;
    return filteredPosts.slice(0, lastPostIndex);
  }, [filteredPosts, currentPage]);

  useEffect(() => {
    setHasMore(paginatedPosts.length < filteredPosts.length);
  }, [paginatedPosts, filteredPosts]);

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
            if (!post.userEmail) {
              return { ...post, userName: 'Unknown User' };
            }
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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

  const handlePostClick = useCallback((post) => {
    setSelectedPost(post);
    setCommentText('');
    setEditingComment(null);
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchLearningPlans();

    // Check if we have a success message in the location state
    if (location.state?.planCopied) {
      setShowSuccessMessage(true);
      // Remove the state after showing the message
      window.history.replaceState({}, document.title);
      
      // Hide the message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);

      // Refresh learning plans with a slight delay for better UX
      setTimeout(() => {
        fetchLearningPlans();
      }, 500);
    }
  }, [location.state]);

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

  // Calculate tag frequencies from all posts
  const tagFrequency = {};
  posts.forEach(post => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach(tag => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      });
    }
  });
  const trendingTags = Object.entries(tagFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);

  // Get all unique tags from posts
  const allTags = Array.from(
    new Set(
      posts.flatMap(post => (post.tags && Array.isArray(post.tags) ? post.tags : []))
    )
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <Navbar />
      {showSuccessMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-down">
          Plan copied successfully!
        </div>
      )}
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
              <ImageCarousel
                imageIds={selectedPost.mediaUrls}
                altPrefix={`Post ${selectedPost.title}`}
              />
              <div className="flex gap-4 mb-4 mt-4">
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
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    Comments
                    <span className="bg-blue-100 text-blue-600 text-sm px-2 py-0.5 rounded-full">
                      {selectedPost.comments?.length || 0}
                    </span>
                  </h4>
                  <div className="flex items-center gap-3">
                    <select className="text-sm text-gray-600 border-0 bg-transparent cursor-pointer hover:text-blue-600 transition-colors">
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="popular">Most Popular</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Add Comment Form */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex-shrink-0 flex items-center justify-center shadow-inner">
                        <span className="text-white font-semibold text-lg">
                          {currentUserEmail ? currentUserEmail.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                      <div className="flex-grow">
                        <div className="relative bg-gray-50 rounded-2xl p-2 hover:bg-gray-100 transition-colors duration-200">
                          <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Share your thoughts..."
                            className="w-full px-4 py-3 bg-transparent border-0 focus:ring-0 resize-none text-gray-700 placeholder-gray-400"
                            rows="2"
                          />
                          <div className="flex justify-between items-center px-4 pt-2 border-t border-gray-200">
                            <div className="flex gap-2">
                              <button className="p-2 hover:bg-gray-200 rounded-full transition-colors" title="Add emoji">
                                <Smile className="h-5 w-5 text-gray-500" />
                              </button>
                              <button className="p-2 hover:bg-gray-200 rounded-full transition-colors" title="Attach image">
                                <Camera className="h-5 w-5 text-gray-500" />
                              </button>
                            </div>
                            <button
                              onClick={() => handleAddComment(selectedPost.id)}
                              disabled={!commentText.trim()}
                              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                            >
                              <Send className="h-4 w-4" />
                              Post
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="divide-y divide-gray-100">
                    {selectedPost.comments && selectedPost.comments.length > 0 ? (
                      selectedPost.comments.map((comment, index) => (
                        <div key={index} className="group hover:bg-gray-50 transition-colors duration-200">
                          <div className="p-6">
                            <div className={`flex gap-4 ${editingComment?.commentIndex === index ? 'mb-4' : ''}`}>
                              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center shadow-inner">
                                <span className="text-white font-semibold text-lg">
                                  {comment.userEmail.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-grow">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-semibold text-gray-900">{comment.userEmail}</p>
                                      {index === 0 && (
                                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-600 text-xs px-2 py-0.5 rounded-full">
                                          <Award className="h-3 w-3" />
                                          Top Commenter
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <Clock className="h-3 w-3" />
                                      {comment.createdDate}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {(comment.userEmail === currentUserEmail || selectedPost.userEmail === currentUserEmail) && (
                                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                                        {comment.userEmail === currentUserEmail && (
                                          <button
                                            onClick={() => {
                                              setEditingComment({ postId: selectedPost.id, commentIndex: index });
                                              setEditCommentText(comment.content);
                                            }}
                                            className="p-1.5 hover:bg-blue-100 rounded-full transition-colors"
                                            title="Edit comment"
                                          >
                                            <Edit className="h-4 w-4 text-blue-600" />
                                          </button>
                                        )}
                                        <button
                                          onClick={() => handleDeleteComment(selectedPost.id, index)}
                                          className="p-1.5 hover:bg-red-100 rounded-full transition-colors"
                                          title="Delete comment"
                                        >
                                          <Trash2 className="h-4 w-4 text-red-600" />
                                        </button>
                                      </div>
                                    )}
                                    <button className="p-1.5 hover:bg-gray-200 rounded-full transition-colors">
                                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                    </button>
                                  </div>
                                </div>
                                {editingComment?.commentIndex === index ? (
                                  <div className="mt-3">
                                    <textarea
                                      value={editCommentText}
                                      onChange={(e) => setEditCommentText(e.target.value)}
                                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                                      rows="3"
                                    />
                                    <div className="flex justify-end gap-2 mt-3">
                                      <button
                                        onClick={() => setEditingComment(null)}
                                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => handleEditComment(editingComment.postId, editingComment.commentIndex)}
                                        disabled={!editCommentText.trim()}
                                        className="px-6 py-2 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 transform hover:scale-105"
                                      >
                                        Save Changes
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p className="mt-2 text-gray-700 leading-relaxed">{comment.content}</p>
                                    <div className="mt-3 flex items-center gap-4">
                                      <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors">
                                        <ThumbsUp className="h-4 w-4" />
                                        <span className="text-sm">Like</span>
                                      </button>
                                      <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors">
                                        <MessageCircle className="h-4 w-4" />
                                        <span className="text-sm">Reply</span>
                                      </button>
                                      <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors">
                                        <Share2 className="h-4 w-4" />
                                        <span className="text-sm">Share</span>
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12">
                        <div className="max-w-sm mx-auto text-center">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageCircle className="h-8 w-8 text-blue-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No comments yet</h3>
                          <p className="text-gray-500 mb-6">Be the first to share your thoughts on this post!</p>
                          <button
                            onClick={() => document.querySelector('textarea').focus()}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
                          >
                            <MessageCircle className="h-4 w-4" />
                            Write a Comment
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      ) : (
        // Main homepage content
        <main className="flex-grow container mx-auto px-4 py-8 mt-16">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Discover Culinary Delights
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore recipes, share your cooking journey, and connect with fellow food enthusiasts.
            </p>
          </div>

          {/* Advanced Search and Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-12">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search recipes, ingredients, or users..."
                  className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-4 items-center">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="main">Main Dishes</option>
                  <option value="dessert">Desserts</option>
                  <option value="appetizer">Appetizers</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                  <option value="popular">Most Popular</option>
                </select>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  >
                    <Grid className="h-5 w-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  >
                    <List className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Plans Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Learning Plans</h2>
              <button
                onClick={() => navigate('/learningplan')}
                className="text-blue-600 hover:text-blue-700 flex items-center"
              >
                View All <ChevronRight className="ml-1" />
              </button>
            </div>
            {isLoadingPlans ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : learningPlans.length > 0 ? (
              <div className="relative">
                <div className="overflow-x-auto pb-4 hide-scrollbar">
                  <div className="flex gap-6">
                    {learningPlans.slice(0, 4).map((plan) => (
                      <div
                        key={plan.id}
                        className="bg-white rounded-2xl shadow-lg p-8 mb-6 min-w-[320px] max-w-md flex-shrink-0 flex flex-col justify-between"
                      >
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{plan.description}</p>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm font-semibold text-blue-600">{plan.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${plan.progress || 0}%` }}
                          ></div>
                        </div>
                        <button
                          onClick={() => navigate(`/learning-journey/${plan.id}`)}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                {learningPlans.length > 4 && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                    <button
                      onClick={() => navigate('/learningplan')}
                      className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <ChevronRight className="h-6 w-6 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Learning Plans Yet</h3>
                <p className="text-gray-600 mb-4">Start your culinary journey by creating a learning plan</p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Create Plan
                </button>
              </div>
            )}
          </div>

          {/* Posts Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Posts</h2>
            {isLoadingPosts && currentPage === 1 ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : paginatedPosts.length > 0 ? (
              <>
                {trendingTags.length > 0 && (
                  <div className="mb-2">
                    <span className="font-semibold text-gray-700 mr-2">Trending Hashtags:</span>
                    {trendingTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 rounded-full border text-sm mr-2 mb-1 transition ${
                          selectedTags.includes(tag)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-4 py-1 rounded-full border transition ${
                          selectedTags.includes(tag)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                    {selectedTags.length > 0 && (
                      <button
                        onClick={() => setSelectedTags([])}
                        className="ml-2 px-3 py-1 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <div className={viewMode === 'grid' ? 
                  'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 
                  'space-y-6'
                }>
                  {paginatedPosts.map((post, index) => {
                    const isLastElement = index === paginatedPosts.length - 1;
                    return (
                      <div
                        key={post.id}
                        ref={isLastElement ? lastPostElementRef : null}
                        className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer ${
                          viewMode === 'list' ? 'flex' : ''
                        }`}
                        onClick={() => handlePostClick(post)}
                      >
                        {post.mediaUrls && post.mediaUrls.length > 0 ? (
                          <div className="aspect-[16/9] w-full overflow-hidden">
                            <img
                              src={`http://localhost:8080/api/images/${post.mediaUrls[0]}`}
                              alt={`Post ${post.title}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                const fallbackDiv = document.createElement('div');
                                fallbackDiv.className = 'w-full h-full flex items-center justify-center bg-gray-100';
                                fallbackDiv.innerHTML = `<svg xmlns='http://www.w3.org/2000/svg' class='h-12 w-12 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9 6 9-6' /></svg>`;
                                e.target.parentNode.appendChild(fallbackDiv);
                              }}
                              onLoad={() => console.log('HomePage.jsx - Post image loaded successfully:', post.mediaUrls[0])}
                            />
                          </div>
                        ) : (
                          <div className="aspect-[16/9] w-full bg-gray-100 flex items-center justify-center rounded-t-lg">
                            <Camera className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex items-center gap-3 mb-4">
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
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                          {post.description && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.description}</p>
                          )}
                          <div className="flex gap-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLikePost(post.id);
                              }}
                              className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors"
                            >
                              <Heart
                                className={`h-5 w-5 ${post.likedBy && post.likedBy.includes(currentUserEmail) ? 'fill-red-500 text-red-500' : ''}`}
                              />
                              <span className="text-sm">{post.likedBy ? post.likedBy.length : 0}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePostClick(post);
                              }}
                              className="flex items-center gap-1 text-gray-600 hover:text-blue-500 transition-colors"
                            >
                              <MessageCircle className="h-5 w-5" />
                              <span className="text-sm">{post.comments ? post.comments.length : 0}</span>
                            </button>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-gray-600 hover:text-green-500 transition-colors"
                            >
                              <Share2 className="h-5 w-5" />
                              <span className="text-sm">Share</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {isLoadingPosts && (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Posts Yet</h3>
                <p className="text-gray-600 mb-4">Be the first to share your culinary creations!</p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Create Post
                </button>
              </div>
            )}
          </div>

          {/* Floating Action Button */}
          <button
            onClick={() => navigate('/profile')}
            className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors hover:scale-110 transform duration-300 z-50"
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
