import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Plus, Edit, Trash2, Tag, Loader2 } from "lucide-react";

// Define the form schema using Zod for validation
const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().max(1000, "Description cannot exceed 1000 characters").optional(),
  ingredients: z.array(z.string().min(1, "Ingredient cannot be empty")).min(1, "Add at least one ingredient"),
  instructions: z.array(z.string().min(1, "Instruction cannot be empty")).min(1, "Add at least one instruction"),
  mediaUrls: z.array(z.string().url("Must be a valid URL")).max(3, "Maximum 3 media URLs allowed").optional(),
  tags: z.array(z.string()).optional(),
});

const PostCard = ({ userId, onPostUpdate }) => {
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const form = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      description: "",
      ingredients: [""],
      instructions: [""],
      mediaUrls: [],
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
        setPosts(data.filter(post => post.userId === userId));
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
        mediaUrls: editingPost.mediaUrls || [],
        tags: editingPost.tags || [],
      });
    }
  }, [editingPost, form]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      userId,
      createdDate: new Date().toISOString(),
    };

    try {
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
        const updatedPost = await response.json();
        if (editingPost) {
          setPosts(posts.map((post) => (post.id === updatedPost.id ? updatedPost : post)));
        } else {
          setPosts([...posts, updatedPost]);
        }
        form.reset();
        setEditingPost(null);
        setOpen(false);
        if (onPostUpdate) onPostUpdate();
      } else {
        console.error("Failed to save post:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving post:", error);
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
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
                <label className="block text-sm font-medium mb-1">Media URLs (up to 3)</label>
                {form.watch("mediaUrls").map((_, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      {...form.register(`mediaUrls.${index}`)}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="https://example.com/image.jpg"
                    />
                    <button
                      type="button"
                      onClick={() => removeField("mediaUrls", index)}
                      className="text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {form.watch("mediaUrls").length < 3 && (
                  <button
                    type="button"
                    onClick={() => addField("mediaUrls")}
                    className="text-blue-500 flex items-center"
                  >
                    <Camera className="h-4 w-4 mr-1" /> Add Media URL
                  </button>
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
                      <img key={index} src={url} alt="Post media" className="w-20 h-20 object-cover rounded" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;