"use client";

import Link from "next/link";
import { useState } from "react";
import { APPLICATION_STATUSES, type ApplicationRecord, type ApplicationStatus } from "@/types/job";
import ApplicationStatusBadge from "./ApplicationStatusBadge";

type Props = {
    application: ApplicationRecord;
    onSave: (jobId: string, status: ApplicationStatus, notes: string) => Promise<void>;
};

export default function ApplicationCard({ application, onSave }: Props) {
    const [status, setStatus] = useState(application.status);
    const [notes, setNotes] = useState(application.notes ?? "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        setError("");
        setSaved(false);
        try {
            await onSave(application.job_id, status, notes.trim());
            setSaved(true);
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Could not update this application.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <article className="application-card">
            <div className="application-card-heading">
                <div>
                    <Link className="job-title-link" href={`/jobs/${encodeURIComponent(application.job_id)}`}>
                        {application.title}
                    </Link>
                    <p className="job-company">
                        {[application.organization, application.location].filter(Boolean).join(" · ") || "Organization not listed"}
                    </p>
                </div>
                <ApplicationStatusBadge status={application.status} />
            </div>
            <div className="application-dates">
                <span>Applied: {application.applied_at ? new Date(application.applied_at).toLocaleDateString() : "Not marked applied"}</span>
                <span>Updated: {application.updated_at ? new Date(application.updated_at).toLocaleDateString() : "—"}</span>
            </div>
            <form className="application-edit-form" onSubmit={handleSubmit}>
                <label className="search-field">
                    <span>Status</span>
                    <select value={status} onChange={(event) => setStatus(event.target.value as ApplicationStatus)}>
                        {APPLICATION_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                </label>
                <label className="search-field">
                    <span>Notes</span>
                    <textarea rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add a private note" />
                </label>
                <div className="application-card-actions">
                    <button className="button-secondary" type="submit" disabled={saving}>
                        {saving ? "Saving…" : "Save changes"}
                    </button>
                    {application.url && (
                        <a className="inline-link" href={application.url} target="_blank" rel="noopener noreferrer">
                            Original listing ↗
                        </a>
                    )}
                </div>
            </form>
            {error && <p className="inline-error" role="alert">{error}</p>}
            {saved && <p className="inline-success" role="status">Application updated.</p>}
        </article>
    );
}
