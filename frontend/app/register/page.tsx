"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setLoading(true);
        setMessage("");
        setError("");

        const supabase = createClient();

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                },
            },
        });

        if (error) {
            setError(error.message);
        } else {
            setMessage(
                "Account created. Check your email for verification."
            );
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
                        <span className="eyebrow">A better way to find work</span>
                        <h2>Your next opportunity is out there.</h2>
                        <p>
                            Create an account and discover roles that match
                            where you want your career to go.
                        </p>
                    </div>
                    <div className="auth-proof">
                        <span className="eyebrow-dot" />
                        One place to explore more possibilities.
                    </div>
                </aside>

                <section className="auth-form-card" aria-labelledby="register-title">
                    <h1 id="register-title">Create your account</h1>
                    <p className="auth-subtitle">Get started with Job Aggregator.</p>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-field">
                            <label htmlFor="register-name">Name</label>
                            <input
                                id="register-name"
                                type="text"
                                autoComplete="name"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="register-email">Email address</label>
                            <input
                                id="register-email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="register-password">Password</label>
                            <input
                                id="register-password"
                                type="password"
                                autoComplete="new-password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                            />
                        </div>

                        <button className="button-primary" type="submit" disabled={loading}>
                            {loading ? "Creating account..." : "Create account"}
                        </button>
                    </form>

                    {error && <p className="auth-message" role="alert">{error}</p>}
                    {message && <p className="auth-message auth-message--success" role="status">{message}</p>}
                    <p className="auth-switch">
                        Already have an account? <Link href="/login">Sign in</Link>
                    </p>
                </section>
            </div>
        </main>
    );
}