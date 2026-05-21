import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const RightSideBar = () => {
  const { t } = useTranslation();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <aside className="w-72 lg:w-80 p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="space-y-4 lg:space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 lg:p-4">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm lg:text-base">
            {hasMounted ? t("overflowBlog") : "The Overflow Blog"}
          </h3>
          <ul className="space-y-2 text-xs lg:text-sm">
            <li className="flex items-start">
              <span className="text-gray-400 mr-2">✏️</span>
              <Link href="/articles" className="text-gray-700 hover:text-blue-600 transition-colors">
                A new era of Stack Overflow
              </Link>
            </li>
            <li className="flex items-start">
              <span className="text-gray-400 mr-2">✏️</span>
              <Link href="/articles" className="text-gray-700 hover:text-blue-600 transition-colors">
                How your favorite movie is changing language learning technology
              </Link>
            </li>
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded p-3 lg:p-4">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm lg:text-base">
            {hasMounted ? t("featuredMeta") : "Featured on Meta"}
          </h3>
          <ul className="space-y-2 text-xs lg:text-sm">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">💬</span>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                Results of the June 2025 Community Asks Sprint
              </Link>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">💬</span>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                Will you help build our new visual identity?
              </Link>
            </li>
            <li className="flex items-start">
              <span className="text-gray-400 mr-2">📋</span>
              <Link href="/ai-assist" className="text-gray-700 hover:text-blue-600 transition-colors">
                Policy: Generative AI (e.g., ChatGPT) is banned
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm lg:text-base">
            {hasMounted ? t("filtersTitle") : "Custom Filters"}
          </h3>
          <Link href="/filters">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-blue-600 border-blue-600 hover:bg-blue-50 bg-transparent text-xs lg:text-sm"
            >
              Create a custom filter
            </Button>
          </Link>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm lg:text-base">
            {hasMounted ? t("watchedTags") : "Watched Tags"}
          </h3>
          <div className="flex items-center justify-center py-6 lg:py-8">
            <div className="text-center">
              <Eye className="w-10 h-10 lg:w-12 lg:h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-xs lg:text-sm text-gray-500 mb-3">
                Watch tags to curate your list of questions.
              </p>
              <Link href="/tags">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50 bg-transparent text-xs lg:text-sm"
                >
                  👁️ {hasMounted ? t("watchTagTitle") : "Watch a tag"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightSideBar;
