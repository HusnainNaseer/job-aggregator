import { createClient } from "@/lib/supabase/client";

export async function getAuthenticatedUserId(): Promise<string> {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
        throw new Error(`Unable to verify your account: ${error.message}`);
    }
    if (!data.user) {
        throw new Error("Please sign in to continue.");
    }

    return data.user.id;
}
