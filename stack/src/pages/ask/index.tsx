import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const FAMOUS_TAGS = [
  "javascript", "react", "nextjs", "html", "css", 
  "typescript", "node.js", "mongodb", "python", "java", 
  "c++", "git", "sql", "docker", "aws", "tailwind", 
  "angular", "vue"
];

const index = () => {
  const { t } = useTranslation();
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState("");

  const suggestedTags = newTag.trim()
    ? FAMOUS_TAGS.filter(
        (tag) =>
          tag.toLowerCase().includes(newTag.trim().toLowerCase()) &&
          !formData.tags.includes(tag)
      )
    : [];

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!user) {
      toast.error(hasMounted ? t("loginToPost") : "Please login to ask a question");
      router.push("/auth");
    }
  }, [user, router]);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    if (id === "tags") {
      const tagarray = value
        .split(/[s,]+/)
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
      setFormData((prev) => ({ ...prev, tags: tagarray }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(hasMounted ? t("loginLink") : "Please login to ask question");
      router.push("/auth");
      return;
    }
    if (formData.body.length < 20) {
      toast.error(hasMounted ? t("bodyMinLengthError") : "Question body must have at least 20 characters.");
      return;
    }
    if (formData.title.length > 200) {
      toast.error("Question title must not exceed 200 characters.");
      return;
    }
    if (formData.body.length > 500) {
      toast.error("Question details must not exceed 500 characters.");
      return;
    }
    if (formData.tags.length < 1) {
      toast.error(hasMounted ? t("exactTagsError") : "At least one tag is required.");
      return;
    }
    if (formData.tags.length > 5) {
      toast.error("You can add up to 5 tags.");
      return;
    }
    try {
      const res = await axiosInstance.post("/question/ask", {
        postquestiondata: {
          questiontitle: formData.title,
          questionbody: formData.body,
          questiontags: formData.tags,
          userposted: user.name,
          userid: user?._id,
        },
      });
      if (res.data.data) {
        toast.success(hasMounted ? t("questionPostedSuccess") : "Question posted successfully");
        router.push("/");
      }
    } catch (error: any) {
      console.log(error);
      if (error.response?.status === 403) {
        toast.error(error.response.data.message || "Limit reached");
        router.push("/subscription");
      } else {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
    }
  };
  const handleAddTag = (e: any) => {
    e.preventDefault();
    const trimmedTag = newTag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData({ ...formData, tags: [...formData.tags, trimmedTag] });
      setNewTag("");
    }
  };
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag: any) => tag !== tagToRemove),
    });
  };
  return (
    <Mainlayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl lg:text-2xl font-semibold mb-6">
          {hasMounted ? t("askQuestionTitle") : "Ask a public question"}
        </h1>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg lg:text-xl">
                {hasMounted ? t("writingGoodQuestion") : "Writing a good question"}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-base font-semibold">
                  Title
                </Label>
                <p className="text-sm text-gray-600 mb-2">
                  Be specific and imagine you're asking a question to another
                  person.
                </p>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. How to center a div in CSS?"
                  className="w-full"
                />
                <p className={`text-xs mt-1 ${formData.title.length > 200 ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                  {formData.title.length} / 200 characters
                </p>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <div className="space-y-1">
                    <Label htmlFor="body" className="text-base font-semibold">
                      {hasMounted ? t("problemDetails") : "What are the details of your problem?"}
                    </Label>
                    <p className="text-sm text-gray-600">
                      {hasMounted ? t("problemDesc") : "Introduce the problem and expand on what you put in the title. Minimum 20 characters."}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold whitespace-nowrap ml-4 ${formData.body.length < 20 || formData.body.length > 500 ? 'text-red-500' : 'text-green-600'}`}>
                    {hasMounted ? t("charsCount", { count: formData.body.length }) : `${formData.body.length} chars`} | {formData.body.length} / 500 characters
                  </span>
                </div>
                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={handleChange}
                  placeholder="Describe your problem in detail..."
                  className="min-h-32 lg:min-h-48 w-full"
                />
              </div>
              <div>
                <Label htmlFor="tags" className="text-base font-semibold">
                  {hasMounted ? t("tagsLabelCount", { count: formData.tags.length }) : `Tags (${formData.tags.length})`}
                </Label>
                <p className="text-sm text-gray-600 mb-2">
                  {hasMounted ? t("tagsInputDesc") : "Add at least 1 tag (up to 5) to describe what your question is about."}
                </p>
                {/* Popular Tags Quick-add */}
                <div className="flex flex-wrap gap-1.5 mb-2.5 items-center">
                  <span className="text-xs text-gray-500 font-semibold mr-1">Popular:</span>
                  {FAMOUS_TAGS.slice(0, 8).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      disabled={formData.tags.includes(tag)}
                      onClick={() => {
                        if (formData.tags.length >= 5) {
                          toast.error("You can add up to 5 tags.");
                          return;
                        }
                        if (!formData.tags.includes(tag)) {
                          setFormData({ ...formData, tags: [...formData.tags, tag] });
                        }
                      }}
                      className={`text-xs px-2 py-0.5 rounded-full border font-medium transition ${
                        formData.tags.includes(tag)
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          : "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 active:scale-95"
                      }`}
                    >
                      +{tag}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 relative">
                  <div className="w-full relative">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="e.g. javascript react nextjs"
                      className="w-full"
                    />
                    {/* Suggestions Dropdown */}
                    {newTag.trim() && suggestedTags.length > 0 && (
                      <div className="absolute left-0 right-0 z-20 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto divide-y divide-gray-50">
                        {suggestedTags.map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              if (formData.tags.length >= 5) {
                                toast.error("You can add up to 5 tags.");
                                return;
                              }
                              if (!formData.tags.includes(tag)) {
                                setFormData({ ...formData, tags: [...formData.tags, tag] });
                              }
                              setNewTag("");
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-orange-50 text-sm text-gray-700 font-semibold transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleAddTag}
                    variant="outline"
                    size="sm"
                    type="button"
                    className="bg-orange-600 text-white flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag: any) => {
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

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <Button type="submit" className="bg-blue-600 text-white">
                  {hasMounted ? t("reviewQuestion") : "Review your question"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </Mainlayout>
  );
};

export default index;
