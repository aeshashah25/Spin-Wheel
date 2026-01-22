const db = require("../config/db");

const SpinWheel = {

  // ✅ CREATE WHEEL
  create: ({ entryFee, minPlayers }, callback) => {
    const sql = `
      INSERT INTO spin_wheels (entry_fee, min_players, status)
      VALUES (?, ?, 'waiting')
    `;
    db.query(sql, [entryFee, minPlayers], (err, result) => {
      if (err) return callback(err);

      callback(null, {
        id: result.insertId,
        entry_fee: entryFee,
        min_players: minPlayers,
        status: "waiting"
      });
    });
  },

  // ✅ GET ACTIVE WHEEL
  getActiveWheel: (callback) => {
    const sql =
      "SELECT * FROM spin_wheels WHERE status='waiting' ORDER BY created_at DESC LIMIT 1";
    db.query(sql, (err, result) => {
      if (err) return callback(err);
      callback(null, result[0] || null);
    });
  },

  // ✅ GET BY ID
  getById: (id, cb) => {
    db.query(
      "SELECT * FROM spin_wheels WHERE id=?",
      [id],
      (err, rows) => {
        cb(err, rows[0]);
      }
    );
  },

  // ✅ UPDATE STATUS
  updateStatus: (id, status) => {
    db.query(
      "UPDATE spin_wheels SET status=? WHERE id=?",
      [status, id]
    );
  },

  // ✅ SET START TIME
  setStartedAt: (id) => {
    db.query(
      "UPDATE spin_wheels SET started_at=NOW() WHERE id=?",
      [id]
    );
  }
};

module.exports = SpinWheel;
