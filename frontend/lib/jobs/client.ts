import { deduplicateJobs, normalizeJobs } from "./normalize";
import type { Job } from "@/types/job";

type JobsPage = {
    jobs: Job[];
    pagination: {
        page: number;
        limit: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
};

type RawJobsPage = {
    jobs: unknown[];
    pagination: JobsPage["pagination"];
};

export async function fetchJobListings(params: URLSearchParams): Promise<JobsPage> {
    const response = await fetch(`/api/jobs?${params.toString()}`);
    if (!response.ok) {
        throw new Error("Failed to fetch jobs");
    }

    const data: RawJobsPage = await response.json();
    return {
        ...data,
        jobs: deduplicateJobs(normalizeJobs("dev-global-jobs", data.jobs)),
    };
}
