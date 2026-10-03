import { NextResponse } from "next/server";
import { normalizeJob, parseJobId } from "@/lib/jobs/normalize";

const DEV_GLOBAL_JOBS_API = "https://devglobaljobs.com/api/v1/jobs";

function jsonResponse(body: unknown, status = 200) {
    return NextResponse.json(body, {
        status,
        headers: { "Cache-Control": "no-store, max-age=0" },
    });
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { source, sourceJobId } = parseJobId(id);

        if (source !== "dev-global-jobs") {
            return jsonResponse(
                { message: "This job source is not configured yet." },
                501
            );
        }

        const response = await fetch(
            `${DEV_GLOBAL_JOBS_API}/${encodeURIComponent(sourceJobId)}`,
            { cache: "no-store" }
        );

        if (response.status === 404) {
            return jsonResponse({ message: "Job not found." }, 404);
        }
        if (!response.ok) {
            return jsonResponse(
                { message: "The job source is temporarily unavailable." },
                502
            );
        }

        const record: unknown = await response.json();
        if (!record || typeof record !== "object" || Array.isArray(record)) {
            return jsonResponse(
                { message: "The job source returned an invalid response." },
                502
            );
        }

        return jsonResponse(normalizeJob(source, record as Record<string, unknown>));
    } catch (error) {
        console.error("Job detail proxy error:", error);
        return jsonResponse({ message: "Unable to load this job right now." }, 500);
    }
}
