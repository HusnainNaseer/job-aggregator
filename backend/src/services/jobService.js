const { fetchJobs } = require("../clients/devGlobalJobsClient");

async function getJobs({
    search = "",
    category = "",
    country = "",
    city = "",
    skillCategory = "",
    page = 1,
    limit = 10
} = {}) {
    const jobs = [];

    const externalPageSize = 100;
    const targetJobs = page * limit;

    let externalOffset = 0;
    let hasMore = true;
    let lastData = null;

    while (jobs.length < targetJobs && hasMore) {
        const data = await fetchJobs({
            limit: externalPageSize,
            offset: externalOffset,
            search,
            category,
            country,
            city
        });

        lastData = data;

        const pageJobs = Array.isArray(data.jobs)
            ? data.jobs
            : [];

        const filteredJobs = pageJobs.filter((job) => {
            const matchesSkill =
                !skillCategory ||
                job.skillCategory?.toLowerCase() === skillCategory;

            const matchesCity =
                !city ||
                job.location?.toLowerCase().includes(city);

            return matchesSkill && matchesCity;
        });

        jobs.push(...filteredJobs);

        hasMore = Boolean(data.meta?.hasMore);

        externalOffset += externalPageSize;

        if (pageJobs.length === 0) {
            break;
        }
    }

    const startIndex = (page - 1) * limit;

    const pageJobs = jobs.slice(
        startIndex,
        startIndex + limit
    );

    return {
        jobs: pageJobs,

        pagination: {
            page,
            limit,
            hasNextPage:
                jobs.length > page * limit || hasMore,
            hasPreviousPage: page > 1
        },

        meta: lastData?.meta || null
    };
}

module.exports = {
    getJobs
};