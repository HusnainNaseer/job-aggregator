"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ApplicationCard from "@/app/components/ApplicationCard";
import { useAuth } from "@/app/context/AuthContext";
import { getApplications, updateApplication } from "@/lib/supabase/applications";
import { APPLICATION_STATUSES, type ApplicationRecord, type ApplicationStatus } from "@/types/job";

type Filter = "All" | ApplicationStatus;

export default function ApplicationsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const currentUserId = user?.id;
    const [applications, setApplications] = useState<ApplicationRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState<Filter>("All");
    const [reloadCount, setReloadCount] = useState(0);

    useEffect(() => {
        if (authLoading) return;
        if (!currentUserId) {
            router.replace("/login");
            return;
        }

        let active = true;
        async function load() {
            setError("");
            try {
                const records = await getApplications();
                if (active) setApplications(records);
            } catch (reason) {
                if (active) setError(reason instanceof Error ? reason.message : "Could not load applications.");
            } finally {
                if (active) setLoading(false);
            }
        }
        void load();
        return () => {
            active = false;
        };
    }, [authLoading, currentUserId, reloadCount, router]);

    const filteredApplications = useMemo(
        () => filter === "All" ? applications : applications.filter((item) => item.status === filter),
        [applications, filter]
    );

    async function saveChanges(jobId: string, status: ApplicationStatus, notes: string) {
        await updateApplication(jobId, status, notes);
        setApplications((current) => current.map((item) =>
            item.job_id === jobId
                ? {
                      ...item,
                      status,
                      notes,
                      applied_at: item.applied_at ?? (status === "Applied" ? new Date().toISOString() : null),
                      updated_at: new Date().toISOString(),
                  }
                : item
        ));
    }

    if (authLoading || (!user && loading)) {
        return <main className="page-shell"><div className="skeleton-card" aria-busy="true"><div className="skeleton skeleton-title" /><div className="skeleton skeleton-line" /></div></main>;
    }

    if (!user) {
        return (
            <main className="page-shell">
                <div className="empty-state">
                    <div className="empty-icon" aria-hidden="true">↗</div>
                    <h3>Sign in to view applications</h3>
                    <p>Your application tracker is private to your account.</p>
                    <Link className="button-primary empty-state-action" href="/login">Sign in</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="page-shell">
            <div className="results-heading">
                <div>
                    <span className="eyebrow">Keep your momentum</span>
                    <h1 className="page-title">Applications</h1>
                    <p>Track and update your progress for each role.</p>
                </div>
                {!loading && !error && <span className="result-count">{applications.length} tracked</span>}
            </div>

            <div className="application-filters" role="group" aria-label="Filter applications by status">
                {(["All", ...APPLICATION_STATUSES] as Filter[]).map((status) => (
                    <button
                        className={`filter-pill${filter === status ? " filter-pill--active" : ""}`}
                        type="button"
                        key={status}
                        aria-pressed={filter === status}
                        onClick={() => setFilter(status)}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="application-list" aria-busy="true">{[0, 1].map((item) => <div className="skeleton-card" key={item}><div className="skeleton skeleton-title" /><div className="skeleton skeleton-line" /></div>)}</div>
            ) : error ? (
                <div className="error-state" role="alert">
                    <div className="empty-icon" aria-hidden="true">!</div>
                    <h3>Applications couldn’t be loaded</h3>
                    <p>{error}</p>
                    <button className="button-secondary" type="button" onClick={() => { setLoading(true); setReloadCount((count) => count + 1); }}>Try again</button>
                </div>
            ) : filteredApplications.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon" aria-hidden="true">↗</div>
                    <h3>{applications.length ? `No ${filter.toLowerCase()} applications` : "No tracked applications yet"}</h3>
                    <p>{applications.length ? "Choose another status filter to see more of your tracked roles." : "Open a job and add it to your tracker to follow your progress here."}</p>
                    {!applications.length && <Link className="button-primary empty-state-action" href="/">Explore jobs</Link>}
                </div>
            ) : (
                <div className="application-list">
                    {filteredApplications.map((application) => (
                        <ApplicationCard key={application.job_id} application={application} onSave={saveChanges} />
                    ))}
                </div>
            )}
        </main>
    );
}
