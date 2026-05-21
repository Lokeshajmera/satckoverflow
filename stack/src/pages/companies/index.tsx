import React, { useEffect, useState } from "react";
import Mainlayout from "@/layout/Mainlayout";
import { useTranslation } from "react-i18next";
import { Building, MapPin, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const CompaniesPage = () => {
    const { t } = useTranslation();
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    return (
        <Mainlayout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-10 text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        {hasMounted ? t("companiesTitle") : "Companies"}
                    </h1>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        {hasMounted ? t("companiesDesc") : "Discover the best places to work and grow your career."}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="group hover:shadow-xl transition-all duration-300 border-gray-100 overflow-hidden">
                            <div className="h-24 bg-gray-50 flex items-center justify-center p-6 grayscale group-hover:grayscale-0 transition-all">
                                <div className="w-12 h-12 bg-white rounded-lg shadow-sm animate-pulse" />
                            </div>
                            <CardContent className="p-6">
                                <div className="h-5 w-32 bg-gray-100 rounded animate-pulse mb-4" />
                                <div className="flex items-center gap-2 mb-2">
                                    <MapPin className="w-3 h-3 text-gray-400" />
                                    <div className="h-3 w-40 bg-gray-50 rounded animate-pulse" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Briefcase className="w-3 h-3 text-gray-400" />
                                    <div className="h-3 w-24 bg-gray-50 rounded animate-pulse" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="bg-blue-600 rounded-3xl p-10 text-white text-center shadow-2xl shadow-blue-200 relative overflow-hidden">
                    <Building className="absolute left-[-20px] bottom-[-20px] w-64 h-64 opacity-10" />
                    <h2 className="text-3xl font-bold mb-4">{hasMounted ? t("comingSoon") : "Coming Soon"}</h2>
                    <p className="opacity-90 text-lg mb-8 max-w-2xl mx-auto">
                        {hasMounted ? t("noContentYet") : "We're working hard to bring this feature to you soon!"}
                    </p>
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition cursor-pointer font-semibold">
                        Get Notified
                    </div>
                </div>
            </div>
        </Mainlayout>
    );
};

export default CompaniesPage;
