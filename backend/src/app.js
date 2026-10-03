const express = require("express");
const jobRoutes = require("./routes/jobRoutes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Job Aggregator API is running");
});

app.use("/api/jobs", jobRoutes);

module.exports = app;