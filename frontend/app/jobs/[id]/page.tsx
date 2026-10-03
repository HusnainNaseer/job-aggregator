"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ApplicationManager from "@/app/components/ApplicationManager";
import SaveJobButton from "@/app/components/SaveJobButton";
import type { Job } from "@/types/job";

export default function JobDetailsPage() {
    const params = useParams<{ id: string }>();
    const jobId = params.id;
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        async function loadJob() {
            setLoading(true);
            setError("");
            try {
                const decodedJobId = decodeURIComponent(jobId);
                const response = await fetch(`/api/jobs/${encodeURIComponent(decodedJobId)}`, {
                    cache: "no-store",
                });
                if (!response.ok) {
                    const message = await response.json().catch(() => null);
                    throw new Error(message?.message ?? "Unable to load this job.");
                }
                const data: Job = await response.json();
                if (active) {
                    setJob(data);
                }
            } catch (reason) {
                if (active) {
                    setError(reason instanceof Error ? reason.message : "Unable to load this job.");
                    setJob(null);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        void loadJob();
        return () => {
            active = false;
        };
    }, [jobId]);

    if (loading) {
        return (
            <main className="page-shell" aria-label="Loading job details" aria-busy="true">
                <div className="skeleton-card">
                    <div className="skeleton skeleton-title" />
                    <div className="skeleton skeleton-line" />
                    <div className="skeleton-chips">
                        <div className="skeleton skeleton-chip" />
                        <div className="skeleton skeleton-chip" />
                    </div>
                </div>
            </main>
        );
    }

    if (!job) {
        return (
            <main className="page-shell">
                <Link className="back-link" href="/">
                    <span aria-hidden="true">←</span>&nbsp; Back to jobs
                </Link>
                <div className="empty-state">
                    <div className="empty-icon" aria-hidden="true">⌕</div>
                    <h3>Job details are unavailable</h3>
                    <p>
                        {error || "This role may no longer be available."} Return to the listings to explore more jobs.
                    </p>
                    <Link className="button-primary" href="/">
                        Browse jobs
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="page-shell">
            <Link className="back-link" href="/">
                <span aria-hidden="true">←</span>&nbsp; Back to jobs
            </Link>

            <div className="detail-grid">
                <article className="detail-main">
                    <span className="detail-kicker">Opportunity</span>
                    <h1>{job.title}</h1>
                    <p className="detail-company">
                        {job.organization || "Organization not listed"}
                    </p>
                    <div className="detail-meta">
                        {job.location && <span className="job-chip">{job.location}</span>}
                        {job.jobType && <span className="job-chip">{job.jobType}</span>}
                        {job.category && <span className="job-chip job-chip--blue">{job.category}</span>}
                        {job.skillCategory && <span className="job-chip">{job.skillCategory}</span>}
                    </div>

                    <hr className="detail-divider" />

                    <section className="detail-section" aria-labelledby="job-overview">
                        <h2 id="job-overview">Role overview</h2>
                        <div className="detail-facts">
                            <div className="detail-fact">
                                <span>Location</span>
                                <strong>{job.location || "Not specified"}</strong>
                            </div>
                            <div className="detail-fact">
                                <span>Job type</span>
                                <strong>{job.jobType || "Not specified"}</strong>
                            </div>
                            <div className="detail-fact">
                                <span>Category</span>
                                <strong>{job.category || "Not specified"}</strong>
                            </div>
                            <div className="detail-fact">
                                <span>Skill category</span>
                                <strong>{job.skillCategory || "Not specified"}</strong>
                            </div>
                            {job.salary && (
                                <div className="detail-fact">
                                    <span>Salary</span>
                                    <strong>{job.salary}</strong>
                                </div>
                            )}
                            {job.postedAt && (
                                <div className="detail-fact">
                                    <span>Posted</span>
                                    <strong>{new Date(job.postedAt).toLocaleDateString()}</strong>
                                </div>
                            )}
                            {job.closingDate && (
                                <div className="detail-fact">
                                    <span>Closing date</span>
                                    <strong>{new Date(job.closingDate).toLocaleDateString()}</strong>
                                </div>
                            )}
                        </div>
                    </section>

                    <hr className="detail-divider" />

                    <section className="detail-section" aria-labelledby="job-description">
                        <h2 id="job-description">About this role</h2>
                        <p className="detail-description">
                            {job.descriptionExcerpt || "No description is available for this role."}
                        </p>
                    </section>
                </article>

                <aside className="detail-action-card" aria-label="Application actions">
                    <h2>Interested in this role?</h2>
                    <p>Continue to the original listing for full details and application instructions.</p>
                    <div className="detail-save-action">
                        <SaveJobButton job={job} />
                    </div>
                    <a
                        className="button-primary"
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Apply / View original job <span aria-hidden="true">&nbsp;↗</span>
                    </a>
                    <ApplicationManager job={job} />
                </aside>
            </div>
        </main>
    );
}