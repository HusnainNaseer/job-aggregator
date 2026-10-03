const express = require("express");
const { getJobsController } = require("../controllers/jobController");

const router = express.Router();

router.get("/", getJobsController);

module.exports = router;