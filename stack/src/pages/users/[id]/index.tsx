import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { Calendar, Edit, Plus, X, Share, Trash } from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
const getUserData = (id: string) => {
  const users = {
    "1": {
      id: 1,
      name: "John Doe",
      joinDate: "2019-03-15",
      about:
        "Full-stack developer with 8+ years of experience in JavaScript, React, and Node.js. Passionate about clean code and helping others learn programming. I enjoy working on open-source projects and contributing to the developer community.",
      tags: [
        "javascript",
        "react",
        "node.js",
        "typescript",
        "python",
        "mongodb",
      ],
    },
  };
  return users[id as keyof typeof users] || users["1"];
};
const index = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [hasMounted, setHasMounted] = useState(false);
  const [users, setusers] = useState<any>(null);
  const [loading, setloading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const [editForm, setEditForm] = useState({
    name: users?.name || "",
    about: users?.about || "",
    tags: users?.tags || [],
    phoneNumber: users?.phoneNumber || "",
  });

  useEffect(() => {
    if (users) {
      setEditForm({
        name: users.name || "",
        about: users.about || "",
        tags: users.tags || [],
        phoneNumber: users.phoneNumber || "",
      });
    }
  }, [users]);
  const [newTag, setNewTag] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [transferRecipient, setTransferRecipient] = useState<any>(null);
  const [userQuestions, setUserQuestions] = useState<any[]>([]);

  useEffect(() => {
    const fetchuser = async () => {
      try {
        const [usersRes, questionsRes] = await Promise.all([
          axiosInstance.get("/user/getalluser"),
          axiosInstance.get("/question/getallquestion")
        ]);
        setAllUsers(usersRes.data.data);
        const matcheduser = usersRes.data.data.find((u: any) => u._id === id);
        setusers(matcheduser);
        const matchedQuestions = (questionsRes.data.data || []).filter((q: any) => q.userid === id);
        setUserQuestions(matchedQuestions);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    fetchuser();
  }, [id]);

  if (loading) {
    return (
      <Mainlayout>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </Mainlayout>
    );
  }
  if (!users || users.length === 0) {
    return <div className="text-center text-gray-500 mt-4">{hasMounted ? t("noUserFound") : "No user found."}</div>;
  }

  const handleSaveProfile = async () => {
    try {
      const res = await axiosInstance.patch(`/user/update/${user?._id}`, {
        editForm,
      });
      if (res.data.data) {
        const updatedUser = {
          ...users,
          name: editForm.name,
          about: editForm.about,
          tags: editForm.tags,
          phoneNumber: editForm.phoneNumber,
        };

        setusers(updatedUser);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await axiosInstance.patch(`/user/update-password/${user?._id}`, {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password updated successfully!");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || "Failed to update password";
      toast.error(message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !editForm.tags.includes(trimmedTag)) {
      setEditForm({ ...editForm, tags: [...editForm.tags, trimmedTag] });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditForm({
      ...editForm,
      tags: editForm.tags.filter((tag: any) => tag !== tagToRemove),
    });
  };

  const getTopTags = () => {
    const counts: Record<string, number> = {};
    (userQuestions || []).forEach((q) => {
      if (q.questiontags && Array.isArray(q.questiontags)) {
        q.questiontags.forEach((tag: string) => {
          counts[tag] = (counts[tag] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  };

  const currentUserId = user?._id;
  const isOwnProfile = id === currentUserId;
  return (
    <Mainlayout>
      <div className="max-w-6xl">
        {/* User Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 mb-8">
          <Avatar className="w-24 h-24 lg:w-32 lg:h-32">
            <AvatarFallback className="text-2xl lg:text-3xl">
              {users.name
                .split(" ")
                .map((n: any) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-1">
                  {users.name}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-orange-600">
                    {(users.points || 0).toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-600 font-medium">{hasMounted ? t("reputation") : "Reputation"}</span>
                </div>
              </div>

              {isOwnProfile && (
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent"
                    >
                      <Edit className="w-4 h-4" />
                      {hasMounted ? t("editProfile") : "Edit Profile"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white text-gray-900">
                    <DialogHeader>
                      <DialogTitle>{hasMounted ? t("editProfile") : "Edit Profile"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                          {hasMounted ? t("basicInformation") : "Basic Information"}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">{hasMounted ? t("displayName") : "Display Name"}</Label>
                            <Input
                              id="name"
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  name: e.target.value,
                                })
                              }
                              placeholder="Your display name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phoneNumber">{hasMounted ? t("mobileNumber") : "Mobile Number"}</Label>
                            <Input
                              id="phoneNumber"
                              value={editForm.phoneNumber}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  phoneNumber: e.target.value,
                                })
                              }
                              placeholder="e.g. +91 1234567890"
                            />
                          </div>
                        </div>
                      </div>
                      {/* About Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">{hasMounted ? t("aboutTitle") : "About"}</h3>
                        <div>
                          <Label htmlFor="about">{hasMounted ? t("aboutMe") : "About Me"}</Label>
                          <Textarea
                            id="about"
                            value={editForm.about}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                about: e.target.value,
                              })
                            }
                            placeholder="Tell us about yourself, your experience, and interests..."
                            className="min-h-32"
                          />
                        </div>
                      </div>

                      {/* Tags/Skills Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                          {hasMounted ? t("skillsTech") : "Skills & Technologies"}
                        </h3>

                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              placeholder="Add a skill or technology"
                              onKeyPress={(e) =>
                                e.key === "Enter" && handleAddTag()
                              }
                            />
                            <Button
                              onClick={handleAddTag}
                              variant="outline"
                              size="sm"
                              className="bg-orange-600 text-white"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {editForm.tags.map((tag: any) => {
                              return (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="bg-orange-100 text-orange-800 flex items-center gap-1"
                                >
                                  {tag}
                                  <button
                                    onClick={() => handleRemoveTag(tag)}
                                    className="ml-1 hover:text-red-600"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Security Section */}
                      <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-lg font-semibold text-red-600">
                          {hasMounted ? t("security") : "Security"}
                        </h3>
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                          <div>
                            <Label htmlFor="oldPassword">{hasMounted ? t("currentPassword") : "Current Password"}</Label>
                            <Input
                              id="oldPassword"
                              type="password"
                              value={passwordForm.oldPassword}
                              onChange={(e) =>
                                setPasswordForm({
                                  ...passwordForm,
                                  oldPassword: e.target.value,
                                })
                              }
                              placeholder="Required to change password"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="newPassword">{hasMounted ? t("newPasswordLabel") : "New Password"}</Label>
                              <Input
                                id="newPassword"
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) =>
                                  setPasswordForm({
                                    ...passwordForm,
                                    newPassword: e.target.value,
                                  })
                                }
                                placeholder="Min 6 characters"
                              />
                            </div>
                            <div>
                              <Label htmlFor="confirmPassword">{hasMounted ? t("confirmNewPassword") : "Confirm New Password"}</Label>
                              <Input
                                id="confirmPassword"
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) =>
                                  setPasswordForm({
                                    ...passwordForm,
                                    confirmPassword: e.target.value,
                                  })
                                }
                                placeholder="Repeat new password"
                              />
                            </div>
                          </div>
                          <Button
                            onClick={handleUpdatePassword}
                            disabled={isUpdatingPassword}
                            variant="destructive"
                            className="w-full sm:w-auto"
                          >
                            {isUpdatingPassword ? (hasMounted ? t("updating") : "Updating...") : (hasMounted ? t("updatePassword") : "Update Password")}
                          </Button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          className="bg-white text-gray-800 hover:text-gray-900"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {hasMounted ? t("saveChanges") : "Save Changes"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {isOwnProfile && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 border-orange-500 text-orange-600 hover:bg-orange-50">
                      <Share className="w-4 h-4" />
                      {hasMounted ? t("transferPointsButton") : "Transfer Points to Others"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white text-gray-900 max-w-md">
                    <DialogHeader>
                      <DialogTitle>{hasMounted ? t("transferPointsTitle") : "Transfer Points"}</DialogTitle>
                    </DialogHeader>
                    <div className="py-2 space-y-4">
                      <div className="space-y-2">
                        <Label>{hasMounted ? t("searchUser") : "Search User"}</Label>
                        <Input
                          placeholder={hasMounted ? t("typeToSearch") : "Type name to search..."}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && !transferRecipient && (
                          <div className="max-h-32 overflow-y-auto border rounded-md mt-1">
                            {allUsers
                              .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) && u._id !== user?._id)
                              .map(u => (
                                <div
                                  key={u._id}
                                  onClick={() => {
                                    setTransferRecipient(u);
                                    setSearchTerm("");
                                  }}
                                  className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                >
                                  {u.name}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>

                      {transferRecipient && (
                        <div className="p-3 bg-blue-50 rounded-md flex justify-between items-center">
                          <span className="text-sm font-medium">To: {transferRecipient.name}</span>
                          <Button variant="ghost" size="sm" onClick={() => setTransferRecipient(null)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="global-transfer-amount">{hasMounted ? t("amount") : "Amount"}</Label>
                        <Input
                          id="global-transfer-amount"
                          type="number"
                          placeholder="0"
                        />
                      </div>

                      <Button
                        disabled={!transferRecipient}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                        onClick={async () => {
                          const amount = parseInt((document.getElementById("global-transfer-amount") as HTMLInputElement).value);
                          if (!amount || amount <= 0) {
                            toast.error(hasMounted ? t("enterValidAmount") : "Enter a valid amount");
                            return;
                          }
                          try {
                            const res = await axiosInstance.post("/user/transfer-points", {
                              amount,
                              recipientId: transferRecipient._id
                            });
                            toast.success(res.data.message);
                            window.location.reload();
                          } catch (err: any) {
                            toast.error(err.response?.data?.message || "Transfer failed");
                          }
                        }}
                      >
                        {hasMounted ? t("sendPoints") : "Send Points"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {!isOwnProfile && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 border-orange-500 text-orange-600 hover:bg-orange-50">
                      <Share className="w-4 h-4" />
                      {hasMounted ? t("transferPointsTitle") : "Transfer Points"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white text-gray-900">
                    <DialogHeader>
                      <DialogTitle>{hasMounted ? t("transferPointsTitle") : "Transfer Points"} to {users.name}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <p className="text-sm text-gray-600">
                        {hasMounted ? t("transferBalanceInfo", { points: user?.points || 0 }) : `Your current balance: ${user?.points || 0} points. You can only transfer if you have more than 10 points.`}
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="transfer-amount">{hasMounted ? t("amount") : "Amount to Transfer"}</Label>
                        <Input
                          id="transfer-amount"
                          type="number"
                          min="1"
                          placeholder="Enter points amount"
                        />
                      </div>
                      <Button
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                        onClick={async () => {
                          const amountInput = document.getElementById("transfer-amount") as HTMLInputElement;
                          const amount = parseInt(amountInput.value);
                          if (!amount || amount <= 0) {
                            toast.error(hasMounted ? t("enterValidAmount") : "Please enter a valid amount");
                            return;
                          }
                          try {
                            const res = await axiosInstance.post("/user/transfer-points", {
                              amount,
                              recipientId: id
                            });
                            toast.success(res.data.message);
                            window.location.reload();
                          } catch (err: any) {
                            toast.error(err.response?.data?.message || "Transfer failed");
                          }
                        }}
                      >
                        {hasMounted ? t("confirmTransfer") : "Confirm Transfer"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {hasMounted ? t("memberSince") : "Member since"}{" "}
                {new Date(users.joinDate).toISOString().split("T")[0]}
              </div>
            </div>
            <div className="flex flex-wrap items-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="font-semibold">5</span>
                <span className="text-gray-600 ml-1">{hasMounted ? t("goldBadges") : "gold badges"}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                <span className="font-semibold">23</span>
                <span className="text-gray-600 ml-1">{hasMounted ? t("silverBadges") : "silver badges"}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-600 rounded-full mr-2"></div>
                <span className="font-semibold">45</span>
                <span className="text-gray-600 ml-1">{hasMounted ? t("bronzeBadges") : "bronze badges"}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1  gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{hasMounted ? t("aboutTitle") : "About"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {users.about}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{hasMounted ? t("questionsAsked") : "Questions Asked"} ({userQuestions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {userQuestions.length === 0 ? (
                  <p className="text-gray-500 italic text-sm">{hasMounted ? t("noQuestionsAsked") : "No questions asked yet."}</p>
                ) : (
                  <div className="space-y-4">
                    {userQuestions.map((q) => (
                      <div key={q._id} className="flex justify-between items-start gap-4 pb-3 border-b last:border-b-0 last:pb-0">
                        <div className="flex-1 min-w-0">
                          <Link href={`/questions/${q._id}`} className="text-blue-600 hover:text-blue-800 hover:underline font-medium block truncate">
                            {q.questiontitle}
                          </Link>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <span>Asked: {new Date(q.askedon).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Votes: {q.upvote.length - q.downvote.length}</span>
                            <span>•</span>
                            <span>Answers: {q.noofanswer}</span>
                          </div>
                        </div>
                        {isOwnProfile && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              if (window.confirm("Are you sure you want to delete this question?")) {
                                try {
                                  await axiosInstance.delete(`/question/delete/${q._id}`);
                                  setUserQuestions(prev => prev.filter(item => item._id !== q._id));
                                  toast.success("Question deleted successfully!");
                                } catch (error) {
                                  toast.error("Failed to delete question");
                                }
                              }
                            }}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 h-auto"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{hasMounted ? t("topTags") : "Top Tags"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getTopTags().length === 0 ? (
                    <p className="text-gray-500 italic text-sm">No tags used yet.</p>
                  ) : (
                    getTopTags().map(({ tag, count }) => (
                      <div
                        key={tag}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                          >
                            {tag}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">
                          {count} {count === 1 ? "post" : "posts"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {isOwnProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>{hasMounted ? t("loginHistory") : "Login History"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {users.loginHistory?.slice().reverse().map((history: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm border">
                        <div className="flex justify-between font-semibold mb-1">
                          <span>{history.browser} ({history.device})</span>
                          <span className="text-gray-500 font-normal">{new Date(history.date).toLocaleString()}</span>
                        </div>
                        <div className="text-gray-600">
                          OS: {history.os} | IP: {history.ip}
                        </div>
                      </div>
                    ))}
                    {!users.loginHistory?.length && (
                      <p className="text-gray-500 text-center italic">{hasMounted ? t("noLoginHistory") : "No login history available."}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Mainlayout>
  );
};

export default index;
