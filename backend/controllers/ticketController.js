const Ticket = require("../models/Ticket");

// Create Ticket
exports.createTicket = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    const ticket = await Ticket.create({
      title,
      description,
      category,
      createdBy: req.user._id,
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