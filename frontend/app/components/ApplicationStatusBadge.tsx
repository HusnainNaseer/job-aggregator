import type { ApplicationStatus } from "@/types/job";

export default function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
    return (
        <span className={`status-badge status-badge--${status.toLowerCase()}`}>
            {status}
        </span>
    );
}
