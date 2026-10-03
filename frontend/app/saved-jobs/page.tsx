"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import JobCard from "@/app/components/JobCard";
import { useAuth } from "@/app/context/AuthContext";
import { useSavedJobs } from "@/app/context/SavedJobsContext";
import { savedJobToJob, unsaveJob } from "@/lib/supabase/savedJobs";

export default function SavedJobsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const currentUserId = user?.id;
    const {
        savedJobs: records,
        loading: savedJobsLoading,
        error,
        setSavedStatus,
        refreshSavedJobs,
    } = useSavedJobs();
    const [removeError, setRemoveError] = useState("");

    useEffect(() => {
        if (authLoading || currentUserId) return;
        if (!currentUserId) {
            router.replace("/login");
        }
    }, [authLoading, currentUserId, router]);

    async function remove(jobId: string) {
        setRemoveError("");
        try {
            await unsaveJob(jobId);
            setSavedStatus(jobId, false);
        } catch (reason) {
            setRemoveError(reason instanceof Error ? reason.message : "Could not remove this job.");
        }
    }

    if (authLoading || savedJobsLoading || (!user && !error)) {
        return <main className="page-shell"><div className="skeleton-card" aria-busy="true"><div className="skeleton skeleton-title" /><div className="skeleton skeleton-line" /></div></main>;
    }

    if (!user) {
        return (
            <main className="page-shell">
                <div className="empty-state">
                    <div className="empty-icon" aria-hidden="true">☆</div>
                    <h3>Sign in to view saved jobs</h3>
                    <p>Saved roles are private to your account.</p>
                    <Link className="button-primary empty-state-action" href="/login">Sign in</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="page-shell">
            <div className="results-heading">
                <div>
                    <span className="eyebrow">Your shortlist</span>
                    <h1 className="page-title">Saved jobs</h1>
                    <p>Roles you saved to revisit later.</p>
                </div>
                {!savedJobsLoading && !error && <span className="result-count">{records.length} saved</span>}
            </div>
            {error ? (
                <div className="error-state" role="alert">
                    <div className="empty-icon" aria-hidden="true">!</div>
                    <h3>Saved jobs couldn’t be loaded</h3>
                    <p>{error}</p>
                    <button className="button-secondary" type="button" onClick={refreshSavedJobs}>Try again</button>
                </div>
            ) : records.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon" aria-hidden="true">☆</div>
                    <h3>Your shortlist is empty</h3>
                    <p>Save a job that interests you and it will be ready here when you come back.</p>
                    <Link className="button-primary empty-state-action" href="/">Explore jobs</Link>
                </div>
            ) : (
                <div className="job-list">
                    {records.map((record) => (
                        <div className="saved-job-row" key={`${record.source}:${record.source_job_id}`}>
                            <JobCard job={savedJobToJob(record)} showSaveAction={false} />
                            <button className="saved-job-remove" type="button" onClick={() => void remove(`${record.source}:${record.source_job_id}`)} aria-label={`Remove ${record.title} from saved jobs`}>
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {removeError && <p className="auth-message" role="alert">{removeError}</p>}
        </main>
    );
}
