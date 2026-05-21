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
  Upload,
  X,
  Film,
} from "lucide-react";
import { useTranslation } from "react-i18next";

type Reply = {
  _id: string;
  userid: string;
  username: string;
  text: string;
  createdAt: string;
};

type Comment = {
  _id: string;
  userid: string;
  username: string;
  text: string;
  likes: string[];
  replies: Reply[];
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
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [mediaType, setMediaType] = useState<"image" | "video" | "none">("none");
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [friendCount, setFriendCount] = useState(0);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<{ postId: string; commentId: string } | null>(null);
  const [replyText, setReplyText] = useState("");
  const [shareMenuOpen, setShareMenuOpen] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    fetchPosts();
  }, []);

  useEffect(() => {
    if (hasMounted && user) fetchFriendCount();
  }, [hasMounted, user]);

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
    } catch { }
  };

  const getPostLimit = () => {
    if (friendCount === 0) return 0;
    if (friendCount <= 10) return friendCount;
    return Infinity;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      toast.error("Only image and video files are supported");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File must be under 50MB");
      return;
    }

    setSelectedFile(file);
    setMediaType(isVideo ? "video" : "image");
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setMediaType("none");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePost = async () => {
    if (!user) {
      toast.error("Please login to post");
      return router.push("/auth");
    }
    if (!content.trim() && !selectedFile) {
      return toast.error("Write something or upload a photo/video");
    }

    setPosting(true);
    let uploadedUrl = "";
    let finalMediaType: "image" | "video" | "none" = "none";

    try {
      // Step 1: Upload media to Cloudinary if a file was selected
      if (selectedFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await axiosInstance.post("/social/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedUrl = uploadRes.data.url;
        finalMediaType = uploadRes.data.mediaType;
        setUploading(false);
      }

      // Step 2: Create post with the uploaded URL
      const res = await axiosInstance.post("/social/create", {
        userid: user._id,
        username: user.name,
        content,
        mediaUrl: uploadedUrl,
        mediaType: finalMediaType,
      });

      setPosts([res.data.data, ...posts]);
      setContent("");
      removeSelectedFile();
      toast.success("Post published!");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to publish post. Please check your connection and try again.";
      toast.error(msg);
    } finally {
      setPosting(false);
      setUploading(false);
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
      setShareMenuOpen(shareMenuOpen === postId ? null : postId);
      toast.success("Post tracking updated!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to share");
    }
  };

  const handleSocialShare = (type: "whatsapp" | "email" | "sms", post: Post) => {
    const text = `Check out this post by ${post.username}: ${post.content}\n\nLink: ${window.location.origin}/social#${post._id}`;
    const url = encodeURIComponent(`${window.location.origin}/social#${post._id}`);

    let shareUrl = "";
    if (type === "whatsapp") {
      shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    } else if (type === "email") {
      shareUrl = `mailto:?subject=Cool Post on StackOverflow Clone&body=${encodeURIComponent(text)}`;
    } else if (type === "sms") {
      shareUrl = `sms:?body=${encodeURIComponent(text)}`;
    }

    window.open(shareUrl, "_blank");
    handleShare(post._id); // Register the share in our DB too
  };

  const handleLikeComment = async (postId: string, commentId: string) => {
    if (!user) return toast.error("Please login to like");
    try {
      const res = await axiosInstance.patch(`/social/comment/like/${postId}/${commentId}`, {
        userid: user._id,
      });
      setPosts(posts.map((p) => (p._id === postId ? res.data.data : p)));
    } catch {
      toast.error("Failed to like comment");
    }
  };

  const handleReply = async (postId: string, commentId: string) => {
    if (!user) return toast.error("Please login to reply");
    if (!replyText.trim()) return toast.error("Reply cannot be empty");
    try {
      const res = await axiosInstance.post(`/social/comment/reply/${postId}/${commentId}`, {
        userid: user._id,
        username: user.name,
        text: replyText,
      });
      setPosts(posts.map((p) => (p._id === postId ? res.data.data : p)));
      setReplyingTo(null);
      setReplyText("");
      toast.success("Reply added!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not add reply. Add more friends to unlock more interactions!");
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
  const isBlocked = hasMounted && user && limit === 0;

  return (
    <Mainlayout>
      <main className="max-w-2xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{hasMounted ? t("socialFeedTitle") : "Social Feed"}</h1>
          <Link
            href="/social/friends"
            className="flex items-center gap-1 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition"
          >
            <Users className="w-4 h-4" />
            {hasMounted ? t("friendsButton") : "Friends"}
            {hasMounted && friendCount > 0 && (
              <span className="ml-1 bg-white text-blue-600 rounded-full px-1.5 text-xs font-bold">
                {friendCount}
              </span>
            )}
          </Link>
        </div>

        {/* Create Post Card */}
        {hasMounted && user ? (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <textarea
                  placeholder={
                    isBlocked
                      ? (hasMounted ? t("blockedPostPlaceholder") : "Add at least 1 friend to start posting...")
                      : (hasMounted ? t("postPlaceholder") : "What's on your mind?")
                  }
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={!!isBlocked}
                  rows={3}
                  className="w-full resize-none border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50 disabled:text-gray-400"
                />

                {/* Media Preview */}
                {previewUrl && (
                  <div className="relative mt-2 rounded-lg overflow-hidden border border-gray-200">
                    {mediaType === "image" ? (
                      <img src={previewUrl} alt="preview" className="w-full max-h-56 object-cover" />
                    ) : (
                      <video src={previewUrl} controls className="w-full max-h-56" />
                    )}
                    <button
                      onClick={removeSelectedFile}
                      className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full p-1 hover:bg-opacity-80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {!isBlocked && (
                  <div className="mt-2 flex gap-2 items-center flex-wrap">
                    {/* File Upload Button */}
                    <input
                      type="file"
                      accept="image/*,video/*"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      id="media-upload"
                    />
                    <label
                      htmlFor="media-upload"
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 border border-gray-200 hover:border-blue-400 px-3 py-1.5 rounded cursor-pointer transition"
                    >
                      {mediaType === "video" ? (
                        <Film className="w-4 h-4" />
                      ) : (
                        <ImageIcon className="w-4 h-4" />
                      )}
                      {selectedFile ? selectedFile.name.substring(0, 20) + "..." : (hasMounted ? t("photoVideo") : "Photo / Video")}
                    </label>

                    <button
                      onClick={handlePost}
                      disabled={posting || uploading}
                      className="ml-auto flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition disabled:opacity-60"
                    >
                      {uploading ? (
                        <>
                          <Upload className="w-3 h-3 animate-bounce" /> {hasMounted ? t("uploading") : "Uploading..."}
                        </>
                      ) : posting ? (
                        hasMounted ? t("posting") : "Posting..."
                      ) : (
                        hasMounted ? t("postButton") : "Post"
                      )}
                    </button>
                  </div>
                )}

                {isBlocked && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {hasMounted ? t("noFriendsPostWarning") : "You need at least 1 friend to post."}{" "}
                    <Link href="/social/friends" className="underline font-medium">
                      {hasMounted ? t("findFriends") : "Find friends"} →
                    </Link>
                  </p>
                )}
                {hasMounted && !isBlocked && limit !== Infinity && limit > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    {t("postLimit")}: {limit}/{hasMounted ? t("day") : "day"} ({friendCount} friend{friendCount !== 1 ? "s" : ""})
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : hasMounted && !user ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center text-sm text-blue-700">
            <Link href="/auth" className="font-medium underline">{hasMounted ? t("loginLink") : "Log in"}</Link>{" "}
            {hasMounted ? t("loginToPost") : "to create posts, like, comment, and connect with others."}
          </div>
        ) : null}

        {/* Feed */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>{hasMounted ? t("noPostsYet") : "No posts yet. Be the first to share something!"}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const liked = hasMounted && user && post.likes.includes(user._id);
              const shared = hasMounted && user && post.shares.some((s) => s.userid === user._id);
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
                    {hasMounted && user?._id === post.userid && (
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
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
                    <img
                      src={post.mediaUrl}
                      alt="post media"
                      className="w-full max-h-96 object-cover"
                    />
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
                    <div className="relative">
                      <button
                        onClick={() => setShareMenuOpen(shareMenuOpen === post._id ? null : post._id)}
                        className={`flex items-center gap-1 transition hover:text-green-500 ${shared ? "text-green-500 font-medium" : ""}`}
                      >
                        <Share2 className="w-4 h-4" />
                        {post.shares.length}
                      </button>

                      {shareMenuOpen === post._id && (
                        <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-40 z-50">
                          <button
                            onClick={() => handleSocialShare("whatsapp", post)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <span className="w-2 h-2 bg-green-500 rounded-full" /> WhatsApp
                          </button>
                          <button
                            onClick={() => handleSocialShare("email", post)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <span className="w-2 h-2 bg-blue-500 rounded-full" /> Email
                          </button>
                          <button
                            onClick={() => handleSocialShare("sms", post)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <span className="w-2 h-2 bg-gray-500 rounded-full" /> Text Message
                          </button>
                        </div>
                      )}
                    </div>
                    {post.shares.length > 0 && (
                      <span className="text-xs text-gray-400 ml-auto">
                        Latest share by {post.shares[post.shares.length - 1].username}
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
                          <div key={c._id} className="space-y-1">
                            <div className="flex items-start justify-between group">
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">{c.username}</span>{" "}
                                <span className="text-gray-600">{c.text}</span>
                                <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
                                  <button
                                    onClick={() => handleLikeComment(post._id, c._id)}
                                    className={`flex items-center gap-1 hover:underline ${hasMounted && user && c.likes?.includes(user._id) ? "text-blue-600 font-medium" : ""}`}
                                  >
                                    <Heart className={`w-3 h-3 ${hasMounted && user && c.likes?.includes(user._id) ? "fill-blue-600" : ""}`} />
                                    {c.likes?.length > 0 && <span>{c.likes.length}</span>}
                                  </button>
                                  <button
                                    onClick={() => setReplyingTo({ postId: post._id, commentId: c._id })}
                                    className="hover:underline"
                                  >
                                    Reply
                                  </button>
                                  <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              </div>
                            </div>

                            {/* Replies */}
                            {c.replies?.length > 0 && (
                              <div className="ml-8 space-y-2 border-l-2 border-gray-200 pl-3 py-1">
                                {c.replies.map((r) => (
                                  <div key={r._id} className="text-xs">
                                    <span className="font-semibold text-gray-700">{r.username}</span>{" "}
                                    <span className="text-gray-600">{r.text}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Reply Input */}
                            {replyingTo?.commentId === c._id && (
                              <div className="ml-8 flex gap-2 mt-2">
                                <input
                                  type="text"
                                  autoFocus
                                  placeholder={`${hasMounted ? t("reply") : "Reply"} to ${c.username}...`}
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && handleReply(post._id, c._id)}
                                  className="flex-1 border border-gray-200 rounded-full px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                                <button
                                  onClick={() => handleReply(post._id, c._id)}
                                  className="text-blue-600"
                                >
                                  <Send className="w-3 h-3" />
                                </button>
                                <button onClick={() => setReplyingTo(null)} className="text-gray-400">
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {hasMounted && user && (
                        <div className="flex gap-2 mt-3">
                          <input
                            type="text"
                            placeholder={hasMounted ? t("addComment") : "Add a comment..."}
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
