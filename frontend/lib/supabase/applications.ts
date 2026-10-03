import { createClient } from "@/lib/supabase/client";
import type { ApplicationRecord, ApplicationStatus, Job } from "@/types/job";
import { getAuthenticatedUserId } from "./user";

export async function getApplications(): Promise<ApplicationRecord[]> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId();
    const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

    if (error) {
        throw new Error(`Could not load applications: ${error.message}`);
    }

    return (data ?? []) as ApplicationRecord[];
}

export async function getApplicationForJob(jobId: string): Promise<ApplicationRecord | null> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId();
    const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", userId)
        .eq("job_id", jobId)
        .maybeSingle();

    if (error) {
        throw new Error(`Could not load application: ${error.message}`);
    }

    return (data as ApplicationRecord | null) ?? null;
}

export async function saveApplication(
    job: Job,
    status: ApplicationStatus,
    notes: string
): Promise<void> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId();
    const { data: existing, error: lookupError } = await supabase
        .from("applications")
        .select("status, applied_at")
        .eq("user_id", userId)
        .eq("job_id", job.id)
        .maybeSingle();

    if (lookupError) {
        throw new Error(`Could not check application: ${lookupError.message}`);
    }

    const now = new Date().toISOString();
    const appliedAt =
        existing?.applied_at ??
        (status === "Applied" ? now : null);
    const values = {
        user_id: userId,
        job_id: job.id,
        source: job.source,
        source_job_id: job.sourceJobId,
        title: job.title,
        organization: job.organization,
        location: job.location,
        url: job.url,
        status,
        applied_at: appliedAt,
        updated_at: now,
        notes,
    };

    const { error } = existing
        ? await supabase
              .from("applications")
              .update(values)
              .eq("user_id", userId)
              .eq("job_id", job.id)
        : await supabase.from("applications").insert(values);

    if (error?.code === "23505") {
        const { error: updateError } = await supabase
            .from("applications")
            .update(values)
            .eq("user_id", userId)
            .eq("job_id", job.id);
        if (updateError) {
            throw new Error(`Could not save application: ${updateError.message}`);
        }
        return;
    }
    if (error) {
        throw new Error(`Could not save application: ${error.message}`);
    }
}

export async function updateApplication(
    jobId: string,
    status: ApplicationStatus,
    notes: string
): Promise<void> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId();
    const { data: existing, error: lookupError } = await supabase
        .from("applications")
        .select("applied_at")
        .eq("user_id", userId)
        .eq("job_id", jobId)
        .maybeSingle();

    if (lookupError) {
        throw new Error(`Could not load application: ${lookupError.message}`);
    }
    if (!existing) {
        throw new Error("This application no longer exists.");
    }

    const { error } = await supabase
        .from("applications")
        .update({
            status,
            notes,
            applied_at: existing.applied_at ?? (status === "Applied" ? new Date().toISOString() : null),
            updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("job_id", jobId);

    if (error) {
        throw new Error(`Could not update application: ${error.message}`);
    }
}
