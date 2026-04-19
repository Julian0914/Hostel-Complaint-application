const express = require("express");
const { protect, authorise } = require("../middleware/authMiddleware");
const ctrl = require("../controllers/studentController");

const router = express.Router();

router.use(protect, authorise("student"));
router.post("/", ctrl.submitComplaint);
router.get("/", ctrl.getMyComplaints);
router.get("/:id", ctrl.getComplaintById);

module.exports = router;
