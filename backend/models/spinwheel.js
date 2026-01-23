const db = require("../config/db");

module.exports = {
  create: (data, cb) => {
    db.query(
      "INSERT INTO spin_wheels (entry_fee, min_players) VALUES (?,?)",
      [data.entryFee, data.minPlayers],
      (err, res) => cb(err, { id: res.insertId })
    );
  },

  getActive: (cb) => {
    db.query(
      "SELECT * FROM spin_wheels WHERE status='waiting' LIMIT 1",
      (e, r) => cb(e, r[0])
    );
  },

  getById: (id, cb) => {
    db.query("SELECT * FROM spin_wheels WHERE id=?", [id], (e, r) =>
      cb(e, r[0])
    );
  },

  updateStatus: (id, status) => {
    db.query("UPDATE spin_wheels SET status=? WHERE id=?", [status, id]);
  },

  updatePools: (id, w, a, app) => {
    db.query(
      "UPDATE spin_wheels SET winner_pool=winner_pool+?, admin_pool=admin_pool+?, app_pool=app_pool+? WHERE id=?",
      [w, a, app, id]
    );
  }
};
