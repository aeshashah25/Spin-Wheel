const db = require("../config/db");

const SpinWheel = {
  getActiveWheel: (callback) => {
    const sql = "SELECT * FROM spin_wheels WHERE status='waiting' ORDER BY created_at DESC LIMIT 1";
    db.query(sql, (err, result) => {
      if (err) return callback(err);
      callback(null, result[0] || null);
    });
  }
};

module.exports = SpinWheel;
