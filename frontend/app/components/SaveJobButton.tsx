"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useSavedJobs } from "@/app/context/SavedJobsContext";
import { saveJob, unsaveJob } from "@/lib/supabase/savedJobs";
import type { Job } from "@/types/job";

export default function SaveJobButton({ job }: { job: Job }) {
    const { user, loading: authLoading } = useAuth();
    const { savedJobIds, loading: savedJobsLoading, error: savedJobsError, setSavedStatus } = useSavedJobs();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const saved = savedJobIds.has(job.id);

    async function toggleSaved() {
        setLoading(true);
        setError("");
        try {
            if (saved) {
                await unsaveJob(job.id);
                setSavedStatus(job.id, false);
            } else {
                await saveJob(job);
                setSavedStatus(job.id, true, job);
            }
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Could not update saved job.");
        } finally {
            setLoading(false);
        }
    }

    if (authLoading || (user && savedJobsLoading)) {
        return <button className="button-secondary" type="button" disabled>Checking account…</button>;
    }

    if (!user) {
        return (
            <Link className="button-secondary" href="/login">
                Sign in to save
            </Link>
        );
    }

    return (
        <div className="save-job-control">
            <button
                className="button-secondary"
                type="button"
                onClick={toggleSaved}
                disabled={loading}
                aria-pressed={saved}
            >
                {loading ? "Saving…" : saved ? "★ Saved · Remove" : "☆ Save job"}
            </button>
            {(error || savedJobsError) && <span className="inline-error" role="status">{error || savedJobsError}</span>}
        </div>
    );
}
