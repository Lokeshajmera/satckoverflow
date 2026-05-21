import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosinstance";

import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
    const { t } = useTranslation();
    const [hasMounted, setHasMounted] = React.useState(false);

    React.useEffect(() => {
        setHasMounted(true);
    }, []);

    const [identifier, setIdentifier] = useState("");
    const [loading, setLoading] = useState(false);
    const [newPassword, setNewPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        // ... (keep logic same)
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-6 lg:mb-8">
                    <Link href="/" className="flex items-center justify-center mb-4">
                        <div className="w-6 h-6 lg:w-8 lg:h-8 bg-orange-500 rounded mr-2 flex items-center justify-center">
                            <div className="w-4 h-4 lg:w-6 lg:h-6 bg-white rounded-sm flex items-center justify-center">
                                <div className="w-3 h-3 lg:w-4 lg:h-4 bg-orange-500 rounded-sm"></div>
                            </div>
                        </div>
                        <span className="text-lg lg:text-xl font-bold text-gray-800">
                            stack<span className="font-normal">overflow</span>
                        </span>
                    </Link>
                </div>
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader className="space-y-1 text-center">
                            <CardTitle className="text-xl lg:text-2xl">
                                {hasMounted ? t("forgotPasswordTitle") : "Reset your password"}
                            </CardTitle>
                            <CardDescription>
                                {hasMounted ? t("forgotPasswordDesc") : "Enter your registered email or phone number and we'll generate a new password for you."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="identifier" className="text-sm">
                                    {hasMounted ? t("identifierLabel") : "Email or Phone Number"}
                                </Label>
                                <Input
                                    id="identifier"
                                    type="text"
                                    placeholder="m@example.com or +1234567890"
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    value={identifier}
                                    disabled={!!newPassword}
                                />
                            </div>

                            {!newPassword && (
                                <Button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-sm"
                                    disabled={loading}
                                >
                                    {loading ? (hasMounted ? t("processing") : "Processing...") : (hasMounted ? t("resetPasswordButton") : "Reset Password")}
                                </Button>
                            )}

                            {newPassword && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                                    <p className="text-sm text-green-800 font-medium mb-1">{hasMounted ? t("yourNewPassword") : "Your new password:"}</p>
                                    <code className="block p-2 bg-white border rounded text-lg text-center font-mono text-blue-600">
                                        {newPassword}
                                    </code>
                                    <p className="text-xs text-green-600 mt-2">
                                        {hasMounted ? t("resetInstructions") : "Please log in with this new password and change it in your profile settings."}
                                    </p>
                                    <Button
                                        asChild
                                        className="w-full mt-4 bg-green-600 hover:bg-green-700 text-sm"
                                    >
                                        <Link href="/auth">{hasMounted ? t("backToLogin") : "Back to Login"}</Link>
                                    </Button>
                                </div>
                            )}

                            {!newPassword && (
                                <div className="text-center text-sm">
                                    {hasMounted ? t("rememberedPassword") : "Remembered your password?"}{" "}
                                    <Link href="/auth" className="text-blue-600 hover:underline">
                                        {hasMounted ? t("loginLink") : "Log in"}
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
