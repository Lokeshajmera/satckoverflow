import { useAuth } from "@/lib/AuthContext";
import { Menu, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";

// const User = {
//   _id: "1",
//   name: "Alice Johnson",
// };

const Navbar = ({ handleslidein }: any) => {
  const { user, Logout } = useAuth();
  const { t } = useTranslation();
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  const handlelogout = () => {
    Logout();
  };
  return (
    <div className="top-0 z-50 w-full min-h-[53px] bg-white border-t-[3px] border-[#ef8236] shadow-[0_1px_5px_#00000033] flex items-center justify-center">
      <div className="w-[90%] max-w-[1440px] flex items-center justify-between mx-auto py-1">
        <button
          aria-label="Toggle sidebar"
          className="sm:block md:hidden p-2 rounded hover:bg-gray-100 transition"
          onClick={handleslidein}
        >
          <Menu className="w-5 h-5 text-gray-800" />
        </button>
        <div className="flex items-center gap-2 flex-grow">
          <Link href="/" className="px-3 py-1">
            <img src="/logo.png" alt="Logo" className="h-6 w-auto" />
          </Link>

          <div className="hidden sm:flex gap-1">
            {[
              { label: "About", key: "aboutUsTitle", href: "/about" },
              { label: "Products", key: "productsTitle", href: "/products" },
              { label: "For Teams", key: "forTeamsTitle", href: "/for-teams" }
            ].map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="text-sm text-[#454545] font-medium px-4 py-2 rounded hover:bg-gray-200 transition"
              >
                {hasMounted ? t(item.key) : item.label}
              </Link>
            ))}
          </div>
          <form className="hidden lg:block flex-grow relative px-3">
            <input
              type="text"
              placeholder={hasMounted ? t("searchPlaceholder") : "Search..."}
              className="w-full max-w-[600px] pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <Search className="absolute left-4 top-2.5 h-4 w-4 text-gray-600" />
          </form>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {!hasMounted ? null : !user ? (
            <Link
              href="/auth"
              className="text-sm font-medium text-[#454545] bg-[#e7f8fe] hover:bg-[#d3e4eb] border border-blue-500 px-4 py-1.5 rounded transition"
            >
              {t("login")}
            </Link>
          ) : (
            <>
              <Link
                href={`/users/${user._id}`}
                className="flex items-center justify-center bg-orange-600 text-white text-sm font-semibold w-9 h-9 rounded-full"
              >
                {user.name?.charAt(0).toUpperCase()}
              </Link>

              <div className="flex flex-col items-start hidden sm:flex mr-2">
                <span className="text-xs font-semibold text-gray-800 leading-tight">{user.name}</span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full ${user.plan === "Gold" ? "bg-yellow-100 text-yellow-800 border-yellow-300" :
                  user.plan === "Silver" ? "bg-gray-200 text-gray-700 border-gray-400" :
                    user.plan === "Bronze" ? "bg-orange-100 text-orange-800 border-orange-300" :
                      "bg-blue-50 text-blue-600 border-blue-200"
                  } border`}>
                  {hasMounted ? t(user.plan || "Free") : (user.plan || "Free")} {hasMounted ? t("planDisplay") : "Plan"}
                </span>
                <span className="text-[10px] font-bold text-orange-600 mt-0.5">
                  {(user.points || 0).toLocaleString()} {hasMounted ? t("reputation") : "reputation"}
                </span>
              </div>

              <button
                onClick={handlelogout}
                className="text-sm font-medium text-[#454545] bg-[#e7f8fe] hover:bg-[#d3e4eb] border border-blue-500 px-4 py-1.5 rounded transition"
              >
                {t("logout")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
