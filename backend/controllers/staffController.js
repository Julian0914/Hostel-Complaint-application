const Complaint = require("../models/Complaint");

exports.getAssigned = async (req, res) => {
  try {
    const complaints = await Complaint.find({ assignedTo: req.user.id })
      .populate("student", "name roomNumber")
      .sort({ createdAt: -1 });

    return res.json({ success: true, complaints });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.markCompleted = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      assignedTo: req.user.id,
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found or not assigned to you." });
    }

    complaint.status = "Resolved";
    complaint.remarks = req.body.remarks || "Fixed by maintenance staff";
    complaint.statusLog.push({
      status: "Resolved",
      updatedBy: req.user.id,
      note: complaint.remarks,
    });

    await complaint.save();

    req.app.get("io").to(complaint.student.toString()).emit("complaint_resolved", {
      message: "Your complaint has been resolved.",
      complaintId: complaint._id,
      title: complaint.title,
    });

    return res.json({ success: true, complaint });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.addNote = async (req, res) => {
  try {
    const complaint = await Complaint.findOneAndUpdate(
      {
        _id: req.params.id,
        assignedTo: req.user.id,
      },
      {
        $push: {
          statusLog: {
            status: "In Progress",
            updatedBy: req.user.id,
            note: req.body.note,
          },
        },
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found or not assigned to you." });
    }

    req.app.get("io").to(complaint.student.toString()).emit("status_update", {
      message: "Maintenance staff added a progress note.",
      status: "In Progress",
      complaintId: complaint._id,
    });

    return res.json({ success: true, complaint });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
