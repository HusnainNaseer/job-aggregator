"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/app/context/AuthContext";

export default function Navbar() {
    const { user } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        setMenuOpen(false);
    }

    return (
        <header className="site-header">
            <nav className="navbar" aria-label="Main navigation">
                <Link className="brand" href="/" onClick={() => setMenuOpen(false)}>
                    <span className="brand-mark" aria-hidden="true">J</span>
                    <span>Job Aggregator</span>
                </Link>

                <button
                    className="mobile-menu-toggle"
                    type="button"
                    aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={menuOpen}
                    aria-controls="primary-navigation"
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
                </button>

                <div
                    className={`nav-links${menuOpen ? " nav-links--open" : ""}`}
                    id="primary-navigation"
                >
                    <Link className="nav-link" href="/" onClick={() => setMenuOpen(false)}>
                        Jobs
                    </Link>
                    {user ? (
                    <>
                        <Link className="nav-link" href="/dashboard" onClick={() => setMenuOpen(false)}>
                            Dashboard
                        </Link>
                        <Link className="nav-link" href="/saved-jobs" onClick={() => setMenuOpen(false)}>
                            Saved jobs
                        </Link>
                        <Link className="nav-link" href="/applications" onClick={() => setMenuOpen(false)}>
                            Applications
                        </Link>
                        <Link className="nav-link" href="/profile" onClick={() => setMenuOpen(false)}>
                            Profile
                        </Link>
                        <span className="nav-user">{user.email}</span>
                        <button className="nav-action" type="button" onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link className="nav-link" href="/login" onClick={() => setMenuOpen(false)}>
                            Login
                        </Link>
                        <Link className="nav-link nav-link--primary" href="/register" onClick={() => setMenuOpen(false)}>
                            Register
                        </Link>
                    </>
                )}
                </div>
            </nav>
        </header>
    );
}