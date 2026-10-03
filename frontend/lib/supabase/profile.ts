import { createClient } from "@/lib/supabase/client";

export async function getProfileName(): Promise<string> {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) {
        throw new Error(`Could not load profile: ${error.message}`);
    }
    if (!data.user) {
        throw new Error("Please sign in to view your profile.");
    }

    const name = data.user.user_metadata?.name;
    return typeof name === "string" ? name : "";
}

export async function updateProfileName(name: string): Promise<void> {
    const normalizedName = name.trim();
    if (!normalizedName) {
        throw new Error("Name cannot be empty.");
    }

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.getUser();
    if (authError) {
        throw new Error(`Could not verify account: ${authError.message}`);
    }
    if (!data.user) {
        throw new Error("Please sign in to update your profile.");
    }

    const { error } = await supabase.auth.updateUser({
        data: { ...data.user.user_metadata, name: normalizedName },
    });

    if (error) {
        throw new Error(`Could not update profile: ${error.message}`);
    }
}
