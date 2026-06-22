'use client';

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signUp } from "@/app/actions/auth";
import { Eye, EyeOff, Mail, Phone, Lock, User, ArrowRight, Check } from "lucide-react";
import Logo from "../ui/logo";
import { useAuth } from "@/context/AuthProvider"

// ─── Input Field ───────────────────────────────────────────────────────────────
function InputField({ label, type = "text", icon: Icon, value, onChange, placeholder, rightElement, error }) {
    const [focused, setFocused] = useState(false);
    const hasValue = value && value.length > 0;

    return (
        <div className="relative">
            <div className={`flex items-center gap-3 border rounded-xl px-4 py-3.5 bg-white transition-all duration-200 ${error
                    ? "border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
                    : focused
                        ? "border-[#d97845] shadow-[0_0_0_3px_rgba(217,120,69,0.14)]"
                        : hasValue
                            ? "border-[#c8a990]"
                            : "border-[#e8d9cc]"
                }`}>
                {Icon && (
                    <Icon
                        size={17}
                        className={`shrink-0 transition-colors duration-200 ${focused ? "text-[#d97845]" : "text-[#b8a090]"}`}
                    />
                )}
                <div className="flex-1 relative">
                    <label className={`absolute left-0 transition-all duration-200 pointer-events-none select-none ${focused || hasValue
                            ? "text-[10px] top-0 text-[#d97845] font-semibold tracking-wide"
                            : "text-sm top-[9px] text-[#b8a090]"
                        }`}>
                        {label}
                    </label>
                    <input
                        type={type}
                        value={value}
                        onChange={onChange}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        placeholder={focused ? placeholder : ""}
                        className="w-full bg-transparent outline-none border-none text-[#2c1a0e] text-sm pt-4 pb-0 placeholder:text-[#c8b4a4]"
                    />
                </div>
                {rightElement}
            </div>
            {error && <p className="text-red-500 text-[11px] mt-1 ml-1">{error}</p>}
        </div>
    );
}

// ─── Password Field ────────────────────────────────────────────────────────────
function PasswordField({ label, value, onChange, error }) {
    const [show, setShow] = useState(false);

    return (
        <InputField
            label={label}
            type={show ? "text" : "password"}
            icon={Lock}
            value={value}
            onChange={onChange}
            placeholder="••••••••"
            error={error}
            rightElement={
                <button
                    type="button"
                    onClick={() => setShow(p => !p)}
                    className="bg-transparent border-none cursor-pointer text-[#b8a090] hover:text-[#d97845] transition-colors p-0 flex"
                    tabIndex={-1}
                >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            }
        />
    );
}

// ─── Main Auth Form ────────────────────────────────────────────────────────────
export default function AuthForm({ mode = "signin" }) {
    const isSignUp = mode === "signup";
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setSession } = useAuth();

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        agreed: false,
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

    // ─── Validation ──────────────────────────────────────────────────────────
    const validate = () => {
        const errs = {};
        if (isSignUp) {
            if (!form.fullName.trim())
                errs.fullName = "Full name is required";
            if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
                errs.email = "Valid email is required";
            if (!form.phone.trim() || form.phone.length < 7)
                errs.phone = "Valid phone number is required";
            if (!form.password || form.password.length < 6)
                errs.password = "Password must be at least 6 characters";
            if (!form.agreed)
                errs.agreed = "You must accept the terms";
        } else {
            if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
                errs.email = "Valid email is required";
            if (!form.password || form.password.length < 6)
                errs.password = "Password must be at least 6 characters";
        }
        return errs;
    };

    // ─── Submit ──────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setErrors({});
        setServerError("");
        setLoading(true);

        try {
            if (isSignUp) {
                const result = await signUp({
                    fullName: form.fullName,
                    email: form.email,
                    phone: form.phone,
                    password: form.password,
                });
                if (result?.error) setServerError(result.error);
                else setSuccess(true);
            } else {
                const result = await signIn({
                    email: form.email,
                    password: form.password,
                    next: searchParams.get("next") || "",
                });
                if (result?.error) {
                    setServerError(result.error);
                } else if (result?.redirectTo) {
                    if (result.session) {
                        // Hydrate the browser client BEFORE navigating, so the
                        // destination page's role-gated UI is correct immediately
                        // instead of waiting for a manual refresh to catch up.
                        await setSession(result.session);
                    }
                    router.replace(result.redirectTo);
                }
            }
        } catch {
            setServerError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#fdf8f3] flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-[-80px] right-[-80px] w-[340px] h-[340px] rounded-full bg-[#f5d9c0] opacity-40 blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-60px] left-[-60px] w-[280px] h-[280px] rounded-full bg-[#f0c9a8] opacity-30 blur-3xl pointer-events-none" />

            <div className="w-full max-w-[420px] relative z-10">
                <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(100,55,20,0.12)] border border-[#ede4da] overflow-hidden">

                    {/* Top accent strip */}
                    <div className="h-1 w-full bg-gradient-to-r from-[#d97845] via-[#e8a070] to-[#c86830]" />

                    <div className="px-8 py-8">
                        {/* Logo + heading */}
                        <div className="flex flex-col items-center mb-7">
                            <Logo />
                            <h1 className="text-[22px] font-bold text-[#2c1a0e] m-0 text-center mt-2">
                                {isSignUp ? "Create Account" : "Welcome Back"}
                            </h1>
                            <p className="text-sm text-[#9b8070] mt-1.5 m-0 text-center">
                                {isSignUp
                                    ? "Join TheLook and start shopping"
                                    : "Sign in to your TheLook account"}
                            </p>
                        </div>

                        {/* ── Success State ── */}
                        {success ? (
                            <div className="flex flex-col items-center gap-4 py-6">
                                <div className="w-16 h-16 rounded-full bg-[#d97845] flex items-center justify-center shadow-[0_4px_16px_rgba(217,120,69,0.35)]">
                                    <Check size={30} className="text-white" strokeWidth={3} />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-[#2c1a0e] text-lg mb-1">Account Created!</p>
                                    <p className="text-sm text-[#9b8070]">
                                        Check your email to confirm your account.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* ── Form ── */
                            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

                                {/* Full Name — signup only */}
                                {isSignUp && (
                                    <InputField
                                        label="Full Name"
                                        icon={User}
                                        value={form.fullName}
                                        onChange={set("fullName")}
                                        placeholder="Jane Doe"
                                        error={errors.fullName}
                                    />
                                )}

                                {/* Email — always shown */}
                                <InputField
                                    label="Email Address"
                                    type="email"
                                    icon={Mail}
                                    value={form.email}
                                    onChange={set("email")}
                                    placeholder="you@example.com"
                                    error={errors.email}
                                />

                                {/* Phone — signup only (saved to profile, not auth) */}
                                {isSignUp && (
                                    <InputField
                                        label="Phone Number"
                                        type="tel"
                                        icon={Phone}
                                        value={form.phone}
                                        onChange={set("phone")}
                                        placeholder="+880 1234 567890"
                                        error={errors.phone}
                                    />
                                )}

                                {/* Password */}
                                <PasswordField
                                    label="Password"
                                    value={form.password}
                                    onChange={set("password")}
                                    error={errors.password}
                                />

                                {/* Forgot password — signin only */}
                                {!isSignUp && (
                                    <div className="flex justify-end -mt-1">
                                        <a
                                            href="/forgot-password"
                                            className="text-[12px] text-[#d97845] no-underline font-medium hover:text-[#b8622f] transition-colors"
                                        >
                                            Forgot password?
                                        </a>
                                    </div>
                                )}

                                {/* Terms checkbox — signup only */}
                                {isSignUp && (
                                    <div className="flex flex-col gap-1">
                                        <label className="flex items-start gap-3 cursor-pointer select-none">
                                            <div
                                                onClick={() => setForm((p) => ({ ...p, agreed: !p.agreed }))}
                                                className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${form.agreed
                                                        ? "bg-[#d97845] border-[#d97845]"
                                                        : "bg-white border-[#e0cdc0]"
                                                    }`}
                                            >
                                                {form.agreed && (
                                                    <Check size={12} className="text-white" strokeWidth={3} />
                                                )}
                                            </div>
                                            <span className="text-sm text-[#6b5244] leading-snug">
                                                I agree to the{" "}
                                                <a href="/terms" className="text-[#d97845] no-underline font-medium hover:underline">
                                                    Terms of Service
                                                </a>{" "}
                                                and{" "}
                                                <a href="/privacy" className="text-[#d97845] no-underline font-medium hover:underline">
                                                    Privacy Policy
                                                </a>
                                            </span>
                                        </label>
                                        {errors.agreed && (
                                            <p className="text-red-500 text-[11px] ml-8">{errors.agreed}</p>
                                        )}
                                    </div>
                                )}

                                {/* Server error */}
                                {serverError && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-600 text-sm text-center">
                                        {serverError}
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`mt-1 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-[15px] text-white border-none cursor-pointer transition-all duration-200 ${loading
                                            ? "bg-[#e8a070] cursor-not-allowed"
                                            : "bg-[#d97845] hover:bg-[#b8622f] shadow-[0_4px_14px_rgba(217,120,69,0.38)] hover:shadow-[0_4px_18px_rgba(217,120,69,0.50)] active:scale-[0.98]"
                                        }`}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" />
                                                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            {isSignUp ? "Creating Account…" : "Signing In…"}
                                        </>
                                    ) : (
                                        <>
                                            {isSignUp ? "Create Account" : "Sign In"}
                                            <ArrowRight size={17} />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Card footer */}
                    {!success && (
                        <div className="bg-[#fdf5ee] border-t border-[#ede4da] px-8 py-4 text-center">
                            <p className="text-sm text-[#9b8070] m-0">
                                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                                <button
                                    type="button"
                                    onClick={() => router.push(isSignUp ? "/sign-in" : "/sign-up")}
                                    className="text-[#d97845] font-semibold bg-transparent border-none cursor-pointer hover:text-[#b8622f] transition-colors text-sm p-0"
                                >
                                    {isSignUp ? "Sign In" : "Create Account"}
                                </button>
                            </p>
                        </div>
                    )}
                </div>

                {/* Tagline */}
                <p className="text-center text-[12px] text-[#b8a090] mt-5">
                    Premium fashion, delivered to your door.
                </p>
            </div>
        </div>
    );
}
