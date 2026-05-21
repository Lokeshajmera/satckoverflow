import React, { useEffect, useState } from "react";
import Mainlayout from "@/layout/Mainlayout";
import { useTranslation } from "react-i18next";
import { Info, Globe, Shield, Heart } from "lucide-react";

const AboutPage = () => {
    const { t } = useTranslation();
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    return (
        <Mainlayout>
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-3 bg-orange-50 rounded-2xl mb-6">
                        <Info className="w-10 h-10 text-orange-500" />
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">
                        {hasMounted ? t("aboutUsTitle") : "About CodeQuest"}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        {hasMounted ? t("aboutUsDesc") : "Empowering the world's developers to share and grow knowledge."}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {[
                        { icon: Globe, title: "Open Community", color: "text-blue-500", bg: "bg-blue-50" },
                        { icon: Shield, title: "Secure Platform", color: "text-green-500", bg: "bg-green-50" },
                        { icon: Heart, title: "Built with Passion", color: "text-red-500", bg: "bg-red-50" }
                    ].map((item, idx) => (
                        <div key={idx} className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center">
                            <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                                <item.icon className={`w-7 h-7 ${item.color}`} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                            <p className="text-gray-500 text-sm">
                                We believe in the power of collective intelligence and building tools that make collaboration seamless.
                            </p>
                        </div>
                    ))}
                </div>

                <div className="p-12 bg-gray-900 rounded-[3rem] text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-[100px] -mr-48 -mt-48" />
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
                            <p className="text-gray-400 text-lg leading-relaxed mb-8">
                                Our mission is to help developers write better code, faster, by providing a platform where knowledge flows freely and contributions are rewarded.
                            </p>
                            <div className="flex gap-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-orange-500 mb-1">10M+</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-widest">Developers</div>
                                </div>
                                <div className="w-[1px] h-10 bg-gray-800 my-auto" />
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-orange-500 mb-1">50M+</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-widest">Questions</div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="aspect-square bg-gray-800/50 rounded-2xl border border-white/5 animate-pulse" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Mainlayout>
    );
};

export default AboutPage;
