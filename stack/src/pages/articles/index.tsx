import React, { useEffect, useState } from "react";
import Mainlayout from "@/layout/Mainlayout";
import { useTranslation } from "react-i18next";
import { FileText, Newspaper, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ArticlesPage = () => {
    const { t } = useTranslation();
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    return (
        <Mainlayout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-purple-100 rounded-xl">
                        <FileText className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {hasMounted ? t("articlesTitle") : "Articles"}
                        </h1>
                        <p className="text-gray-600">
                            {hasMounted ? t("articlesDesc") : "Deep dives into technical topics by the community's experts."}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <Newspaper className="w-16 h-16 text-gray-200 mb-4" />
                            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                                {hasMounted ? t("comingSoon") : "Coming Soon"}
                            </h2>
                            <p className="text-gray-500 text-center max-w-sm">
                                {hasMounted ? t("noContentYet") : "We're working hard to bring this feature to you soon!"}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-white">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-purple-500" />
                                    Trending Topics
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {["Web Performance", "AI in DevOps", "Rust for Web", "Microservices"].map((topic) => (
                                        <div key={topic} className="h-10 bg-white/60 rounded-lg animate-pulse border border-purple-100 flex items-center px-3 text-sm text-purple-700 font-medium">
                                            {topic}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </Mainlayout>
    );
};

export default ArticlesPage;
