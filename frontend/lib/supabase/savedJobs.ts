import { createClient } from "@/lib/supabase/client";
import type { Job, SavedJobRecord } from "@/types/job";
import { getAuthenticatedUserId } from "./user";

function toSavedJobRecord(job: Job, userId: string): SavedJobRecord & { user_id: string } {
    return {
        user_id: userId,
        job_id: job.sourceJobId,
        source: job.source,
        source_job_id: job.sourceJobId,
        title: job.title,
        organization: job.organization,
        location: job.location,
        country: job.country,
        category: job.category,
        skill_category: job.skillCategory,
        job_type: job.jobType,
        salary: job.salary,
        description_excerpt: job.descriptionExcerpt,
        posted_at: job.postedAt,
        closing_date: job.closingDate,
        url: job.url,
        saved_at: new Date().toISOString(),
    };
}

export function savedJobToJob(record: SavedJobRecord): Job {
    return {
        id: `${record.source}:${record.source_job_id}`,
        source: record.source,
        sourceJobId: record.source_job_id,
        title: record.title,
        organization: record.organization,
        location: record.location,
        country: record.country,
        category: record.category,
        skillCategory: record.skill_category,
        jobType: record.job_type,
        salary: record.salary,
        descriptionExcerpt: record.description_excerpt,
        postedAt: record.posted_at,
        closingDate: record.closing_date,
        url: record.url,
    };
}

export async function isJobSaved(job: Job): Promise<boolean> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId();
    const { data, error } = await supabase
        .from("saved_jobs")
        .select("job_id")
        .eq("user_id", userId)
        .eq("job_id", job.sourceJobId)
        .maybeSingle();

    if (error) {
        throw new Error(`Could not check saved job: ${error.message}`);
    }

    return Boolean(data);
}

export async function saveJob(job: Job): Promise<void> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId();
    const { data: existing, error: lookupError } = await supabase
        .from("saved_jobs")
        .select("job_id")
        .eq("user_id", userId)
        .eq("job_id", job.sourceJobId)
        .maybeSingle();

    if (lookupError) {
        throw new Error(`Could not check saved job: ${lookupError.message}`);
    }
    if (existing) {
        return;
    }

    const { error } = await supabase
        .from("saved_jobs")
        .insert(toSavedJobRecord(job, userId));

    if (error?.code === "23505") {
        return;
    }
    if (error) {
        throw new Error(`Could not save job: ${error.message}`);
    }
}

export async function unsaveJob(jobId: string): Promise<void> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId();
    const sourceJobId = jobId.includes(":")
        ? jobId.slice(jobId.indexOf(":") + 1)
        : jobId;
    const { error } = await supabase
        .from("saved_jobs")
        .delete()
        .eq("user_id", userId)
        .eq("job_id", sourceJobId);

    if (error) {
        throw new Error(`Could not remove saved job: ${error.message}`);
    }
}

export async function getSavedJobs(): Promise<SavedJobRecord[]> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId();
    const { data, error } = await supabase
        .from("saved_jobs")
        .select("*")
        .eq("user_id", userId)
        .order("saved_at", { ascending: false });

    if (error) {
        throw new Error(`Could not load saved jobs: ${error.message}`);
    }

    return ((data ?? []) as SavedJobRecord[]).map((record) => ({
        ...record,
        job_id: String(record.job_id),
    }));
}
