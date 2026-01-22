const db = require("../config/db");

const Participant = {
  join: (wheelId, userId, cb) => {
    const sql = "INSERT INTO spin_participants (wheel_id, user_id) VALUES (?, ?)";
    db.query(sql, [wheelId, userId], cb);
  },

  alreadyJoined: (wheelId, userId, cb) => {
    const sql = "SELECT id FROM spin_participants WHERE wheel_id = ? AND user_id = ?";
    db.query(sql, [wheelId, userId], (err, rows) => {
      if (err) return cb(err, false);
      cb(null, rows.length > 0);
    });
  },

  count: (wheelId, cb) => { // <-- renamed
    const sql = "SELECT COUNT(*) as cnt FROM spin_participants WHERE wheel_id=?";
    db.query(sql, [wheelId], (err, rows) => {
      if (err) return cb(err);
      cb(null, rows[0].cnt);
    });
  },

  getByWheel: (wheelId, cb) => {
    const sql = "SELECT user_id FROM spin_participants WHERE wheel_id = ?";
    db.query(sql, [wheelId], (err, rows) => {
      if (err) return cb(err, []);
      cb(null, rows);
    });
  }
};

module.exports = Participant;
