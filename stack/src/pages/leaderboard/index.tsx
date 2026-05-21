import React, { useEffect, useState } from "react";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { Trophy, Medal, Star, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

interface UserEntry {
    _id: string;
    name: string;
    email: string;
    points: number;
    reputation: number;
    plan: string;
}

const RANK_STYLES = [
    { bg: "bg-gradient-to-r from-yellow-400 to-orange-400", icon: <Trophy className="w-6 h-6 text-white" />, label: "🥇" },
    { bg: "bg-gradient-to-r from-gray-300 to-gray-400", icon: <Medal className="w-6 h-6 text-white" />, label: "🥈" },
    { bg: "bg-gradient-to-r from-orange-300 to-orange-500", icon: <Medal className="w-6 h-6 text-white" />, label: "🥉" },
];

const PLAN_COLORS: Record<string, string> = {
    Gold: "bg-yellow-100 text-yellow-800",
    Silver: "bg-gray-100 text-gray-700",
    Bronze: "bg-orange-100 text-orange-800",
    Free: "bg-blue-50 text-blue-600",
};

export default function Leaderboard() {
    const [users, setUsers] = useState<UserEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"points" | "reputation">("points");

    useEffect(() => {
        axiosInstance.get("/auth/getalluser")
            .then((res) => {
                setUsers(res.data.data || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const sorted = [...users].sort((a, b) =>
        tab === "points" ? (b.points || 0) - (a.points || 0) : (b.reputation || 0) - (a.reputation || 0)
    );

    const top3 = sorted.slice(0, 3);
    const rest = sorted.slice(3);

    return (
        <Mainlayout>
            <div className="max-w-4xl mx-auto px-4 py-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-2xl shadow-orange-200 mb-6">
                        <Trophy className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-3">Global Leaderboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">The top contributors of Code-Quest</p>
                    <div className="flex gap-2 justify-center mt-6">
                        <button
                            onClick={() => setTab("points")}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition ${tab === "points" ? "bg-orange-500 text-white shadow-lg" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}
                        >
                            <Star className="inline w-4 h-4 mr-1 mb-0.5" /> Points
                        </button>
                        <button
                            onClick={() => setTab("reputation")}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition ${tab === "reputation" ? "bg-blue-600 text-white shadow-lg" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}
                        >
                            <TrendingUp className="inline w-4 h-4 mr-1 mb-0.5" /> Reputation
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-12 h-12 rounded-full border-4 border-orange-400 border-t-transparent animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Top 3 Podium */}
                        {top3.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                                {top3.map((u, i) => (
                                    <Link href={`/users/${u._id}`} key={u._id}>
                                        <div className={`relative p-6 rounded-3xl text-white text-center shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer ${RANK_STYLES[i]?.bg || "bg-gray-400"}`}>
                                            <div className="text-4xl mb-3">{RANK_STYLES[i]?.label}</div>
                                            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm mx-auto flex items-center justify-center text-2xl font-black mb-3">
                                                {u.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <p className="font-bold text-lg leading-tight truncate">{u.name}</p>
                                            <p className="text-white/70 text-sm mt-1 truncate">{u.email}</p>
                                            <div className="mt-4 bg-white/20 rounded-2xl py-2 px-4">
                                                <p className="text-2xl font-black">{tab === "points" ? (u.points || 0) : (u.reputation || 0)}</p>
                                                <p className="text-xs font-semibold uppercase tracking-widest text-white/80">{tab}</p>
                                            </div>
                                            {u.plan && (
                                                <span className={`mt-3 inline-block text-xs font-bold px-3 py-1 rounded-full ${PLAN_COLORS[u.plan] || "bg-white/20 text-white"}`}>
                                                    {u.plan} Plan
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Rest of the table */}
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-lg">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                                <Users className="w-5 h-5 text-gray-400" />
                                <h2 className="font-bold text-gray-700 dark:text-gray-200 text-sm">All Rankings</h2>
                            </div>
                            {rest.length === 0 && top3.length === 0 ? (
                                <p className="text-center text-gray-400 py-16 text-sm">No users yet.</p>
                            ) : (
                                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {rest.map((u, i) => (
                                        <Link href={`/users/${u._id}`} key={u._id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition group">
                                            <span className="text-sm font-bold text-gray-400 w-8 text-center">#{i + 4}</span>
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                {u.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-800 dark:text-gray-100 truncate group-hover:text-blue-600 transition">{u.name}</p>
                                                <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                            </div>
                                            {u.plan && (
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full hidden sm:inline ${PLAN_COLORS[u.plan] || "bg-gray-100 text-gray-500"}`}>
                                                    {u.plan}
                                                </span>
                                            )}
                                            <div className="text-right flex-shrink-0">
                                                <p className="font-black text-gray-900 dark:text-gray-100 text-lg">
                                                    {tab === "points" ? (u.points || 0) : (u.reputation || 0)}
                                                </p>
                                                <p className="text-xs text-gray-400 uppercase tracking-wider">{tab}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Mainlayout>
    );
}
