import React, { useState } from 'react';
import axios from 'axios';

function AddPostForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    mediaUrls: [{ url: '', type: 'image', isPrimary: true }],
    tags: '',
    userId: 'example-user-id', // Hardcoded for demo; use auth context in real app
    createdAt: new Date().toISOString(),
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMediaChange = (index, e) => {
    const { name, value } = e.target;
    const newMediaUrls = [...formData.mediaUrls];
    newMediaUrls[index] = { ...newMediaUrls[index], [name]: value };
    setFormData({ ...formData, mediaUrls: newMediaUrls });
  };

  const addMediaField = () => {
    setFormData({
      ...formData,
      mediaUrls: [...formData.mediaUrls, { url: '', type: 'image', isPrimary: false }],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const postData = {
      ...formData,
      tags: formData.tags.split(',').map((tag) => tag.trim()), // Convert tags to array
    };

    try {
      const response = await axios.post('http://localhost:8080/api/posts', postData);
      setSuccess('Post created successfully!');
      setFormData({
        title: '',
        description: '',
        ingredients: '',
        instructions: '',
        mediaUrls: [{ url: '', type: 'image', isPrimary: true }],
        tags: '',
        userId: 'example-user-id',
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      setError('Failed to create post: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Add a New Post</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Ingredients</label>
          <textarea
            name="ingredients"
            value={formData.ingredients}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Instructions</label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Media URLs</label>
          {formData.mediaUrls.map((media, index) => (
            <div key={index} className="flex space-x-2 mt-1">
              <input
                type="text"
                name="url"
                value={media.url}
                onChange={(e) => handleMediaChange(index, e)}
                className="block w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Media URL"
                required
              />
              <select
                name="type"
                value={media.type}
                onChange={(e) => handleMediaChange(index, e)}
                className="p-2 border rounded-md"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
          ))}
          <button
            type="button"
            onClick={addMediaField}
            className="mt-2 text-blue-600 hover:underline"
          >
            + Add Another Media URL
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., dessert, quick, vegan"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
        >
          Create Post
        </button>
      </form>
    </div>
  );
}

export default AddPostForm;