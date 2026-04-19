const Complaint = require("../models/Complaint");

exports.submitComplaint = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    const complaint = await Complaint.create({
      student: req.user.id,
      title,
      description,
      category,
      priority: priority || "medium",
      roomNumber: req.user.roomNumber,
      statusLog: [
        {
          status: "Pending",
          updatedBy: req.user.id,
          note: "Complaint submitted",
        },
      ],
    });

    req.app.get("io").emit("new_complaint", {
      message: `New complaint submitted: ${title}`,
      complaintId: complaint._id,
      title,
    });

    return res.status(201).json({ success: true, complaint });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getMyComplaints = async (req, res) => {
  try {
    const filter = { student: req.user.id };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const complaints = await Complaint.find(filter)
      .populate("assignedTo", "name department")
      .sort({ createdAt: -1 });

    return res.json({ success: true, complaints });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate(
      "assignedTo",
      "name department"
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    if (complaint.student.toString() !== req.user.id) {
      return res.status(403).json({ message: "That complaint does not belong to you." });
    }

    return res.json({ success: true, complaint });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
