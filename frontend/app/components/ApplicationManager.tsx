"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { getApplicationForJob, saveApplication } from "@/lib/supabase/applications";
import { APPLICATION_STATUSES, type ApplicationRecord, type ApplicationStatus, type Job } from "@/types/job";
import ApplicationStatusBadge from "./ApplicationStatusBadge";

export default function ApplicationManager({ job }: { job: Job }) {
    const { user, loading: authLoading } = useAuth();
    const currentUserId = user?.id;
    const [application, setApplication] = useState<ApplicationRecord | null>(null);
    const [status, setStatus] = useState<ApplicationStatus>("Applied");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    useEffect(() => {
        let active = true;

        async function loadApplication() {
            if (authLoading || !currentUserId) {
                return;
            }
            setLoading(true);
            setError("");
            try {
                const result = await getApplicationForJob(job.id);
                if (active) {
                    setApplication(result);
                    if (result) {
                        setStatus(result.status);
                        setNotes(result.notes ?? "");
                    }
                }
            } catch (reason) {
                if (active) {
                    setError(reason instanceof Error ? reason.message : "Could not load application.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        void loadApplication();
        return () => {
            active = false;
        };
    }, [authLoading, currentUserId, job.id]);

    async function handleSave(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        setError("");
        setNotice("");
        try {
            await saveApplication(job, status, notes.trim());
            setApplication({
                job_id: job.id,
                source: job.source,
                source_job_id: job.sourceJobId,
                title: job.title,
                organization: job.organization,
                location: job.location,
                url: job.url,
                status,
                applied_at:
                    application?.applied_at ??
                    (status === "Applied" ? new Date().toISOString() : null),
                updated_at: new Date().toISOString(),
                notes: notes.trim(),
            });
            setNotice("Application tracker updated.");
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Could not save application.");
        } finally {
            setSaving(false);
        }
    }

    if (authLoading) {
        return <div className="application-manager-note">Checking your account…</div>;
    }
    if (!user) {
        return (
            <div className="application-manager-note">
                <p>Sign in to track your progress with this role.</p>
                <Link className="button-secondary" href="/login">Sign in</Link>
            </div>
        );
    }
    if (loading) {
        return <div className="application-manager-note" aria-busy="true">Loading your tracker…</div>;
    }

    return (
        <section className="application-manager" aria-labelledby="application-manager-title">
            <div className="application-manager-heading">
                <div>
                    <h3 id="application-manager-title">Application tracker</h3>
                    <p>{application ? "Update your progress and notes." : "Keep your progress for this role in one place."}</p>
                </div>
                {application && <ApplicationStatusBadge status={application.status} />}
            </div>
            <form className="application-manager-form" onSubmit={handleSave}>
                <label className="search-field">
                    <span>Current status</span>
                    <select value={status} onChange={(event) => setStatus(event.target.value as ApplicationStatus)}>
                        {APPLICATION_STATUSES.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </label>
                <label className="search-field">
                    <span>Private notes</span>
                    <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        placeholder="Add a reminder or note about this role"
                        rows={3}
                    />
                </label>
                <button className="button-primary" type="submit" disabled={saving}>
                    {saving ? "Saving…" : application ? "Update tracker" : "Add to tracker"}
                </button>
            </form>
            {error && <p className="inline-error" role="alert">{error}</p>}
            {notice && <p className="inline-success" role="status">{notice}</p>}
        </section>
    );
}
