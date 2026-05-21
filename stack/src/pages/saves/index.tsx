import React, { useEffect, useState } from "react";
import Mainlayout from "@/layout/Mainlayout";
import { useTranslation } from "react-i18next";
import { Bookmark, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const SavesPage = () => {
    const { t } = useTranslation();
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    return (
        <Mainlayout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <Bookmark className="w-8 h-8 text-orange-500" />
                            {hasMounted ? t("savesTitle") : "Your Saves"}
                        </h1>
                        <p className="text-gray-600">
                            {hasMounted ? t("savesDesc") : "Keep track of the questions and articles that matter most to you."}
                        </p>
                    </div>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input className="pl-10" placeholder={hasMounted ? t("searchUser") : "Search..."} />
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                        <Bookmark className="w-8 h-8 text-orange-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {hasMounted ? t("comingSoon") : "Coming Soon"}
                    </h2>
                    <p className="text-gray-500 text-center max-w-sm">
                        {hasMounted ? t("noContentYet") : "We're working hard to bring this feature to you soon!"}
                    </p>
                </div>
            </div>
        </Mainlayout>
    );
};

export default SavesPage;
