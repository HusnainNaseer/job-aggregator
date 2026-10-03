export type JobSource = "dev-global-jobs" | "partner";

export type Job = {
    id: string;
    source: JobSource;
    sourceJobId: string;
    title: string;
    organization: string;
    location: string;
    country: string | null;
    category: string;
    skillCategory: string;
    jobType: string;
    salary: string | null;
    descriptionExcerpt: string;
    postedAt: string | null;
    closingDate: string | null;
    url: string;
};

export type ApplicationStatus =
    | "Saved"
    | "Applied"
    | "Interview"
    | "Rejected"
    | "Offer";

export const APPLICATION_STATUSES: ApplicationStatus[] = [
    "Saved",
    "Applied",
    "Interview",
    "Rejected",
    "Offer",
];

export type ApplicationRecord = {
    id?: string;
    job_id: string;
    source: JobSource;
    source_job_id: string;
    title: string;
    organization: string;
    location: string;
    url: string;
    status: ApplicationStatus;
    applied_at: string | null;
    updated_at: string;
    notes: string;
};

export type SavedJobRecord = {
    job_id: string;
    source: JobSource;
    source_job_id: string;
    title: string;
    organization: string;
    location: string;
    country: string | null;
    category: string;
    skill_category: string;
    job_type: string;
    salary: string | null;
    description_excerpt: string;
    posted_at: string | null;
    closing_date: string | null;
    url: string;
    saved_at: string;
};

export type JobPreferenceValues = {
    preferred_country: string;
    preferred_city: string;
    preferred_category: string;
    preferred_skill_category: string;
    preferred_job_type: string;
    remote_preference: boolean;
};

export type JobPreferences = JobPreferenceValues & {
    user_id: string;
};
