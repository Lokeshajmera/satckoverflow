import React, { useEffect, useState } from "react";
import Mainlayout from "@/layout/Mainlayout";
import { useTranslation } from "react-i18next";
import { Trophy, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ChallengesPage = () => {
    const { t } = useTranslation();
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    return (
        <Mainlayout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Trophy className="w-8 h-8 text-yellow-500" />
                            {hasMounted ? t("challengesTitle") : "Challenges"}
                        </h1>
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200 animate-pulse">
                            {hasMounted ? t("new") : "NEW"}
                        </Badge>
                    </div>
                    <p className="text-gray-600">
                        {hasMounted ? t("challengesDesc") : "Compete with other developers and level up your skills."}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white shadow-xl relative overflow-hidden group">
                        <Zap className="absolute right-[-20px] top-[-20px] w-48 h-48 opacity-10 group-hover:scale-110 transition-transform" />
                        <h3 className="text-2xl font-bold mb-4">{hasMounted ? t("comingSoon") : "Coming Soon"}</h3>
                        <p className="opacity-90 mb-6">
                            {hasMounted ? t("noContentYet") : "We're working hard to bring this feature to you soon!"}
                        </p>
                        <div className="flex gap-2">
                            <div className="w-12 h-1.5 bg-white/30 rounded-full overflow-hidden">
                                <div className="w-1/2 h-full bg-white"></div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-center">
                        <Trophy className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 italic">
                            "The only way to learn a new programming language is by writing programs in it."
                        </p>
                    </div>
                </div>
            </div>
        </Mainlayout>
    );
};

export default ChallengesPage;
