"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Heart, Lock, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

// Spinner component (matching home page)
function Spinner() {
    return (
        <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}

export default function Profile() {
    const [user, setUser] = useState<any>(null);
    // Bug fix #3: store sessionToken separately from user object
    const [sessionToken, setSessionToken] = useState<string | null>(null);
    const [isLogin, setIsLogin] = useState(true);

    // Auth Form State
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Partner Form State
    const [partnerName, setPartnerName] = useState("");
    const [partnerPhone, setPartnerPhone] = useState("");
    const [partnerEmail, setPartnerEmail] = useState("");
    const [savingPartner, setSavingPartner] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        // Bug fix #3: restore user + sessionToken from localStorage separately
        const storedUser = localStorage.getItem("cheater_detector_user");
        const storedToken = localStorage.getItem("cheater_detector_token");
        if (storedUser && storedToken) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setSessionToken(storedToken);
            if (parsedUser.partner) {
                setPartnerName(parsedUser.partner.name || "");
                setPartnerPhone(parsedUser.partner.phone || "");
                setPartnerEmail(parsedUser.partner.email || "");
            }
        }
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: isLogin ? "login" : "register",
                    // Bug fix #10: trim inputs on the client side too
                    phone: phone.trim(),
                    password: password.trim(),
                    name: name.trim(),
                    email: email.trim(),
                }),
            });
            const data = await res.json();
            if (data.success) {
                setUser(data.user);
                setSessionToken(data.sessionToken);
                // Bug fix #3: store user and token separately; don't store raw _id object as "auth"
                localStorage.setItem("cheater_detector_user", JSON.stringify(data.user));
                localStorage.setItem("cheater_detector_token", data.sessionToken);
                if (data.user.partner) {
                    setPartnerName(data.user.partner.name || "");
                    setPartnerPhone(data.user.partner.phone || "");
                    setPartnerEmail(data.user.partner.email || "");
                }
            } else {
                setError(data.error);
            }
        } catch (err: any) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleSavePartner = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingPartner(true);
        // Bug fix #9: clear BOTH messages at the start of each save attempt
        setSuccessMsg("");
        setError("");

        try {
            const res = await fetch("/api/users", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user._id,
                    // Bug fix #2/#3: send the sessionToken so the server can verify the request
                    sessionToken,
                    partnerName,
                    partnerPhone,
                    partnerEmail,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setUser(data.user);
                localStorage.setItem("cheater_detector_user", JSON.stringify(data.user));
                setSuccessMsg("Partner details saved successfully! Totally private.");
            } else {
                setError(data.error);
            }
        } catch (err: any) {
            setError("Something went wrong");
        } finally {
            setSavingPartner(false);
        }
    };

    const logout = () => {
        setUser(null);
        setSessionToken(null);
        // Bug fix #3: clear both storage keys on logout
        localStorage.removeItem("cheater_detector_user");
        localStorage.removeItem("cheater_detector_token");
        setPhone("");
        setPassword("");
        setName("");
        setEmail("");
        // Bug fix #9: also clear stale messages on logout
        setError("");
        setSuccessMsg("");
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] w-full px-4 mt-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                    <Card className="glass-card">
                        <CardHeader className="text-center">
                            <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                                <Lock className="w-6 h-6 text-primary" />
                            </div>
                            <CardTitle className="text-2xl">{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
                            <CardDescription>
                                {isLogin ? "Enter your phone and password to login" : "Sign up to add your partner to the detector"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAuth} className="space-y-4">
                                {!isLogin && (
                                    <>
                                        <Input placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
                                        <Input type="email" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                    </>
                                )}
                                <Input type="tel" placeholder="Your Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                                <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                                {error && <p className="text-sm text-destructive">{error}</p>}

                                {/* Bug fix #8: spinner instead of "..." */}
                                <Button type="submit" className="w-full mt-2" disabled={loading}>
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Spinner />
                                            {isLogin ? "Logging in…" : "Creating account…"}
                                        </span>
                                    ) : (
                                        isLogin ? "Login" : "Sign Up"
                                    )}
                                </Button>
                            </form>
                            <div className="mt-6 text-center text-sm">
                                <button
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        // Bug fix #9: clear errors when switching auth mode
                                        setError("");
                                    }}
                                    className="text-primary hover:underline"
                                >
                                    {isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center min-h-[calc(100vh-16rem)] w-full px-4 mt-10 mb-10 text-slate-100">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold border-b border-white/10 pb-2 inline-block">Hi, {user.name}</h1>
                    </div>
                    <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
                </div>

                <Card className="glass-card mb-8">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                                <Heart className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Partner Details</CardTitle>
                                <CardDescription>
                                    Add your partner's info here. It will be completely hidden from public view.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSavePartner} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Partner's Name</label>
                                    <Input placeholder="John Doe" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Partner's Phone</label>
                                    <Input type="tel" placeholder="+1234567890" value={partnerPhone} onChange={(e) => setPartnerPhone(e.target.value)} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Partner's Email</label>
                                <Input type="email" placeholder="john@example.com" value={partnerEmail} onChange={(e) => setPartnerEmail(e.target.value)} required />
                            </div>

                            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
                            {successMsg && <p className="text-sm text-green-400 mt-2">{successMsg}</p>}

                            <div className="flex justify-end pt-4">
                                {/* Bug fix #8: spinner on save button too */}
                                <Button type="submit" disabled={savingPartner} className="shadow-lg shadow-accent/20 bg-accent hover:bg-accent/90">
                                    {savingPartner ? (
                                        <span className="flex items-center gap-2">
                                            <Spinner />
                                            Saving…
                                        </span>
                                    ) : (
                                        "Lock in Partner"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-sm text-slate-400 flex gap-4 items-start">
                    <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
                    <p>
                        Privacy Note: If someone searches for the exact details you just entered,
                        your name will be shown as the person claiming them. This keeps the game fun and accountable! However, your phone and email remain private.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
