import React, { useEffect, useState } from 'react';
import axios from 'axios';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hardcoded userId for demo; in a real app, this would come from auth context
  const userId = 'example-user-id';

  useEffect(() => {
    // Fetch user data
    axios
      .get(`http://localhost:8080/api/users/${userId}`) // Adjust endpoint if you add a UserController
      .then((response) => setUser(response.data))
      .catch((error) => console.error('Error fetching user:', error));

    // Fetch posts by userId
    axios
      .get(`http://localhost:8080/api/posts?userId=${userId}`) // Add this endpoint in backend if needed
      .then((response) => {
        setPosts(response.data);
        setLoading(false);
      })
      .catch((error) => console.error('Error fetching posts:', error));
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex items-center">
          <img
            src={user?.profilePicture || 'https://via.placeholder.com/150'}
            alt="Profile"
            className="w-24 h-24 rounded-full mr-4"
          />
          <div>
            <h2 className="text-2xl font-bold">{user?.username || 'User'}</h2>
            <p className="text-gray-600">{user?.bio || 'No bio available'}</p>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-4">Posts</h3>
      {posts.length === 0 ? (
        <p className="text-gray-500">No posts yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition"
            >
              <h4 className="text-lg font-semibold">{post.title}</h4>
              <p className="text-gray-600">{post.description}</p>
              {post.mediaUrls && post.mediaUrls.length > 0 && (
                <img
                  src={post.mediaUrls[0].url}
                  alt="Post media"
                  className="mt-2 w-full h-48 object-cover rounded"
                />
              )}
              <p className="text-sm text-gray-500 mt-2">
                Created: {post.createdAt}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserProfile;