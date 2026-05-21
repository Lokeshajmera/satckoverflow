import React, { useEffect, useState } from "react";
import Mainlayout from "@/layout/Mainlayout";
import { useTranslation } from "react-i18next";
import { Users, Lock, Rocket, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const ForTeamsPage = () => {
    const { t } = useTranslation();
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    return (
        <Mainlayout>
            <div className="max-w-7xl mx-auto px-4 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-bold mb-6">
                            <Lock className="w-4 h-4" />
                            Enterprise Secure
                        </div>
                        <h1 className="text-6xl font-black text-gray-900 mb-8 leading-[1.1]">
                            {hasMounted ? t("forTeamsTitle") : "CodeQuest for Teams"}
                        </h1>
                        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                            {hasMounted ? t("forTeamsDesc") : "Collaborate and share knowledge within your organization securely."}
                        </p>
                        <div className="flex gap-4">
                            <Button className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-lg shadow-xl shadow-blue-200">
                                Get Started
                            </Button>
                            <Button variant="outline" className="h-14 px-8 rounded-2xl text-lg border-2">
                                Learn More
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: Rocket, title: "Boost Flow", color: "bg-orange-500" },
                            { icon: MessageSquare, title: "Direct Chat", color: "bg-blue-500" },
                            { icon: Users, title: "Team Hub", color: "bg-purple-500" },
                            { icon: Lock, title: "Private", color: "bg-green-500" }
                        ].map((item, idx) => (
                            <div key={idx} className="aspect-square bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-xl transition-shadow">
                                <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center shadow-lg shadow-gray-200`}>
                                    <item.icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="font-bold text-gray-900 text-lg">{item.title}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-16 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-[4rem] text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                    <h2 className="text-4xl font-bold mb-6 relative z-10">{hasMounted ? t("comingSoon") : "Coming Soon"}</h2>
                    <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10 relative z-10 leading-relaxed">
                        {hasMounted ? t("noContentYet") : "We're working hard to bring this feature to you soon!"}
                    </p>
                    <Button className="h-14 px-10 rounded-2xl bg-orange-500 hover:bg-orange-600 text-lg font-bold relative z-10 transition-transform hover:scale-105 active:scale-95">
                        Notify Me
                    </Button>
                </div>
            </div>
        </Mainlayout>
    );
};

export default ForTeamsPage;
