const Ticket = require("../models/Ticket");

// Create Ticket
// Create Ticket (with auto priority + SLA)
exports.createTicket = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    // ✅ USP: Auto priority + SLA based on category + keywords
    const getPriorityAndSla = (category, title = "", description = "") => {
      const text = `${title} ${description}`.toLowerCase();

      const highKeywords = [
        "urgent",
        "error",
        "crash",
        "failed",
        "payment",
        "login",
        "security",
      ];
      const isHigh = highKeywords.some((k) => text.includes(k));

      if (category === "Technical" || isHigh) return { priority: "High", slaHours: 24 };
      if (category === "Billing") return { priority: "Medium", slaHours: 36 };
      return { priority: "Low", slaHours: 48 };
    };

    const { priority, slaHours } = getPriorityAndSla(category, title, description);

    const ticket = await Ticket.create({
      title,
      description,
      category,
      priority,
      slaHours,
      slaDueAt: new Date(Date.now() + slaHours * 60 * 60 * 1000),
      createdBy: req.user._id,
      status: "Open",
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

    ticket.status = req.body.status || ticket.status;
    await ticket.save();

    res.json({ message: "Ticket updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};