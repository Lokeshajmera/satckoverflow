import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

export default function Tags() {
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await axiosInstance.get("/question/getallquestion");
        const questions = res.data.data;
        
        // Extract tags and count frequencies
        const tagMap: Record<string, number> = {};
        questions.forEach((q: any) => {
          if (q.questiontags && Array.isArray(q.questiontags)) {
            q.questiontags.forEach((tag: string) => {
              if (tagMap[tag]) {
                tagMap[tag]++;
              } else {
                tagMap[tag] = 1;
              }
            });
          }
        });

        // Convert to array and sort by frequency (descending)
        const tagsArray = Object.keys(tagMap).map((tag) => ({
          tag,
          count: tagMap[tag],
        }));
        tagsArray.sort((a, b) => b.count - a.count);

        setTags(tagsArray);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  if (loading) {
    return (
      <Mainlayout>
        <div className="flex justify-center items-center mt-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <main className="min-w-0 p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-semibold mb-2">Tags</h1>
            <p className="text-sm text-gray-600 max-w-2xl">
              A tag is a keyword or label that categorizes your question with other, similar questions. Using the right tags makes it easier for others to find and answer your question.
            </p>
          </div>
          <button
            onClick={() => {
              if (!user) {
                toast.error("Please login to ask a question");
                router.push("/auth");
              } else {
                router.push("/ask");
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium whitespace-nowrap"
          >
            Ask Question
          </button>
        </div>

        {tags.length === 0 ? (
          <div className="text-center text-gray-500 mt-4">No tags found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tags.map(({ tag, count }) => (
              <Card key={tag} className="flex flex-col border-gray-200">
                <CardHeader className="p-4 pb-2">
                  <CardTitle>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-sm font-normal cursor-pointer"
                    >
                      {tag}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm text-gray-500 mt-auto">
                  {count} {count === 1 ? "question" : "questions"}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </Mainlayout>
  );
}
