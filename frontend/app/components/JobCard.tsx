"use client";

import Link from "next/link";
import SaveJobButton from "./SaveJobButton";
import type { Job } from "@/types/job";

type JobCardProps = {
    job: Job;
    showSaveAction?: boolean;
};

export default function JobCard({ job, showSaveAction = true }: JobCardProps) {
    return (
        <article className="job-card">
            <div className="job-card-top">
                <div>
                    <Link
                        className="job-title-link"
                        href={`/jobs/${encodeURIComponent(job.id)}`}
                    >
                        {job.title}
                    </Link>
                    <p className="job-company">{job.organization || "Organization not listed"}</p>
                </div>
                {job.salary && (
                    <span className="job-chip job-chip--green">{job.salary}</span>
                )}
            </div>

            <div className="job-card-details" aria-label="Job details">
                {job.location && (
                    <span className="job-chip">{job.location}</span>
                )}
                {job.jobType && (
                    <span className="job-chip">{job.jobType}</span>
                )}
                {job.category && (
                    <span className="job-chip job-chip--blue">{job.category}</span>
                )}
                {job.skillCategory && (
                    <span className="job-chip">{job.skillCategory}</span>
                )}
            </div>

            <div className="job-card-bottom">
                <span className="job-date">
                    {job.postedAt
                        ? `Posted ${new Date(job.postedAt).toLocaleDateString()}`
                        : "Recently posted"}
                </span>
                <div className="job-card-links">
                    <Link
                        className="inline-link"
                        href={`/jobs/${encodeURIComponent(job.id)}`}
                        aria-label={`View details for ${job.title}`}
                    >
                        Details <span aria-hidden="true">→</span>
                    </Link>
                    {job.url && (
                        <a className="job-source-link" href={job.url} target="_blank" rel="noopener noreferrer">
                            Original listing <span aria-hidden="true">↗</span>
                        </a>
                    )}
                </div>
            </div>
            {showSaveAction && (
                <div className="job-card-save">
                    <SaveJobButton job={job} />
                </div>
            )}
        </article>
    );
}