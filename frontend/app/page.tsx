"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "./context/AuthContext";

import JobCard from "./components/JobCard";
import JobSearch from "./components/JobSearch";
import { fetchJobListings } from "@/lib/jobs/client";
import type { Job } from "@/types/job";

type Filters = {
    search: string;
    country: string;
    category: string;
    skillCategory: string;
    city: string;
};

function HomeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { user } = useAuth();

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        hasNextPage: false,
        hasPreviousPage: false,
    });

    /*
     * Read filters directly from the URL
     */
    const filters: Filters = {
        search: searchParams.get("search") || "",
        country: searchParams.get("country") || "",
        category: searchParams.get("category") || "",
        skillCategory: searchParams.get("skillCategory") || "",
        city: searchParams.get("city") || "",
    };

    const page = Number(searchParams.get("page")) || 1;

    /*
     * Fetch jobs whenever the URL changes
     */
    useEffect(() => {
        async function fetchJobs() {
            try {
                setLoading(true);
                setError("");

                const params = new URLSearchParams();

                if (filters.search) {
                    params.set("search", filters.search);
                }

                if (filters.country) {
                    params.set("country", filters.country);
                }

                if (filters.category) {
                    params.set("category", filters.category);
                }

                if (filters.skillCategory) {
                    params.set(
                        "skillCategory",
                        filters.skillCategory
                    );
                }

                if (filters.city) {
                    params.set("city", filters.city);
                }

                params.set("page", String(page));
                params.set("limit", "10");

                const data = await fetchJobListings(params);

                setJobs(data.jobs);
                setPagination(data.pagination);
            } catch (error) {
                console.error(error);
                setError("Failed to load jobs");
                setJobs([]);
            } finally {
                setLoading(false);
            }
        }

        fetchJobs();
    }, [
        searchParams,
        filters.search,
        filters.country,
        filters.category,
        filters.skillCategory,
        filters.city,
        page,
    ]);

    /*
     * Search / filter
     */
    function handleSearch(newFilters: Filters) {
        const params = new URLSearchParams();

        if (newFilters.search.trim()) {
            params.set(
                "search",
                newFilters.search.trim()
            );
        }

        if (newFilters.country.trim()) {
            params.set(
                "country",
                newFilters.country.trim()
            );
        }

        if (newFilters.category.trim()) {
            params.set(
                "category",
                newFilters.category.trim()
            );
        }

        if (newFilters.skillCategory.trim()) {
            params.set(
                "skillCategory",
                newFilters.skillCategory.trim()
            );
        }

        if (newFilters.city.trim()) {
            params.set(
                "city",
                newFilters.city.trim()
            );
        }

        params.set("page", "1");

        router.push(`/?${params.toString()}`);
    }

    /*
     * Next page
     */
    function handleNextPage() {
        if (!pagination.hasNextPage) {
            return;
        }

        const params = new URLSearchParams(
            searchParams.toString()
        );

        params.set("page", String(page + 1));

        router.push(`/?${params.toString()}`);
    }

    /*
     * Previous page
     */
    function handlePreviousPage() {
        if (!pagination.hasPreviousPage) {
            return;
        }

        const params = new URLSearchParams(
            searchParams.toString()
        );

        params.set("page", String(page - 1));

        router.push(`/?${params.toString()}`);
    }

    return (
        <main className="home-page">
            <section className="hero" aria-labelledby="hero-title">
                <div className="hero-copy">
                    <span className="eyebrow">
                        <span className="eyebrow-dot" />
                        A clearer path to your next role
                    </span>
                    <h1 id="hero-title">
                        Find your next <span>opportunity.</span>
                    </h1>
                    <p>
                        Explore roles from across the web, all in one place.
                        Search by location, category, and the skills you want
                        to put to work.
                    </p>
                    <div className="hero-note">
                        {user ? (
                            <>
                                <strong>Welcome back</strong>
                                <span aria-hidden="true">·</span>
                                <span>{user.email}</span>
                            </>
                        ) : (
                            <>
                                <strong>Curated from multiple sources</strong>
                                <span aria-hidden="true">·</span>
                                <span>One search, more possibilities</span>
                            </>
                        )}
                    </div>
                </div>
                <div className="hero-visual" aria-hidden="true">
                    <div className="hero-orbit" />
                    <div className="float-spark float-spark--one">✦</div>
                    <div className="float-spark float-spark--two">↗</div>
                    <div className="hero-float-card hero-float-card--main">
                        <span className="mini-brand">N</span>
                        <strong>Product Designer</strong>
                        <span>Northstar Studio · Remote</span>
                        <div className="mini-tags">
                            <span>Full time</span>
                            <span>Design</span>
                        </div>
                    </div>
                    <div className="hero-float-card hero-float-card--small">
                        <span className="mini-brand">A</span>
                        <strong>New roles</strong>
                        <span>Ready for your next step</span>
                    </div>
                </div>
            </section>

            <section className="search-panel" aria-labelledby="search-title">
                <div className="search-panel-heading">
                    <h2 id="search-title">Make your next move</h2>
                    <p>Use one or more filters to narrow your search.</p>
                </div>
                <JobSearch onSearch={handleSearch} initialFilters={filters} />
            </section>

            <section className="results-section" aria-labelledby="results-title">
                <div className="results-heading">
                    <div>
                        <h2 id="results-title">Explore opportunities</h2>
                        <p>Roles matched to what you are looking for.</p>
                    </div>
                    {!loading && !error && (
                        <span className="result-count">
                            {jobs.length} {jobs.length === 1 ? "role" : "roles"}
                        </span>
                    )}
                </div>

                {loading && (
                    <div className="job-list" aria-label="Loading jobs" aria-busy="true">
                        {Array.from({ length: 3 }, (_, index) => (
                            <div className="skeleton-card" key={index}>
                                <div className="skeleton skeleton-title" />
                                <div className="skeleton skeleton-line" />
                                <div className="skeleton-chips">
                                    <div className="skeleton skeleton-chip" />
                                    <div className="skeleton skeleton-chip" />
                                    <div className="skeleton skeleton-chip" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="error-state" role="alert">
                        <div className="empty-icon" aria-hidden="true">!</div>
                        <h3>We couldn’t load the jobs</h3>
                        <p>{error}. Please try your search again in a moment.</p>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {jobs.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon" aria-hidden="true">⌕</div>
                                <h3>No jobs found</h3>
                                <p>
                                    Try a broader search or remove one of your filters
                                    to see more opportunities.
                                </p>
                            </div>
                        ) : (
                            <div className="job-list">
                                {jobs.map((job) => (
                                    <JobCard key={job.id} job={job} />
                                ))}
                            </div>
                        )}

                        {jobs.length > 0 && (
                            <nav className="pagination" aria-label="Job results pages">
                                <button
                                    className="button-secondary"
                                    onClick={handlePreviousPage}
                                    disabled={!pagination.hasPreviousPage}
                                >
                                    Previous
                                </button>
                                <span className="pagination-label">
                                    Page {pagination.page}
                                </span>
                                <button
                                    className="button-secondary"
                                    onClick={handleNextPage}
                                    disabled={!pagination.hasNextPage}
                                >
                                    Next
                                </button>
                            </nav>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}

export default function Home() {
    return (
        <Suspense
            fallback={
                <main className="home-page" aria-label="Loading job search">
                    <div className="skeleton-card">
                        <div className="skeleton skeleton-title" />
                        <div className="skeleton skeleton-line" />
                    </div>
                </main>
            }
        >
            <HomeContent />
        </Suspense>
    );
}