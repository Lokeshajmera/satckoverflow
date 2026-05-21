import React, { useEffect, useState } from "react";
import Mainlayout from "@/layout/Mainlayout";
import { useTranslation } from "react-i18next";
import { Bot, Sparkles, MessageSquare, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AIAssistPage = () => {
    const { t } = useTranslation();
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    return (
        <Mainlayout>
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row items-center gap-8 mb-16 bg-gradient-to-r from-blue-600 to-indigo-700 p-12 rounded-[3rem] text-white overflow-hidden relative shadow-2xl">
                    <Zap className="absolute right-[-40px] top-[-40px] w-64 h-64 opacity-10 animate-pulse" />
                    <div className="relative z-10 flex-grow">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xl">
                                <Bot className="w-10 h-10" />
                            </div>
                            <Badge className="bg-white/10 text-white border-white/20 py-1.5 px-4 text-sm font-bold tracking-widest backdrop-blur-md uppercase">
                                {hasMounted ? t("labs") : "Labs"}
                            </Badge>
                        </div>
                        <h1 className="text-5xl font-black mb-6 tracking-tight leading-tight">
                            {hasMounted ? t("aiAssistTitle") : "AI Assistant"}
                        </h1>
                        <p className="text-xl text-blue-100 max-w-xl leading-relaxed">
                            {hasMounted ? t("aiAssistDesc") : "Harness the power of AI to help you write better code and find answers faster."}
                        </p>
                    </div>
                    <div className="w-full md:w-auto flex flex-col gap-4 relative z-10">
                        <div className="p-6 bg-white/10 rounded-3xl backdrop-blur-2xl border border-white/10">
                            <div className="flex items-center gap-4 mb-2">
                                <Sparkles className="w-5 h-5 text-blue-300" />
                                <span className="font-bold text-lg">Smart Suggestions</span>
                            </div>
                            <p className="text-sm text-blue-100">Get context-aware coding tips and fixes.</p>
                        </div>
                        <div className="p-6 bg-white/10 rounded-3xl backdrop-blur-2xl border border-white/10">
                            <div className="flex items-center gap-4 mb-2">
                                <MessageSquare className="w-5 h-5 text-blue-300" />
                                <span className="font-bold text-lg">Natural Language</span>
                            </div>
                            <p className="text-sm text-blue-100">Ask questions and get answers in plain English.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-[3rem] border border-gray-100 p-20 flex flex-col items-center justify-center text-center shadow-inner">
                    <div className="w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center mb-8 animate-bounce">
                        <Bot className="w-12 h-12 text-blue-600" />
                    </div>
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        {hasMounted ? t("comingSoon") : "Coming Soon"}
                    </h2>
                    <p className="text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
                        {hasMounted ? t("noContentYet") : "We're working hard to bring this feature to you soon!"}
                    </p>
                </div>
            </div>
        </Mainlayout>
    );
};

export default AIAssistPage;
