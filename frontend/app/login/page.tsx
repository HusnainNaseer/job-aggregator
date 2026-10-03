"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setLoading(true);
        setError("");

        const supabase = createClient();

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            router.push("/");
        }

        setLoading(false);
    }

    return (
        <main className="page-shell">
            <div className="auth-layout">
                <aside className="auth-aside">
                    <Link className="brand" href="/">
                        <span className="brand-mark" aria-hidden="true">J</span>
                        <span>Job Aggregator</span>
                    </Link>
                    <div className="auth-aside-copy">
                        <span className="eyebrow">Make your next move</span>
                        <h2>Good opportunities start with a search.</h2>
                        <p>
                            Sign in to pick up where you left off and keep
                            exploring roles from across the web.
                        </p>
                    </div>
                    <div className="auth-proof">
                        <span className="eyebrow-dot" />
                        Your next chapter is closer than you think.
                    </div>
                </aside>

                <section className="auth-form-card" aria-labelledby="login-title">
                    <h1 id="login-title">Welcome back</h1>
                    <p className="auth-subtitle">Sign in to your Job Aggregator account.</p>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-field">
                            <label htmlFor="login-email">Email address</label>
                            <input
                                id="login-email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="login-password">Password</label>
                            <input
                                id="login-password"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                            />
                        </div>

                        <button className="button-primary" type="submit" disabled={loading}>
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    {error && <p className="auth-message" role="alert">{error}</p>}
                    <p className="auth-switch">
                        New here? <Link href="/register">Create an account</Link>
                    </p>
                </section>
            </div>
        </main>
    );
}