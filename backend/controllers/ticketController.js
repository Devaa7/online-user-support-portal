const Ticket = require("../models/Ticket");

// Create Ticket (User) - with Room Number + Auto Priority + SLA
exports.createTicket = async (req, res) => {
  try {
    const { roomNumber, title, description, category } = req.body;

    if (!roomNumber) {
      return res.status(400).json({ message: "Room Number is required" });
    }

    // Auto Priority + SLA based on category + keywords
    const getPriorityAndSla = (category, title = "", description = "") => {
      const text = `${title} ${description}`.toLowerCase();

      const highKeywords = [
        "urgent",
        "shock",
        "fire",
        "leak",
        "short circuit",
        "no power",
        "security",
        "danger",
      ];
      const isHigh = highKeywords.some((k) => text.includes(k));

      // Hostel rules
      if (category === "Electrical" || category === "Plumbing" || isHigh) {
        return { priority: "High", slaHours: 24 };
      }

      if (category === "WiFi/Network" || category === "Room Damage") {
        return { priority: "Medium", slaHours: 36 };
      }

      if (category === "Mess Complaint") {
        return { priority: "Low", slaHours: 48 };
      }

      return { priority: "Low", slaHours: 48 };
    };

    const { priority, slaHours } = getPriorityAndSla(category, title, description);

    const ticket = await Ticket.create({
      roomNumber,
      title,
      description,
      category,
      priority,
      slaHours,
      slaDueAt: new Date(Date.now() + slaHours * 60 * 60 * 1000),
      createdBy: req.user._id,
      status: "Open",
      history: [{ status: "Open", changedAt: new Date(), note: "Ticket created" }],
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Tickets (User)
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ createdBy: req.user._id });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all tickets
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().populate("createdBy", "name email");
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update ticket status
exports.updateTicketStatus = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const newStatus = req.body.status;

    // Only update if status actually changed
    if (newStatus && newStatus !== ticket.status) {
      ticket.status = newStatus;

      // Ensure history array exists
      if (!ticket.history) {
        ticket.history = [];
      }

      // Push new timeline entry
      ticket.history.push({
        status: newStatus,
        changedAt: new Date(),
        note: `Status updated to ${newStatus}`,
      });
    }

    await ticket.save();

    res.json({ message: "Ticket updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
