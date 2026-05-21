import React, { useEffect, useState } from "react";
import Mainlayout from "@/layout/Mainlayout";
import { useTranslation } from "react-i18next";
import { Box, Code, Sparkles, Layers } from "lucide-react";

const ProductsPage = () => {
    const { t } = useTranslation();
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    return (
        <Mainlayout>
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center mb-20">
                    <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        {hasMounted ? t("productsTitle") : "Our Products"}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        {hasMounted ? t("productsDesc") : "Tools and services designed to help developers succeed."}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { icon: Code, title: "CodeQuest API", color: "from-orange-400 to-orange-600" },
                        { icon: Sparkles, title: "AI Assistant", color: "from-blue-400 to-blue-600" },
                        { icon: Layers, title: "Data Insights", color: "from-purple-400 to-purple-600" }
                    ].map((product, idx) => (
                        <div key={idx} className="group relative bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">
                            <div className={`w-16 h-16 bg-gradient-to-br ${product.color} rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform`}>
                                <product.icon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">{product.title}</h3>
                            <p className="text-gray-500 mb-8 leading-relaxed">
                                Advanced developer tools built to scale your workflow and provide unparalleled insights into your codebase.
                            </p>
                            <div className="h-1 w-12 bg-gray-200 rounded-full group-hover:w-full transition-all duration-500" />
                        </div>
                    ))}
                </div>

                <div className="mt-24 p-12 bg-gray-50 rounded-[3rem] border border-gray-100 flex flex-col items-center text-center">
                    <Box className="w-16 h-16 text-gray-300 mb-6" />
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{hasMounted ? t("comingSoon") : "Coming Soon"}</h2>
                    <p className="text-gray-500 max-w-xl mx-auto text-lg">
                        {hasMounted ? t("noContentYet") : "We're working hard to bring this feature to you soon!"}
                    </p>
                </div>
            </div>
        </Mainlayout>
    );
};

export default ProductsPage;
