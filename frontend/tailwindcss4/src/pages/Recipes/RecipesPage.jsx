import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Search, ChefHat, Loader2, ThumbsUp, MessageSquare } from "lucide-react";

import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";

const RecipesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [allPosts, setAllPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState(null);

  // Fetch posts on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      setPostsLoading(true);
      setPostsError(null);
      try {
        const response = await fetch("http://localhost:8080/api/posts");
        if (response.ok) {
          const data = await response.json();
          setAllPosts(data);
        } else {
          throw new Error("Failed to fetch recipes");
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPostsError("Failed to load recipes. Please try again later.");
      } finally {
        setPostsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filteredPosts = searchQuery
    ? allPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (post.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
      )
    : allPosts;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Recipes</h1>
            <div className="relative w-full md:w-64">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                className="w-full pl-10 pr-3 py-2 border rounded-md"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Recipes Content */}
          <div className="mt-6">
            {postsLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : postsError ? (
              <div className="bg-red-50 rounded-lg p-6 text-center shadow-md">
                <p className="text-red-600 text-lg">{postsError}</p>
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    {post.mediaUrls && post.mediaUrls.length > 0 ? (
                      <div className="h-48 bg-gray-200">
                        <img
                          src={post.mediaUrls[0]}
                          className="w-full h-full object-cover"
                          alt={post.title}
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gray-200 flex items-center justify-center">
                        <ChefHat className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div
                      className={`${
                        post.mediaUrls?.length ? "" : "border-b"
                      } p-4`}
                    >
                      <div className="flex items-center mb-2">
                        <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                          <span className="text-gray-500">U{post.userId}</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          User {post.userId}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold truncate">
                        {post.title}
                      </h3>
                      {post.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {post.description}
                        </p>
                      )}
                    </div>
                    <div className="p-4 pt-0">
                      {post.ingredients && post.ingredients.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Ingredients
                          </h4>
                          <ul className="list-disc pl-5 text-sm text-gray-700">
                            {post.ingredients.map((ingredient, index) => (
                              <li key={index}>{ingredient}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {post.instructions && post.instructions.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Instructions
                          </h4>
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
                    </div>
                    <div className="flex justify-between border-t p-4">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          <span>0</span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span>0</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {post.createdDate
                          ? format(new Date(post.createdDate), "MMM d, yyyy")
                          : "Recently"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No Recipes Found
                </h3>
                <p className="text-gray-500">
                  {searchQuery
                    ? `No recipes match "${searchQuery}"`
                    : "There are no recipes yet."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RecipesPage;