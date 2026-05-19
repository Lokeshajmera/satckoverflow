import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { UserPlus, UserCheck, Clock, Users } from "lucide-react";

type UserInfo = {
  _id: string;
  name: string;
  email: string;
  about?: string;
};

type Friendship = {
  _id: string;
  requester: string;
  recipient: string;
  status: "pending" | "accepted";
};

export default function FriendsPage() {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<UserInfo[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [pending, setPending] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted && user) {
      fetchAll();
    } else if (hasMounted && !user) {
      setLoading(false);
    }
  }, [hasMounted, user]);

  const fetchAll = async () => {
    try {
      const [usersRes, friendshipsRes, pendingRes] = await Promise.all([
        axiosInstance.get("/user/getalluser"),
        axiosInstance.get(`/friends/all/${user?._id}`),
        axiosInstance.get(`/friends/pending/${user?._id}`),
      ]);
      setAllUsers(usersRes.data.data.filter((u: UserInfo) => u._id !== user?._id));
      setFriendships(friendshipsRes.data.data);
      setPending(pendingRes.data.data);
    } catch {
      toast.error("Failed to load friends data");
    } finally {
      setLoading(false);
    }
  };

  const getFriendshipStatus = (otherUserId: string) => {
    const f = friendships.find(
      (f) =>
        (f.requester === user?._id && f.recipient === otherUserId) ||
        (f.recipient === user?._id && f.requester === otherUserId)
    );
    return f;
  };

  const handleSendRequest = async (recipientId: string) => {
    try {
      const res = await axiosInstance.post("/friends/request", {
        requester: user?._id,
        recipient: recipientId,
      });
      setFriendships([...friendships, res.data.data]);
      toast.success("Friend request sent!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send request");
    }
  };

  const handleRespond = async (friendshipId: string, action: "accept" | "reject") => {
    try {
      await axiosInstance.patch(`/friends/respond/${friendshipId}`, { action });
      if (action === "accept") {
        toast.success("Friend request accepted!");
        setFriendships((prev) =>
          prev.map((f) => (f._id === friendshipId ? { ...f, status: "accepted" } : f))
        );
        setPending((prev) => prev.filter((f) => f._id !== friendshipId));
      } else {
        toast.success("Request rejected");
        setFriendships((prev) => prev.filter((f) => f._id !== friendshipId));
        setPending((prev) => prev.filter((f) => f._id !== friendshipId));
      }
    } catch {
      toast.error("Failed to respond to request");
    }
  };

  const friends = friendships.filter((f) => f.status === "accepted");

  if (!hasMounted) {
    return (
      <Mainlayout>
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
        </div>
      </Mainlayout>
    );
  }

  if (!user) {
    return (
      <Mainlayout>
        <div className="max-w-2xl mx-auto p-4 text-center mt-10 text-gray-500">
          <Link href="/auth" className="text-blue-600 underline font-medium">
            Log in
          </Link>{" "}
          to manage your friends.
        </div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <main className="max-w-2xl mx-auto p-4 lg:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
          <Link
            href="/social"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to Feed
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Posting Limit Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              <p className="font-semibold mb-1">📣 Posting Limit</p>
              <p>
                You have <strong>{friends.length} friend{friends.length !== 1 ? "s" : ""}</strong>.{" "}
                {friends.length === 0
                  ? "You need at least 1 friend to post on the social feed."
                  : friends.length <= 10
                  ? `You can post up to ${friends.length} time${friends.length !== 1 ? "s" : ""} per day.`
                  : "You can post unlimited times per day!"}
              </p>
            </div>

            {/* Pending Requests */}
            {pending.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Pending Requests ({pending.length})
                </h2>
                <div className="space-y-2">
                  {pending.map((f) => {
                    const requesterUser = allUsers.find((u) => u._id === f.requester);
                    return (
                      <div key={f._id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                            {(requesterUser?.name || f.requester)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{requesterUser?.name || "Unknown"}</p>
                            <p className="text-xs text-gray-400">sent you a friend request</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRespond(f._id, "accept")}
                            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRespond(f._id, "reject")}
                            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded transition"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Current Friends */}
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-500" />
                Your Friends ({friends.length})
              </h2>
              {friends.length === 0 ? (
                <p className="text-sm text-gray-400">You don't have any friends yet. Add some below!</p>
              ) : (
                <div className="space-y-2">
                  {friends.map((f) => {
                    const friendId = f.requester === user._id ? f.recipient : f.requester;
                    const friendUser = allUsers.find((u) => u._id === friendId);
                    return (
                      <div key={f._id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                          {(friendUser?.name || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <Link href={`/users/${friendId}`} className="font-medium text-gray-800 hover:text-blue-600">
                            {friendUser?.name || "Unknown"}
                          </Link>
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <UserCheck className="w-3 h-3" />
                            Friends
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* All Users — Add Friends */}
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-500" />
                People You May Know ({allUsers.length})
              </h2>
              <div className="space-y-2">
                {allUsers.map((u) => {
                  const fs = getFriendshipStatus(u._id);
                  const isFriend = fs?.status === "accepted";
                  const isPendingSent =
                    fs?.status === "pending" && fs?.requester === user._id;
                  const isPendingReceived =
                    fs?.status === "pending" && fs?.recipient === user._id;

                  return (
                    <div key={u._id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                          {u.name[0].toUpperCase()}
                        </div>
                        <div>
                          <Link href={`/users/${u._id}`} className="font-medium text-gray-800 hover:text-blue-600">
                            {u.name}
                          </Link>
                          {u.about && (
                            <p className="text-xs text-gray-400 truncate max-w-xs">{u.about}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        {isFriend ? (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <UserCheck className="w-3 h-3" /> Friends
                          </span>
                        ) : isPendingSent ? (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        ) : isPendingReceived ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleRespond(fs!._id, "accept")}
                              className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRespond(fs!._id, "reject")}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSendRequest(u._id)}
                            className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition"
                          >
                            <UserPlus className="w-3 h-3" /> Add Friend
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </Mainlayout>
  );
}
