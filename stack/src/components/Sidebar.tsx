import { cn } from "@/lib/utils";
import {
  Bookmark,
  Bot,
  Building,
  FileText,
  Globe,
  Home,
  MessageSquare,
  MessageSquareIcon,
  Tag,
  Trophy,
  Users,
  Users2,
  CreditCard,
  Plus,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import React from "react";

const Sidebar = ({ isopen }: any) => {
  const { t } = useTranslation();
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <div>
      <aside
        className={cn(
          "fixed z-40 md:relative md:z-0 top-[53px] md:top-0 h-[calc(100vh-53px)] md:min-h-screen w-48 lg:w-64 bg-white shadow-sm border-r transition-transform duration-200 ease-in-out md:translate-x-0",
          isopen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="p-2 lg:p-4">
          <ul className="space-y-1">
            <li>
              <Link
                href="/"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Home className="w-4 h-4 mr-2 lg:mr-3" />
                {hasMounted ? t("home") : "Home"}
              </Link>
            </li>
            <li>
              <Link
                href="/questions"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm font-semibold"
              >
                <MessageSquareIcon className="w-4 h-4 mr-2 lg:mr-3" />
                {hasMounted ? t("questions") : "Questions"}
              </Link>
              {/* Nested Ask Question button inside Questions Section */}
              <div className="pl-6 pr-2 py-1">
                <Link
                  href="/ask"
                  className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 hover:text-orange-800 rounded-md text-xs font-bold transition-all shadow-sm border border-orange-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {hasMounted ? t("askQuestion") : "Ask Question"}
                </Link>
              </div>
            </li>
            <li>
              <Link
                href="/leaderboard"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                {hasMounted ? t("leaderboard") : "Leaderboard"}
              </Link>
            </li>
            <li>
              <Link
                href="/ai-assist"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Bot className="w-4 h-4 mr-2 lg:mr-3" />
                {hasMounted ? t("aiAssistTitle") : "AI Assist"}
              </Link>
            </li>
            <li>
              <Link
                href="/tags"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Tag className="w-4 h-4 mr-2 lg:mr-3" />
                {hasMounted ? t("tags") : "Tags"}
              </Link>
            </li>
            <li>
              <Link
                href="/users"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Users className="w-4 h-4 mr-2 lg:mr-3" />
                {hasMounted ? t("users") : "Users"}
              </Link>
            </li>
            <li>
              <Link
                href="/social"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Globe className="w-4 h-4 mr-2 lg:mr-3" />
                {hasMounted ? t("socialFeed") : "Social Feed"}
              </Link>
            </li>
            <li>
              <Link
                href="/social/friends"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Users2 className="w-4 h-4 mr-2 lg:mr-3" />
                {hasMounted ? t("friends") : "Friends"}
              </Link>
            </li>
            <li>
              <Link
                href="/subscription"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <CreditCard className="w-4 h-4 mr-2 lg:mr-3 text-orange-500" />
                {hasMounted ? t("subscriptions") : "Subscriptions"}
              </Link>
            </li>
            <li>
              <Link
                href="/saves"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Bookmark className="w-4 h-4 mr-2 lg:mr-3" />
                {hasMounted ? t("savesTitle") : "Saves"}
              </Link>
            </li>
            <li>
              <Link
                href="/challenges"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                {hasMounted ? t("challengesTitle") : "Challenges"}
              </Link>
            </li>
            <li>
              <Link
                href="/chat"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <MessageSquare className="w-4 h-4 mr-2 lg:mr-3" />
                {hasMounted ? t("chatTitle") : "Chat"}
              </Link>
            </li>
            <li>
              <Link
                href="/articles"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <FileText className="w-4 h-4 mr-2 lg:mr-3" />
                {hasMounted ? t("articlesTitle") : "Articles"}
              </Link>
            </li>
            <li>
              <Link
                href="/companies"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
              >
                <Building className="w-4 h-4 mr-2 lg:mr-3" />
                {hasMounted ? t("companiesTitle") : "Companies"}
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  );
};

export default Sidebar;
