import { createClient } from "@/lib/supabase/client";
import type { JobPreferences, JobPreferenceValues } from "@/types/job";
import { getAuthenticatedUserId } from "./user";

export const EMPTY_JOB_PREFERENCES: JobPreferenceValues = {
    preferred_country: "",
    preferred_city: "",
    preferred_category: "",
    preferred_skill_category: "",
    preferred_job_type: "",
    remote_preference: false,
};

export async function getJobPreferences(): Promise<JobPreferenceValues> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId();
    const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

    if (error) {
        throw new Error(`Could not load preferences: ${error.message}`);
    }

    return data
        ? {
              preferred_country: data.preferred_country ?? "",
              preferred_city: data.preferred_city ?? "",
              preferred_category: data.preferred_category ?? "",
              preferred_skill_category: data.preferred_skill_category ?? "",
              preferred_job_type: data.preferred_job_type ?? "",
              remote_preference: data.remote_preference ?? false,
          }
        : EMPTY_JOB_PREFERENCES;
}

export async function saveJobPreferences(
    preferences: JobPreferenceValues
): Promise<void> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId();
    const { data: existing, error: lookupError } = await supabase
        .from("user_preferences")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

    if (lookupError) {
        throw new Error(`Could not check preferences: ${lookupError.message}`);
    }

    const values: JobPreferences = { ...preferences, user_id: userId };
    const { error } = existing
        ? await supabase
              .from("user_preferences")
              .update(values)
              .eq("user_id", userId)
        : await supabase.from("user_preferences").insert(values);

    if (error) {
        throw new Error(`Could not save preferences: ${error.message}`);
    }
}
