const Participant = require("../models/participant");
const SpinWheel = require("../models/spinwheel");
const coinService = require("../services/coinservice");

// 1️⃣ Create Wheel
exports.createWheel = (req, res) => {
  const { name, prize, entryFee, adminId } = req.body;

  // Check if an active wheel exists
  SpinWheel.getActiveWheel((err, activeWheel) => {
    if (err) return res.status(500).json({ error: err });
    if (activeWheel)
      return res.status(400).json({ error: "Another wheel is active" });

    SpinWheel.create({ name, prize, entryFee, created_by: adminId }, (err, wheel) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Wheel created", wheel });
    });
  });
};

// 2️⃣ Get Active Wheel
exports.getActiveWheel = (req, res) => {
  SpinWheel.getActiveWheel((err, wheel) => {
    if (err) return res.status(500).json({ error: err });
    if (!wheel) return res.status(404).json({ error: "No active wheel" });
    res.json({ wheel });
  });
};

// 3️⃣ Join Wheel (Auto-detect active wheel)
exports.joinWheel = (req, res) => {
  const { userId } = req.body;

  SpinWheel.getActiveWheel((err, wheel) => {
    if (err) return res.status(500).json({ error: err });
    if (!wheel) return res.status(400).json({ error: "No active wheel to join" });

    const entryFee = wheel.entry_fee;

    // Check if user already joined
    Participant.alreadyJoined(wheel.id, userId, (err, exists) => {
      if (err) return res.status(500).json({ error: err });
      if (exists) return res.status(400).json({ error: "User already joined" });

      // Deduct coins and add participant
      coinService.deductCoins(userId, entryFee, err => {
        if (err) return res.status(400).json({ error: err });

        Participant.join(wheel.id, userId, err => {
          if (err) return res.status(500).json({ error: err });

          res.json({ message: "Joined wheel successfully" });
        });
      });
    });
  });
};
