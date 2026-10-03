"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { EMPTY_JOB_PREFERENCES, getJobPreferences, saveJobPreferences } from "@/lib/supabase/preferences";
import { getProfileName, updateProfileName } from "@/lib/supabase/profile";
import type { JobPreferenceValues } from "@/types/job";

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const currentUserId = user?.id;
    const metadataName = user?.user_metadata?.name;
    const fallbackName = typeof metadataName === "string" ? metadataName : "";
    const [name, setName] = useState("");
    const [preferences, setPreferences] = useState<JobPreferenceValues>(EMPTY_JOB_PREFERENCES);
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPreferences, setSavingPreferences] = useState(false);
    const [error, setError] = useState("");
    const [profileMessage, setProfileMessage] = useState("");
    const [preferencesMessage, setPreferencesMessage] = useState("");
    const [reloadCount, setReloadCount] = useState(0);

    useEffect(() => {
        if (authLoading) return;
        if (!currentUserId) {
            router.replace("/login");
            return;
        }

        let active = true;
        async function loadProfile() {
            setError("");
            try {
                const [profileResult, preferencesResult] = await Promise.allSettled([
                    getProfileName(),
                    getJobPreferences(),
                ]);
                if (active) {
                    if (profileResult.status === "fulfilled") {
                        setName(profileResult.value);
                    } else {
                        setName(fallbackName);
                        setError(profileResult.reason instanceof Error ? profileResult.reason.message : "Could not load profile.");
                    }

                    if (preferencesResult.status === "fulfilled") {
                        setPreferences(preferencesResult.value);
                    } else {
                        const message = preferencesResult.reason instanceof Error
                            ? preferencesResult.reason.message
                            : "Could not load preferences.";
                        setError((current) => current ? `${current} Preferences: ${message}` : message);
                    }
                }
            } finally {
                if (active) setLoading(false);
            }
        }
        void loadProfile();
        return () => {
            active = false;
        };
    }, [authLoading, currentUserId, fallbackName, reloadCount, router]);

    function updatePreference<K extends keyof JobPreferenceValues>(
        key: K,
        value: JobPreferenceValues[K]
    ) {
        setPreferences((current) => ({ ...current, [key]: value }));
    }

    async function submitProfile(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSavingProfile(true);
        setError("");
        setProfileMessage("");
        try {
            await updateProfileName(name);
            setProfileMessage("Profile updated.");
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Could not update profile.");
        } finally {
            setSavingProfile(false);
        }
    }

    async function submitPreferences(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSavingPreferences(true);
        setError("");
        setPreferencesMessage("");
        try {
            await saveJobPreferences(preferences);
            setPreferencesMessage("Preferences saved.");
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Could not save preferences.");
        } finally {
            setSavingPreferences(false);
        }
    }

    if (authLoading || (!user && loading)) {
        return <main className="page-shell"><div className="skeleton-card" aria-busy="true"><div className="skeleton skeleton-title" /><div className="skeleton skeleton-line" /></div></main>;
    }

    if (!user) {
        return (
            <main className="page-shell">
                <div className="empty-state">
                    <div className="empty-icon" aria-hidden="true">◉</div>
                    <h3>Sign in to manage your profile</h3>
                    <p>Your profile and preferences are private to your account.</p>
                    <Link className="button-primary empty-state-action" href="/login">Sign in</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="page-shell">
            <div className="results-heading">
                <div>
                    <span className="eyebrow">Account settings</span>
                    <h1 className="page-title">Profile & preferences</h1>
                    <p>Keep your account details and job search preferences up to date.</p>
                </div>
            </div>

            {loading ? (
                <div className="profile-sections" aria-busy="true">
                    {[0, 1].map((item) => <div className="skeleton-card" key={item}><div className="skeleton skeleton-title" /><div className="skeleton skeleton-line" /></div>)}
                </div>
            ) : (
                <>
                    {error && <p className="auth-message" role="alert">{error}</p>}
                    {error && (
                        <button
                            className="button-secondary profile-retry"
                            type="button"
                            onClick={() => {
                                setLoading(true);
                                setReloadCount((count) => count + 1);
                            }}
                        >
                            Retry loading profile data
                        </button>
                    )}
                    <div className="profile-sections">
                        <section className="settings-card" aria-labelledby="profile-details-heading">
                            <div className="settings-card-heading">
                                <span className="settings-icon" aria-hidden="true">◉</span>
                                <div>
                                    <h2 id="profile-details-heading">Profile information</h2>
                                    <p>Update the name associated with your account.</p>
                                </div>
                            </div>
                            <form className="settings-form" onSubmit={submitProfile}>
                                <label className="search-field">
                                    <span>Name</span>
                                    <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
                                </label>
                                <label className="search-field">
                                    <span>Email address</span>
                                    <input value={user.email ?? ""} readOnly aria-describedby="email-account-note" />
                                    <small id="email-account-note">Email is managed by your authentication provider.</small>
                                </label>
                                <button className="button-primary" type="submit" disabled={savingProfile}>
                                    {savingProfile ? "Saving…" : "Save profile"}
                                </button>
                                {profileMessage && <p className="inline-success" role="status">{profileMessage}</p>}
                            </form>
                        </section>

                        <section className="settings-card" aria-labelledby="preferences-heading">
                            <div className="settings-card-heading">
                                <span className="settings-icon" aria-hidden="true">⌕</span>
                                <div>
                                    <h2 id="preferences-heading">Job preferences</h2>
                                    <p>Save the kinds of roles and locations you prefer.</p>
                                </div>
                            </div>
                            <form className="settings-form preferences-form" onSubmit={submitPreferences}>
                                <label className="search-field">
                                    <span>Preferred country</span>
                                    <input value={preferences.preferred_country} onChange={(event) => updatePreference("preferred_country", event.target.value)} placeholder="e.g. United States" />
                                </label>
                                <label className="search-field">
                                    <span>Preferred city</span>
                                    <input value={preferences.preferred_city} onChange={(event) => updatePreference("preferred_city", event.target.value)} placeholder="e.g. Austin" />
                                </label>
                                <label className="search-field">
                                    <span>Preferred category</span>
                                    <input value={preferences.preferred_category} onChange={(event) => updatePreference("preferred_category", event.target.value)} placeholder="e.g. Technology" />
                                </label>
                                <label className="search-field">
                                    <span>Preferred skill category</span>
                                    <input value={preferences.preferred_skill_category} onChange={(event) => updatePreference("preferred_skill_category", event.target.value)} placeholder="e.g. Product design" />
                                </label>
                                <label className="search-field">
                                    <span>Preferred job type</span>
                                    <input value={preferences.preferred_job_type} onChange={(event) => updatePreference("preferred_job_type", event.target.value)} placeholder="e.g. Full-time" />
                                </label>
                                <label className="preference-checkbox">
                                    <input type="checkbox" checked={preferences.remote_preference} onChange={(event) => updatePreference("remote_preference", event.target.checked)} />
                                    <span>Prefer remote opportunities</span>
                                </label>
                                <button className="button-primary" type="submit" disabled={savingPreferences}>
                                    {savingPreferences ? "Saving…" : "Save preferences"}
                                </button>
                                {preferencesMessage && <p className="inline-success" role="status">{preferencesMessage}</p>}
                            </form>
                        </section>
                    </div>
                </>
            )}
        </main>
    );
}
