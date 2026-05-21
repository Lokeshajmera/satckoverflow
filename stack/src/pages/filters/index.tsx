import React, { useEffect, useState } from "react";
import Mainlayout from "@/layout/Mainlayout";
import { useTranslation } from "react-i18next";
import { Filter, Layers, Plus, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const FiltersPage = () => {
    const { t } = useTranslation();
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    return (
        <Mainlayout>
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 px-4">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-50 rounded-2xl">
                                <Filter className="w-8 h-8 text-blue-600" />
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                                {hasMounted ? t("filtersTitle") : "Custom Filters"}
                            </h1>
                        </div>
                        <p className="text-xl text-gray-600 leading-relaxed max-w-2xl font-medium">
                            {hasMounted ? t("filtersDesc") : "Create custom views of questions based on your specific interests and needs."}
                        </p>
                    </div>
                    <Button className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-lg shadow-xl shadow-blue-200 transition-transform hover:scale-105 active:scale-95 gap-3">
                        <Plus className="w-6 h-6" />
                        Create Filter
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {[
                        { title: "No Answers", desc: "Questions that haven't received any answers yet.", color: "bg-orange-50", iconColor: "text-orange-500" },
                        { title: "Trending Now", desc: "Most viewed questions in the last 24 hours.", color: "bg-purple-50", iconColor: "text-purple-500" },
                        { title: "My Workspace", desc: "Questions related to your pinned technologies.", color: "bg-green-50", iconColor: "text-green-500" }
                    ].map((item, idx) => (
                        <div key={idx} className="group p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                            <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                                <Layers className={`w-7 h-7 ${item.iconColor}`} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6">{item.desc}</p>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600 transition-colors cursor-pointer hover:text-blue-700">
                                Manage Filter
                                <Settings2 className="w-4 h-4" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-900 rounded-[4rem] p-20 text-white text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[120px] -mr-48 -mt-48" />
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-white/10 rounded-3xl backdrop-blur-xl flex items-center justify-center mb-8 border border-white/10 animate-pulse">
                            <Filter className="w-10 h-10 text-blue-400" />
                        </div>
                        <h2 className="text-4xl font-bold mb-6 tracking-tight">{hasMounted ? t("comingSoon") : "Coming Soon"}</h2>
                        <p className="text-gray-400 text-xl max-w-xl mx-auto leading-relaxed mb-10">
                            {hasMounted ? t("noContentYet") : "We're working hard to bring this feature to you soon!"}
                        </p>
                        <div className="h-14 px-10 rounded-full border-2 border-white/20 flex items-center justify-center text-lg font-bold hover:bg-white hover:text-gray-900 transition backdrop-blur-md cursor-pointer">
                            Stay Updated
                        </div>
                    </div>
                </div>
            </div>
        </Mainlayout>
    );
};

export default FiltersPage;
