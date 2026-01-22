const Participant = require("../models/participant");
const SpinWheel = require("../models/spinwheel");
const coinService = require("../services/coinservice");
const { startWheelTimer } = require("../services/wheeltimeservice");

// 1️⃣ Create Wheel
exports.createWheel = (req, res) => {
  const { entryFee, minPlayers } = req.body;

  SpinWheel.create({ entryFee, minPlayers }, (err, wheel) => {
    if (err) return res.status(500).json({ error: err });

    // Start 3-minute timer
    startWheelTimer(wheel.id);

    res.json({
      message: "Wheel created",
      wheel
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

// 3️⃣ Join Wheel
exports.joinWheel = (req, res) => {
  const { userId } = req.body;

  SpinWheel.getActiveWheel((err, wheel) => {
    if (err) return res.status(500).json({ error: err });
    if (!wheel) return res.status(400).json({ error: "No active wheel" });

    Participant.alreadyJoined(wheel.id, userId, (err, exists) => {
      if (exists) {
        return res.status(400).json({ error: "User already joined" });
      }

      coinService.deductCoins(userId, wheel.entry_fee, (err) => {
        if (err) return res.status(400).json({ error: err });

        Participant.join(wheel.id, userId, (err) => {
          if (err) return res.status(500).json({ error: err });

          return res.json({ message: "Joined wheel successfully" });
        });
      });
    });
  });
};
