import type { Job, JobSource } from "@/types/job";

type ExternalJob = Record<string, unknown>;

function text(value: unknown): string {
    return typeof value === "string" || typeof value === "number"
        ? String(value).trim()
        : "";
}

function nullableText(value: unknown): string | null {
    const normalized = text(value);
    return normalized || null;
}

function descriptionText(value: unknown): string {
    return text(value)
        .replace(/&lt;[^&]{0,200}?&gt;/gi, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/&amp;nbsp;/gi, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&quot;/gi, "\"")
        .replace(/&#(?:39|x27);/gi, "'")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&amp;/gi, "&")
        .replace(/\s+/g, " ")
        .trim();
}

function normalizedJob(source: JobSource, sourceJobId: string, record: ExternalJob): Job {
    return {
        id: `${source}:${sourceJobId}`,
        source,
        sourceJobId,
        title: text(record.title ?? record.job_title) || "Untitled role",
        organization: text(record.organization ?? record.company ?? record.company_name),
        location: text(record.location ?? record.city),
        country: nullableText(record.country ?? record.country_code),
        category: text(record.category ?? record.job_category),
        skillCategory: text(record.skillCategory ?? record.skill_category),
        jobType: text(record.jobType ?? record.job_type ?? record.employment_type),
        salary: nullableText(record.salary ?? record.salary_text),
        descriptionExcerpt: descriptionText(
            record.descriptionExcerpt ??
                record.description_excerpt ??
                record.description
        ),
        postedAt: nullableText(record.postedAt ?? record.posted_at),
        closingDate: nullableText(record.closingDate ?? record.closing_date),
        url: text(record.url ?? record.job_url),
    };
}

export function normalizeDevGlobalJob(record: ExternalJob): Job {
    const sourceJobId = text(record.id);
    if (!sourceJobId) {
        throw new Error("Dev Global Jobs returned a job without an ID");
    }

    return normalizedJob("dev-global-jobs", sourceJobId, record);
}

export function normalizePartnerJob(record: ExternalJob): Job {
    const sourceJobId = text(record.id ?? record.job_id ?? record.reference);
    if (!sourceJobId) {
        throw new Error("The partner job source returned a job without an ID");
    }

    return normalizedJob("partner", sourceJobId, record);
}

export function normalizeJob(source: JobSource, record: ExternalJob): Job {
    return source === "dev-global-jobs"
        ? normalizeDevGlobalJob(record)
        : normalizePartnerJob(record);
}

export function normalizeJobs(source: JobSource, records: unknown[]): Job[] {
    return records.map((record) => {
        if (!record || typeof record !== "object" || Array.isArray(record)) {
            throw new Error("The jobs service returned an invalid job.");
        }
        return normalizeJob(source, record as ExternalJob);
    });
}

function canonicalUrl(url: string): string {
    try {
        const parsed = new URL(url);
        parsed.hash = "";
        parsed.search = "";
        return parsed.toString().replace(/\/+$/, "").toLowerCase();
    } catch {
        return url.trim().replace(/\/+$/, "").toLowerCase();
    }
}

function canonicalText(value: string): string {
    return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function deduplicateJobs(jobs: Job[]): Job[] {
    const result: Job[] = [];
    const seenSourceIds = new Set<string>();

    for (const job of jobs) {
        const sourceKey = `${job.source}:${job.sourceJobId}`;
        if (seenSourceIds.has(sourceKey)) {
            continue;
        }
        seenSourceIds.add(sourceKey);

        // Only merge confident cross-source matches; similar listings from one
        // source can be separate openings and are intentionally retained.
        const duplicateFromOtherSource = result.some((existing) => {
            if (existing.source === job.source) {
                return false;
            }

            const sameUrl =
                existing.url &&
                job.url &&
                canonicalUrl(existing.url) === canonicalUrl(job.url);
            const sameListingDetails =
                Boolean(existing.organization && job.organization && existing.location && job.location) &&
                canonicalText(existing.title) === canonicalText(job.title) &&
                canonicalText(existing.organization) === canonicalText(job.organization) &&
                canonicalText(existing.location) === canonicalText(job.location);

            return Boolean(sameUrl || sameListingDetails);
        });

        if (!duplicateFromOtherSource) {
            result.push(job);
        }
    }

    return result;
}

export function parseJobId(value: string): {
    source: JobSource;
    sourceJobId: string;
} {
    const separator = value.indexOf(":");
    if (separator < 0) {
        return { source: "dev-global-jobs", sourceJobId: value };
    }

    const source = value.slice(0, separator);
    const sourceJobId = value.slice(separator + 1);
    if (source !== "dev-global-jobs" && source !== "partner") {
        throw new Error("Unsupported job source");
    }
    if (!sourceJobId) {
        throw new Error("Invalid job ID");
    }

    return { source, sourceJobId };
}
