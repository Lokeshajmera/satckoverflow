import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  Image as ImageIcon,
  Users,
  Send,
} from "lucide-react";

type Comment = {
  _id: string;
  userid: string;
  username: string;
  text: string;
  createdAt: string;
};

type Share = {
  userid: string;
  username: string;
  sharedAt: string;
};

type Post = {
  _id: string;
  userid: string;
  username: string;
  content: string;
  mediaUrl: string;
  mediaType: "image" | "video" | "none";
  likes: string[];
  comments: Comment[];
  shares: Share[];
  createdAt: string;
};

export default function SocialFeed() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video" | "none">("none");
  const [posting, setPosting] = useState(false);
  const [friendCount, setFriendCount] = useState(0);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPosts();
    if (user) fetchFriendCount();
  }, [user]);

  const fetchPosts = async () => {
    try {
      const res = await axiosInstance.get("/social/getall");
      setPosts(res.data.data);
    } catch {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendCount = async () => {
    try {
      const res = await axiosInstance.get(`/friends/friends/${user?._id}`);
      setFriendCount(res.data.data.length);
    } catch {}
  };

  const getPostLimit = () => {
    if (friendCount === 0) return 0;
    if (friendCount <= 10) return friendCount;
    return Infinity;
  };

  const handlePost = async () => {
    if (!user) {
      toast.error("Please login to post");
      return router.push("/auth");
    }
    if (!content.trim() && !mediaUrl.trim()) {
      return toast.error("Write something or add a media URL");
    }
    setPosting(true);
    try {
      const res = await axiosInstance.post("/social/create", {
        userid: user._id,
        username: user.name,
        content,
        mediaUrl: mediaUrl.trim(),
        mediaType: mediaUrl ? mediaType : "none",
      });
      setPosts([res.data.data, ...posts]);
      setContent("");
      setMediaUrl("");
      setMediaType("none");
      toast.success("Post published!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to post");
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      toast.error("Please login to like");
      return router.push("/auth");
    }
    try {
      const res = await axiosInstance.patch(`/social/like/${postId}`, {
        userid: user._id,
      });
      setPosts(posts.map((p) => (p._id === postId ? res.data.data : p)));
    } catch {
      toast.error("Failed to like");
    }
  };

  const handleComment = async (postId: string) => {
    if (!user) {
      toast.error("Please login to comment");
      return router.push("/auth");
    }
    const text = commentTexts[postId]?.trim();
    if (!text) return toast.error("Comment cannot be empty");
    try {
      const res = await axiosInstance.post(`/social/comment/${postId}`, {
        userid: user._id,
        username: user.name,
        text,
      });
      setPosts(posts.map((p) => (p._id === postId ? res.data.data : p)));
      setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
    } catch {
      toast.error("Failed to comment");
    }
  };

  const handleShare = async (postId: string) => {
    if (!user) {
      toast.error("Please login to share");
      return router.push("/auth");
    }
    try {
      const res = await axiosInstance.patch(`/social/share/${postId}`, {
        userid: user._id,
        username: user.name,
      });
      setPosts(posts.map((p) => (p._id === postId ? res.data.data : p)));
      toast.success("Post shared!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to share");
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await axiosInstance.delete(`/social/delete/${postId}`, {
        data: { userid: user?._id },
      });
      setPosts(posts.filter((p) => p._id !== postId));
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const limit = getPostLimit();

  return (
    <Mainlayout>
      <main className="max-w-2xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Social Feed</h1>
          <Link
            href="/social/friends"
            className="flex items-center gap-1 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition"
          >
            <Users className="w-4 h-4" />
            Friends {friendCount > 0 && <span className="ml-1 bg-white text-blue-600 rounded-full px-1.5 text-xs font-bold">{friendCount}</span>}
          </Link>
        </div>

        {/* Create Post Card */}
        {user ? (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <textarea
                  placeholder={
                    limit === 0
                      ? "Add at least 1 friend to start posting..."
                      : "What's on your mind?"
                  }
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={limit === 0}
                  rows={3}
                  className="w-full resize-none border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50 disabled:text-gray-400"
                />
                {limit !== 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap items-center">
                    <div className="flex gap-2 flex-1">
                      <input
                        type="text"
                        placeholder="Media URL (image/video)"
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        className="flex-1 border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 min-w-0"
                      />
                      <select
                        value={mediaType}
                        onChange={(e) => setMediaType(e.target.value as any)}
                        className="border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none"
                      >
                        <option value="none">No media</option>
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                    <button
                      onClick={handlePost}
                      disabled={posting}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition disabled:opacity-60"
                    >
                      {posting ? "Posting..." : "Post"}
                    </button>
                  </div>
                )}
                {limit === 0 && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    You need at least 1 friend to post.{" "}
                    <Link href="/social/friends" className="underline font-medium">
                      Find friends →
                    </Link>
                  </p>
                )}
                {limit !== Infinity && limit > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Post limit today: {limit}/day ({friendCount} friend{friendCount !== 1 ? "s" : ""})
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center text-sm text-blue-700">
            <Link href="/auth" className="font-medium underline">
              Log in
            </Link>{" "}
            to create posts, like, comment, and connect with others.
          </div>
        )}

        {/* Feed */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const liked = user && post.likes.includes(user._id);
              const shared = user && post.shares.some((s) => s.userid === user._id);
              return (
                <div key={post._id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  {/* Post Header */}
                  <div className="flex items-center justify-between px-4 pt-4">
                    <Link href={`/users/${post.userid}`} className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                        {post.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{post.username}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(post.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </Link>
                    {user?._id === post.userid && (
                      <button onClick={() => handleDelete(post._id)} className="text-gray-400 hover:text-red-500 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  {post.content && (
                    <p className="px-4 pt-3 pb-2 text-gray-700 text-sm leading-relaxed">{post.content}</p>
                  )}

                  {/* Media */}
                  {post.mediaUrl && post.mediaType === "image" && (
                    <img src={post.mediaUrl} alt="post media" className="w-full max-h-96 object-cover" />
                  )}
                  {post.mediaUrl && post.mediaType === "video" && (
                    <video controls className="w-full max-h-96">
                      <source src={post.mediaUrl} />
                    </video>
                  )}

                  {/* Action Bar */}
                  <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-4 text-sm text-gray-500">
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center gap-1 transition hover:text-red-500 ${liked ? "text-red-500 font-medium" : ""}`}
                    >
                      <Heart className={`w-4 h-4 ${liked ? "fill-red-500" : ""}`} />
                      {post.likes.length}
                    </button>
                    <button
                      onClick={() => setOpenComments(openComments === post._id ? null : post._id)}
                      className="flex items-center gap-1 hover:text-blue-500 transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {post.comments.length}
                    </button>
                    <button
                      onClick={() => handleShare(post._id)}
                      className={`flex items-center gap-1 transition hover:text-green-500 ${shared ? "text-green-500 font-medium" : ""}`}
                    >
                      <Share2 className="w-4 h-4" />
                      {post.shares.length}
                    </button>
                    {post.shares.length > 0 && (
                      <span className="text-xs text-gray-400 ml-auto">
                        Shared by {post.shares[post.shares.length - 1].username}
                        {post.shares.length > 1 && ` +${post.shares.length - 1} more`}
                      </span>
                    )}
                  </div>

                  {/* Comments Section */}
                  {openComments === post._id && (
                    <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                      <div className="space-y-2 pt-3 max-h-48 overflow-y-auto">
                        {post.comments.length === 0 && (
                          <p className="text-xs text-gray-400">No comments yet.</p>
                        )}
                        {post.comments.map((c) => (
                          <div key={c._id} className="text-sm">
                            <span className="font-semibold text-gray-700">{c.username}</span>{" "}
                            <span className="text-gray-600">{c.text}</span>
                          </div>
                        ))}
                      </div>
                      {user && (
                        <div className="flex gap-2 mt-3">
                          <input
                            type="text"
                            placeholder="Add a comment..."
                            value={commentTexts[post._id] || ""}
                            onChange={(e) =>
                              setCommentTexts((prev) => ({ ...prev, [post._id]: e.target.value }))
                            }
                            onKeyDown={(e) => e.key === "Enter" && handleComment(post._id)}
                            className="flex-1 border border-gray-200 rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                          />
                          <button
                            onClick={() => handleComment(post._id)}
                            className="text-blue-600 hover:text-blue-800 transition"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </Mainlayout>
  );
}
