const db = require("../config/db");

const Participant = {
  join: (wheelId, userId, callback) => {
    db.query(
      "INSERT INTO spin_participants (wheel_id, user_id) VALUES (?, ?)",
      [wheelId, userId],
      callback
    );
  },

  alreadyJoined: (wheelId, userId, callback) => {
    db.query(
      "SELECT * FROM spin_participants WHERE wheel_id=? AND user_id=?",
      [wheelId, userId],
      (err, rows) => {
        if (err) return callback(err);
        callback(null, rows.length > 0);
      }
    );
  },
};

module.exports = Participant;
