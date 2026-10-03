const { getJobs } = require("../services/jobService");

async function getJobsController(req, res) {
    try {
        const country =
            typeof req.query.country === "string"
                ? req.query.country.trim().toLowerCase()
                : "";

        const search =
            typeof req.query.search === "string"
                ? req.query.search.trim()
                : "";

        const category =
            typeof req.query.category === "string"
                ? req.query.category.trim().toLowerCase()
                : "";

        const skillCategory =
            typeof req.query.skillCategory === "string"
                ? req.query.skillCategory.trim().toLowerCase()
                : "";

        const page =
            req.query.page === undefined
                ? 1
                : Number(req.query.page);

        const limit =
            req.query.limit === undefined
                ? 10
                : Number(req.query.limit);

        const city =
            typeof req.query.city === "string"
                ? req.query.city.trim().toLowerCase()
                : "";

        if (!Number.isInteger(page) || page < 1) {
            return res.status(400).json({
                message: "Page must be a positive integer"
            });
        }

        if (
            !Number.isInteger(limit) ||
            limit < 1 ||
            limit > 100
        ) {
            return res.status(400).json({
                message: "Limit must be an integer between 1 and 100"
            });
        }

        const data = await getJobs({
            country,
            search,
            category,
            skillCategory,
            page,
            limit,
            city
        });

        res.json(data);
    }
    catch (error) {
        console.error("Failed to fetch jobs:", error);

        return res.status(500).json({
            message: "Failed to fetch jobs",
            error: error.message,
            code: error.code,
            status: error.status
        });
    

    if (error.code === "UPSTREAM_TIMEOUT") {
        return res.status(504).json({
            message: "Job service timed out"
        });
    }

    if (error.status === 429) {
        return res.status(503).json({
            message: "Job service rate limit reached"
        });
    }

    if (error.status >= 500) {
        return res.status(502).json({
            message: "Job service is currently unavailable"
        });
    }

    res.status(500).json({
        message: "Failed to fetch jobs"
    });
    }
}

module.exports = {
    getJobsController
};