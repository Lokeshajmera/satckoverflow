import React, { useEffect, useState } from "react";
import Mainlayout from "@/layout/Mainlayout";
import { useTranslation } from "react-i18next";
import { MessageSquare, Users, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const ChatPage = () => {
    const { t } = useTranslation();
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    return (
        <Mainlayout>
            <div className="max-w-6xl mx-auto px-4 py-8 h-[calc(100vh-100px)] flex flex-col">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <MessageSquare className="w-6 h-6 text-blue-500" />
                        {hasMounted ? t("chatTitle") : "Community Chat"}
                    </h1>
                    <p className="text-sm text-gray-600">
                        {hasMounted ? t("chatDesc") : "Connect with developers around the world in real-time."}
                    </p>
                </div>

                <div className="flex-grow bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex">
                    {/* Sidebar */}
                    <div className="w-64 border-r border-gray-100 hidden md:block bg-gray-50/50 p-4">
                        <div className="flex items-center gap-2 mb-6">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Online</span>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                                    <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Chat Area */}
                    <div className="flex-grow flex flex-col relative">
                        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-transparent to-gray-50/30">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                <MessageSquare className="w-10 h-10 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                {hasMounted ? t("comingSoon") : "Coming Soon"}
                            </h2>
                            <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
                                {hasMounted ? t("chatDesc") : "Connect with developers around the world in real-time."}
                                {" "}{hasMounted ? t("noContentYet") : "We're working hard to bring this feature to you soon!"}
                            </p>
                        </div>

                        {/* Input Bar Placeholder */}
                        <div className="p-4 border-t border-gray-100 bg-white">
                            <div className="flex gap-2">
                                <div className="flex-grow bg-gray-50 rounded-xl px-4 py-3 text-gray-400 text-sm">
                                    {hasMounted ? t("comingSoon") : "Coming Soon"}...
                                </div>
                                <Button disabled className="rounded-xl bg-blue-600">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Mainlayout>
    );
};

export default ChatPage;
