const SpinWheel = require("../models/spinwheel");
const Participant = require("../models/participant");
const Timer = require("../services/wheeltimeservice");
const db = require("../config/db");

exports.createWheel = (req, res) => {
  const { entryFee, minPlayers, adminId } = req.body;

  if (!entryFee || !adminId) {
    return res.status(400).json({ error: "entryFee and adminId required" });
  }

  //  1. Check admin exists and role
  db.query(
    "SELECT id, role FROM users WHERE id=?",
    [adminId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });

      if (rows.length === 0) {
        return res.status(404).json({ error: "Admin not found" });
      }

      if (rows[0].role !== "admin") {
        return res.status(403).json({ error: "Only admin can create wheel" });
      }

      //  2. Check active wheel
      SpinWheel.getActive((_, active) => {
        if (active) {
          return res.status(400).json({ error: "Wheel already active" });
        }

        //  3. Create wheel
        SpinWheel.create(
          { entryFee, minPlayers },
          (err, wheel) => {
            if (err) return res.status(500).json({ error: err });

            Timer.autoStart(wheel.id);
            res.json({
              message: "Wheel created successfully",
              wheel
            });
          }
        );
      });
    }
  );
};


exports.joinWheel = (req, res) => {
  const { userId } = req.body;

  SpinWheel.getActive((_, wheel) => {
    if (!wheel) return res.status(400).json({ error: "No active wheel" });

    //  1. Check if already joined
    db.query(
      "SELECT id FROM spin_participants WHERE wheel_id=? AND user_id=?",
      [wheel.id, userId],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err });

        if (rows.length > 0) {
          return res.status(400).json({
            error: "User already joined"
          });
        }

        //  2. Check user coins
        db.query(
          "SELECT coins FROM users WHERE id=?",
          [userId],
          (e, r) => {
            if (e) {
              return res.status(500).json({ error: "DB error", details: e });
            }

            if (!r || r.length === 0) {
              return res.status(404).json({ error: "User not found" });
            }

            if (r[0].coins < wheel.entry_fee) {
              return res.status(400).json({ error: "Insufficient coins" });
            }

            //  3. Atomic transaction
            db.getConnection((_, conn) => {
              conn.beginTransaction(() => {
                conn.query(
                  "UPDATE users SET coins = coins - ? WHERE id = ?",
                  [wheel.entry_fee, userId]
                );

                Participant.join(wheel.id, userId, () => {
                  SpinWheel.updatePools(
                    wheel.id,
                    wheel.entry_fee * 0.7,
                    wheel.entry_fee * 0.2,
                    wheel.entry_fee * 0.1
                  );

                  conn.commit(() => {
                    conn.release();
                    res.json({ message: "Joined successfully" });
                  });
                });
              });
            });
          }
        );
      }
    );
  });
};


exports.manualStart = (req, res) => {
  SpinWheel.updateStatus(req.params.id, "running");
  res.json({ message: "Started manually" });
};

exports.getWheel = (req, res) => {
  SpinWheel.getById(req.params.id, (_, w) => res.json(w));
};
