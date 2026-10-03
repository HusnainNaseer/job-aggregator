"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { useAuth } from "./AuthContext";
import { getSavedJobs } from "@/lib/supabase/savedJobs";
import type { Job, SavedJobRecord } from "@/types/job";

type SavedJobsContextValue = {
    savedJobs: SavedJobRecord[];
    savedJobIds: ReadonlySet<string>;
    loading: boolean;
    error: string;
    setSavedStatus: (jobId: string, saved: boolean, job?: Job) => void;
    refreshSavedJobs: () => void;
};

const SavedJobsContext = createContext<SavedJobsContextValue>({
    savedJobs: [],
    savedJobIds: new Set(),
    loading: true,
    error: "",
    setSavedStatus: () => {},
    refreshSavedJobs: () => {},
});

export function SavedJobsProvider({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const currentUserId = user?.id;
    const [savedJobs, setSavedJobs] = useState<SavedJobRecord[]>([]);
    const [savedJobsUserId, setSavedJobsUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [errorUserId, setErrorUserId] = useState<string | null>(null);
    const [refreshCount, setRefreshCount] = useState(0);

    useEffect(() => {
        if (authLoading || !currentUserId) return;
        const authenticatedUserId = currentUserId;
        let active = true;

        async function loadSavedJobs() {
            setLoading(true);
            setError("");
            setErrorUserId(null);
            try {
                const records = await getSavedJobs();
                if (active) {
                    setSavedJobs(records);
                    setSavedJobsUserId(authenticatedUserId);
                }
            } catch (reason) {
                if (active) {
                    setError(reason instanceof Error ? reason.message : "Could not load saved jobs.");
                    setErrorUserId(authenticatedUserId);
                }
            } finally {
                if (active) setLoading(false);
            }
        }

        void loadSavedJobs();
        return () => {
            active = false;
        };
    }, [authLoading, currentUserId, refreshCount]);

    const setSavedStatus = useCallback((jobId: string, saved: boolean, job?: Job) => {
        if (currentUserId) {
            setSavedJobsUserId(currentUserId);
            setError("");
            setErrorUserId(null);
        }
        setSavedJobs((current) => {
            const ownedRecords = savedJobsUserId === currentUserId ? current : [];
            if (!saved) {
                return ownedRecords.filter(
                    (record) => `${record.source}:${record.source_job_id}` !== jobId
                );
            }
            if (
                ownedRecords.some(
                    (record) => `${record.source}:${record.source_job_id}` === jobId
                ) ||
                !job
            ) {
                return ownedRecords;
            }
            return [{
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
            }, ...ownedRecords];
        });
    }, [currentUserId, savedJobsUserId]);

    const refreshSavedJobs = useCallback(() => {
        setRefreshCount((current) => current + 1);
    }, []);
    const visibleSavedJobs = user && savedJobsUserId === user.id ? savedJobs : [];
    const visibleError = user && errorUserId === user.id ? error : "";

    return (
        <SavedJobsContext.Provider
            value={{
                savedJobs: visibleSavedJobs,
                savedJobIds: new Set(
                    visibleSavedJobs.map((record) => `${record.source}:${record.source_job_id}`)
                ),
                loading: authLoading || Boolean(user && (
                    loading ||
                    (savedJobsUserId !== user.id && errorUserId !== user.id)
                )),
                error: visibleError,
                setSavedStatus,
                refreshSavedJobs,
            }}
        >
            {children}
        </SavedJobsContext.Provider>
    );
}

export function useSavedJobs() {
    return useContext(SavedJobsContext);
}
