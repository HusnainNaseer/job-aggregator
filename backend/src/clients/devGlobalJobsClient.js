async function fetchJobs({ limit, offset, search = "", category = "",country="" }) {
    const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset)
    });

    if (search) {
        params.set("search", search);
    }
    if (category) {
        params.set("category", category);
    }
    if (country) {
    params.set("country", country);
}

    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, 10000);

    try {
        const response = await fetch(
            `${process.env.DEV_GLOBAL_JOBS_API_URL}?${params.toString()}`,
            {
                signal: controller.signal
            }
        );

        if (!response.ok) {
            const error = new Error(
                `Jobs API returned status ${response.status}`
            );

            error.status = response.status;

            throw error;
        }

        return await response.json();
    } catch (error) {
        if (error.name === "AbortError") {
            const timeoutError = new Error(
                "Jobs API request timed out"
            );

            timeoutError.code = "UPSTREAM_TIMEOUT";

            throw timeoutError;
        }

        throw error;
    } finally {
        clearTimeout(timeout);
    }
}

module.exports = {
    fetchJobs

};