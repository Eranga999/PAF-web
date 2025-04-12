import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Camera, Plus, Edit, Trash2, Tag, Loader2 } from "lucide-react";

// Define the form schema using Zod for validation
const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().max(1000, "Description cannot exceed 1000 characters").optional(),
  ingredients: z.array(z.string().min(1, "Ingredient cannot be empty")).min(1, "Add at least one ingredient"),
  instructions: z.array(z.string().min(1, "Instruction cannot be empty")).min(1, "Add at least one instruction"),
  tags: z.array(z.string()).optional(),
});

const PostCard = ({ userId, onPostUpdate }) => {
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);

  const form = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      description: "",
      ingredients: [""],
      instructions: [""],
      tags: [],
    },
  });

  // Fetch posts
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/posts`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.filter((post) => post.userId === userId));
      } else {
        console.error("Failed to fetch posts:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [userId]);

  useEffect(() => {
    if (editingPost) {
      form.reset({
        title: editingPost.title,
        description: editingPost.description,
        ingredients: editingPost.ingredients,
        instructions: editingPost.instructions,
        tags: editingPost.tags || [],
      });
      setMediaFiles(editingPost.mediaUrls ? editingPost.mediaUrls.map(url => ({ url })) : []);
    } else {
      setMediaFiles([]);
    }
  }, [editingPost, form]);

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (mediaFiles.length + files.length > 3) {
      alert("You can upload a maximum of 3 photos!");
      return;
    }
    setMediaFiles([...mediaFiles, ...files.map(file => ({ file }))]);
  };

  // Remove a media file
  const removeMediaFile = (index) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const mediaUrls = [];
      for (const media of mediaFiles) {
        if (media.file) {
          const formData = new FormData();
          formData.append("file", media.file);

          const uploadResponse = await fetch("http://localhost:8080/api/upload", {
            method: "POST",
            body: formData,
          });

          if (uploadResponse.ok) {
            const uploadedUrl = await uploadResponse.text();
            mediaUrls.push(uploadedUrl);
          } else {
            throw new Error("Failed to upload media");
          }
        } else if (media.url) {
          mediaUrls.push(media.url);
        }
      }

      const payload = {
        ...data,
        userId,
        createdDate: new Date().toISOString(),
        mediaUrls,
      };

      const url = editingPost
        ? `http://localhost:8080/api/posts/${editingPost.id}`
        : "http://localhost:8080/api/posts";
      const method = editingPost ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchPosts();
        form.reset();
        setEditingPost(null);
        setOpen(false);
        setMediaFiles([]);
        if (onPostUpdate) onPostUpdate();
      } else {
        console.error("Failed to save post:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Failed to save post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addField = (field) => {
    const currentValues = form.getValues(field);
    form.setValue(field, [...currentValues, ""]);
  };

  const removeField = (field, index) => {
    const currentValues = form.getValues(field);
    form.setValue(field, currentValues.filter((_, i) => i !== index));
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setOpen(true);
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const response = await fetch(`http://localhost:8080/api/posts/${postId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setPosts(posts.filter((post) => post.id !== postId));
          if (onPostUpdate) onPostUpdate();
        }
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  return (
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold">{editingPost ? "Edit Post" : "Create a New Post"}</h2>
            <p className="text-gray-500 mb-6">Share your cooking creations with the community!</p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  {...form.register("title")}
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
                  {...form.register("description")}
                  className="w-full border rounded-md px-3 py-2 h-20"
                  placeholder="Describe your dish or cooking experience"
                />
                {form.formState.errors.description && (
                  <p className="text-red-500 text-sm">{form.formState.errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ingredients</label>
                {form.watch("ingredients").map((_, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      {...form.register(`ingredients.${index}`)}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder={`Ingredient ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeField("ingredients", index)}
                      className="text-red-500"
                      disabled={form.watch("ingredients").length <= 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addField("ingredients")}
                  className="text-blue-500 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Ingredient
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Instructions</label>
                {form.watch("instructions").map((_, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      {...form.register(`instructions.${index}`)}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder={`Step ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeField("instructions", index)}
                      className="text-red-500"
                      disabled={form.watch("instructions").length <= 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addField("instructions")}
                  className="text-blue-500 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Step
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Photos (up to 3)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="w-full border rounded-md px-3 py-2"
                  disabled={mediaFiles.length >= 3}
                />
                {mediaFiles.length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {mediaFiles.map((media, index) => (
                      <div key={index} className="relative">
                        <img
                          src={media.file ? URL.createObjectURL(media.file) : media.url}
                          alt={`Preview ${index}`}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeMediaFile(index)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                {form.watch("tags").map((_, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      {...form.register(`tags.${index}`)}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="#Tag"
                    />
                    <button
                      type="button"
                      onClick={() => removeField("tags", index)}
                      className="text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addField("tags")}
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
                    setMediaFiles([]);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={form.formState.isSubmitting || isLoading}
                  className="bg-blue-500 text-white px-6 py-2 rounded-md flex items-center disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 animate-spin h-4 w-4" />
                  ) : editingPost ? (
                    "Update Post"
                  ) : (
                    "Create Post"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-h-[80vh] overflow-y-auto">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <div className="h-48 bg-gray-200">
                    <img
                      src={post.mediaUrls[0]}
                      className="w-full h-full object-cover"
                      alt={post.title}
                    />
                  </div>
                )}
                <div className={`${post.mediaUrls?.length ? "" : "border-b"} p-4`}>
                  <div className="flex items-center mb-2">
                    <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                      <span className="text-gray-500">U{post.userId}</span>
                    </div>
                    <span className="text-sm text-gray-600">User {post.userId}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold truncate">{post.title}</h3>
                      {post.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{post.description}</p>
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
                </div>
                <div className="p-4 pt-0">
                  {post.ingredients && post.ingredients.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Ingredients</h4>
                      <ul className="list-disc pl-5 text-sm text-gray-700">
                        {post.ingredients.map((ingredient, index) => (
                          <li key={index}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {post.instructions && post.instructions.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Instructions</h4>
                      <ol className="list-decimal pl-5 text-sm text-gray-700">
                        {post.instructions.map((instruction, index) => (
                          <li key={index}>{instruction}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-4">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Posted on: {format(new Date(post.createdDate), "MMM d, yyyy")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;