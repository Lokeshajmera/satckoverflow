import React, { useState, useEffect } from "react";
import Mainlayout from "@/layout/Mainlayout";
import { Check, Shield, Zap, Star, Clock, Bot } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "react-toastify";
import { useRouter } from "next/router";



import { useTranslation } from "react-i18next";

const Subscription = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [currentTimeIST, setCurrentTimeIST] = useState("");
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();

    const plans = [
        {
            name: "Free",
            price: 0,
            questions: 1,
            features: [t("standardSupport"), t("communityAccess")],
            color: "bg-gray-100",
            icon: <Zap className="w-6 h-6 text-gray-500" />,
        },
        {
            name: "Bronze",
            price: 100,
            questions: 5,
            features: [t("bronzeBadge"), t("emailSupport")],
            color: "bg-orange-50",
            buttonColor: "bg-orange-600 hover:bg-orange-700",
            icon: <Star className="w-6 h-6 text-orange-600" />,
            popular: false,
        },
        {
            name: "Silver",
            price: 300,
            questions: 10,
            features: [t("silverBadge"), t("prioritySupport"), t("noAds")],
            color: "bg-blue-50",
            buttonColor: "bg-blue-600 hover:bg-blue-700",
            icon: <Shield className="w-6 h-6 text-blue-600" />,
            popular: true,
        },
        {
            name: "Gold",
            price: 1000,
            questions: t("unlimited"),
            features: [t("goldBadge"), t("support247"), t("personalMentor")],
            color: "bg-yellow-50",
            buttonColor: "bg-yellow-600 hover:bg-yellow-700",
            icon: <Star className="w-6 h-6 text-yellow-600" />,
            popular: false,
        },
    ];

    useEffect(() => {
        setIsMounted(true);
        const timer = setInterval(() => {
            const ist = new Date().toLocaleTimeString("en-US", {
                timeZone: "Asia/Kolkata",
                hour12: true,
            });
            setCurrentTimeIST(ist);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    if (!isMounted) {
        return (
            <Mainlayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                </div>
            </Mainlayout>
        );
    }
    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async (plan: any) => {
        if (!user) {
            toast.error(t("loginLink")); // Using existing key or just "Please login to subscribe"
            return router.push("/auth");
        }

        if (plan.price === 0) return;

        setLoading(true);
        const res = await loadRazorpay();

        if (!res) {
            toast.error("Razorpay SDK failed to load. Are you online?");
            setLoading(false);
            return;
        }

        try {
            // 1. Create Order
            const orderRes = await axiosInstance.post("/payment/order", {
                amount: plan.price,
                planName: plan.name,
            });

            const order = orderRes.data.data;

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
                amount: order.amount,
                currency: order.currency,
                name: "CodeQuest",
                description: `${plan.name} Subscription`,
                order_id: order.id,
                handler: async (response: any) => {
                    try {
                        const verifyRes = await axiosInstance.post("/payment/verify", {
                            ...response,
                            planName: plan.name,
                            amount: plan.price,
                        });
                        if (verifyRes.status === 200) {
                            // Update local storage so the new plan is reflected immediately
                            const updatedUser = verifyRes.data.data;
                            const currentLocalUser = JSON.parse(localStorage.getItem("user") || "{}");
                            localStorage.setItem("user", JSON.stringify({ ...currentLocalUser, ...updatedUser }));

                            toast.success(`Subscription updated to ${plan.name}!`);
                            setTimeout(() => {
                                window.location.reload();
                            }, 2000);
                        }
                    } catch (err: any) {
                        toast.error(err.response?.data?.message || "Verification failed");
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                },
                theme: {
                    color: "#f48024",
                },
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || "Failed to initiate payment";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };
    return (
        <Mainlayout>
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("choosePlan")}</h1>
                    <p className="text-xl text-gray-600">{t("planSubtitle")}</p>

                    <div className="mt-6 inline-flex items-center bg-orange-50 px-4 py-2 rounded-full border border-orange-200">
                        <Clock className="w-4 h-4 text-orange-600 mr-2" />
                        <span className="text-orange-800 text-sm font-medium">
                            {t("paymentWindow")}: 10:00 AM - 11:00 AM IST ({t("currentIST")}: {currentTimeIST || t("calculating")})
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative rounded-2xl p-8 flex flex-col border transition-all duration-300 hover:shadow-xl ${plan.popular ? "border-blue-500 ring-2 ring-blue-500 ring-opacity-20 translate-y-[-10px]" : "border-gray-200"
                                } ${plan.color}`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-8 transform translate-y-[-50%]">
                                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                        {t("mostPopular")}
                                    </span>
                                </div>
                            )}

                            <div className="mb-6">{plan.icon}</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                            <div className="flex items-baseline mb-6">
                                <span className="text-4xl font-extrabold tracking-tight text-gray-900">
                                    ₹{plan.price}
                                </span>
                                <span className="ml-1 text-xl font-semibold text-gray-500">{t("perMonth")}</span>
                            </div>

                            <p className="text-gray-600 font-medium mb-6">
                                {plan.questions} {typeof plan.questions === "number" ? t("questionsPerDay") : ""}
                            </p>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start">
                                        <Check className="w-5 h-5 text-green-500 mr-2 shrink-0" />
                                        <span className="text-gray-600 text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                disabled={loading || (user?.plan === plan.name) || (plan.price === 0)}
                                onClick={() => handlePayment(plan)}
                                className={`w-full py-4 px-6 rounded-xl text-sm font-bold transition-all duration-200 ${user?.plan === plan.name
                                    ? "bg-green-100 text-green-700 cursor-default"
                                    : plan.price === 0
                                        ? "bg-gray-200 text-gray-500 cursor-default"
                                        : `${plan.buttonColor} text-white shadow-lg`
                                    }`}
                            >
                                {user?.plan === plan.name ? t("currentPlan") : plan.price === 0 ? t("defaultPlan") : t("upgradeNow")}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-16 bg-white border border-gray-200 rounded-3xl p-8 lg:p-12">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-orange-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-6 h-6 text-orange-600" />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">{t("securePayments")}</h4>
                            <p className="text-gray-600 text-sm">{t("securePaymentsDesc")}</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Star className="w-6 h-6 text-green-600" />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">{t("expertBadge")}</h4>
                            <p className="text-gray-600 text-sm">{t("expertBadgeDesc")}</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Bot className="w-6 h-6 text-blue-600" />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">{t("premiumPerks")}</h4>
                            <p className="text-gray-600 text-sm">{t("premiumPerksDesc")}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Mainlayout>
    );
};

export default Subscription;
