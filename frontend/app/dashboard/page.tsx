"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ApplicationStatusBadge from "@/app/components/ApplicationStatusBadge";
import { useAuth } from "@/app/context/AuthContext";
import { useSavedJobs } from "@/app/context/SavedJobsContext";
import { getApplications } from "@/lib/supabase/applications";
import type { ApplicationRecord } from "@/types/job";

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const currentUserId = user?.id;
    const {
        savedJobs,
        loading: savedJobsLoading,
        error: savedJobsError,
        refreshSavedJobs,
    } = useSavedJobs();
    const [applications, setApplications] = useState<ApplicationRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadCount, setReloadCount] = useState(0);

    useEffect(() => {
        if (authLoading || savedJobsLoading) {
            return;
        }
        if (!currentUserId) {
            router.replace("/login");
            return;
        }

        let active = true;
        async function loadDashboard() {
            setError("");
            try {
                if (savedJobsError) throw new Error(savedJobsError);
                const tracked = await getApplications();
                if (active) {
                    setApplications(tracked);
                }
            } catch (reason) {
                if (active) {
                    setError(reason instanceof Error ? reason.message : "Could not load your dashboard.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }
        void loadDashboard();
        return () => {
            active = false;
        };
    }, [authLoading, currentUserId, reloadCount, router, savedJobsError, savedJobsLoading]);

    if (authLoading || savedJobsLoading || (!user && !error)) {
        return (
            <main className="page-shell" aria-busy="true" aria-label="Loading dashboard">
                <div className="skeleton-card">
                    <div className="skeleton skeleton-title" />
                    <div className="skeleton skeleton-line" />
                </div>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="page-shell">
                <div className="empty-state">
                    <div className="empty-icon" aria-hidden="true">↗</div>
                    <h3>Sign in to view your dashboard</h3>
                    <Link className="button-primary empty-state-action" href="/login">Sign in</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="page-shell">
            <section className="dashboard-welcome">
                <span className="eyebrow"><span className="eyebrow-dot" />Your career space</span>
                <h1>Welcome{typeof user.user_metadata?.name === "string" ? `, ${user.user_metadata.name}` : ""}</h1>
                <p>Your job search at a glance.</p>
                {user.email && <span className="dashboard-email">{user.email}</span>}
            </section>

            {error ? (
                <div className="error-state dashboard-error" role="alert">
                    <div className="empty-icon" aria-hidden="true">!</div>
                    <h3>We couldn’t load your dashboard</h3>
                    <p>{error}</p>
                    <button className="button-secondary" type="button" onClick={() => { setLoading(true); refreshSavedJobs(); setReloadCount((count) => count + 1); }}>Try again</button>
                </div>
            ) : (
                <>
                    <section className="dashboard-stats" aria-label="Account overview">
                        <article className="dashboard-card">
                            <span className="dashboard-card-label">Saved jobs</span>
                            <strong className="dashboard-card-value">{loading || savedJobsLoading ? "—" : savedJobs.length}</strong>
                            <Link className="dashboard-card-link" href="/saved-jobs">View saved jobs →</Link>
                        </article>
                        <article className="dashboard-card">
                            <span className="dashboard-card-label">Tracked applications</span>
                            <strong className="dashboard-card-value">{loading ? "—" : applications.length}</strong>
                            <Link className="dashboard-card-link" href="/applications">View applications →</Link>
                        </article>
                        <article className="dashboard-card">
                            <span className="dashboard-card-label">Account</span>
                            <strong className="dashboard-card-value dashboard-card-value--small">Active</strong>
                            <Link className="dashboard-card-link" href="/profile">Manage profile →</Link>
                        </article>
                    </section>

                    <section aria-labelledby="recent-saved-heading">
                        <div className="dashboard-section-heading">
                            <h2 className="dashboard-section-title" id="recent-saved-heading">Recently saved</h2>
                            <Link className="inline-link" href="/saved-jobs">See all →</Link>
                        </div>
                        {loading || savedJobsLoading ? (
                            <div className="skeleton-card"><div className="skeleton skeleton-title" /><div className="skeleton skeleton-line" /></div>
                        ) : savedJobs.length ? (
                            <div className="job-list">
                                {savedJobs.slice(0, 3).map((record) => (
                                    <article className="job-card dashboard-recent-job" key={record.job_id}>
                                        <div>
                                            <Link className="job-title-link" href={`/jobs/${encodeURIComponent(record.job_id)}`}>{record.title}</Link>
                                            <p className="job-company">{[record.organization, record.location].filter(Boolean).join(" · ")}</p>
                                        </div>
                                        <span className="job-date">Saved {new Date(record.saved_at).toLocaleDateString()}</span>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="dashboard-placeholder">
                                <div className="empty-icon" aria-hidden="true">☆</div>
                                <h3>No saved jobs yet</h3>
                                <p>Save roles you want to come back to and they’ll appear here.</p>
                                <Link className="inline-link" href="/">Explore jobs →</Link>
                            </div>
                        )}
                    </section>

                    <section aria-labelledby="recent-applications-heading">
                        <div className="dashboard-section-heading">
                            <h2 className="dashboard-section-title" id="recent-applications-heading">Recent applications</h2>
                            <Link className="inline-link" href="/applications">See all →</Link>
                        </div>
                        {loading ? (
                            <div className="skeleton-card"><div className="skeleton skeleton-title" /><div className="skeleton skeleton-line" /></div>
                        ) : applications.length ? (
                            <div className="dashboard-recent-applications">
                                {applications.slice(0, 3).map((application) => (
                                    <article className="dashboard-recent-application" key={application.job_id}>
                                        <div>
                                            <Link className="job-title-link" href={`/jobs/${encodeURIComponent(application.job_id)}`}>{application.title}</Link>
                                            <p className="job-company">{application.organization || "Organization not listed"}</p>
                                        </div>
                                        <ApplicationStatusBadge status={application.status} />
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="dashboard-placeholder">
                                <div className="empty-icon" aria-hidden="true">↗</div>
                                <h3>No tracked applications</h3>
                                <p>Track a role from its details page to keep your progress here.</p>
                                <Link className="inline-link" href="/">Explore jobs →</Link>
                            </div>
                        )}
                    </section>
                </>
            )}
        </main>
    );
}
