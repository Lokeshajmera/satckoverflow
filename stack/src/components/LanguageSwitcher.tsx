import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/AuthContext';
import axiosInstance from '@/lib/axiosinstance';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { Globe } from "lucide-react";

const languages = [
    { name: "English", code: "en" },
    { name: "Spanish", code: "es" },
    { name: "Hindi", code: "hi" },
    { name: "Portuguese", code: "pt" },
    { name: "Chinese", code: "zh" },
    { name: "French", code: "fr" },
];

const LanguageSwitcher = () => {
    const { user, updateLanguage } = useAuth();
    const { i18n } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingLanguage, setPendingLanguage] = useState<any>(null);
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    // Expose to window for the reload logic
    if (typeof window !== "undefined") {
        (window as any).updateLanguage = updateLanguage;
    }

    const handleLanguageChange = async (targetLang: any) => {
        if (targetLang.code === i18n.language) return;

        if (!user) {
            // If guest, maybe we allow switching without OTP or redirect to login?
            // Requirement says "ensure security... additional verification required".
            // Since there's no "registered" email for a guest, we only allow this for logged-in users.
            toast.warn("Please log in to change your preferred language with verification.");
            return;
        }


        try {
            setLoading(true);
            const res = await axiosInstance.post("/user/request-language-otp", {
                newLanguage: targetLang.name
            });
            setPendingLanguage(targetLang);
            setIsModalOpen(true);
            toast.info(res.data.message);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to request OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!pendingLanguage) return;
        try {
            setLoading(true);
            await axiosInstance.post("/user/verify-language-otp", {
                otp,
                newLanguage: pendingLanguage.name
            });

            // 1. Change language in i18n
            await i18n.changeLanguage(pendingLanguage.code);

            // 2. Update local user state in context
            if ((window as any).updateLanguage) {
                (window as any).updateLanguage(pendingLanguage.name);
            }

            setIsModalOpen(false);
            setOtp("");
            toast.success(`Language changed to ${pendingLanguage.name}`);

            // 3. Force reload to ensure all components apply the change correctly
            window.location.reload();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-500" />
            <select
                className="bg-transparent border-none focus:ring-0 text-sm cursor-pointer"
                value={i18n.language}
                onChange={(e) => {
                    const lang = languages.find(l => l.code === e.target.value);
                    handleLanguageChange(lang);
                }}
            >
                {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.name}
                    </option>
                ))}
            </select>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Verification Required</DialogTitle>
                        <DialogDescription>
                            Please enter the OTP sent to your {pendingLanguage?.name === 'French' ? 'email' : 'mobile number'} to change language.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleVerifyOtp} disabled={loading}>
                            {loading ? "Verifying..." : "Verify & Change"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default LanguageSwitcher;
