const db = require("../config/db");

module.exports = {
  join: (wheelId, userId, cb) => {
    db.query(
      "INSERT INTO spin_participants (wheel_id,user_id) VALUES (?,?)",
      [wheelId, userId],
      cb
    );
  },

  count: (wheelId, cb) => {
    db.query(
      "SELECT COUNT(*) cnt FROM spin_participants WHERE wheel_id=?",
      [wheelId],
      (e, r) => cb(e, r[0].cnt)
    );
  },

  getAlive: (wheelId, cb) => {
    db.query(
      "SELECT * FROM spin_participants WHERE wheel_id=? AND eliminated=0",
      [wheelId],
      (e, r) => cb(e, r)
    );
  },

  eliminate: (id) => {
    db.query(
      "UPDATE spin_participants SET eliminated=1 WHERE id=?",
      [id]
    );
  }
};
