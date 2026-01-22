const db = require("../config/db");

const coinService = {

  deductCoins: (userId, amount, cb) => {
    // 1️⃣ Read current coins
    db.query(
      "SELECT coins FROM users WHERE id = ?",
      [userId],
      (err, rows) => {
        if (err) return cb("DB error");

        if (!rows || rows.length === 0) {
          return cb("User not found");
        }

        const currentCoins = rows[0].coins;

        if (currentCoins < amount) {
          return cb("Insufficient coins");
        }

        // 2️⃣ Deduct coins atomically
        db.query(
          "UPDATE users SET coins = coins - ? WHERE id = ?",
          [amount, userId],
          (err) => {
            if (err) return cb("Failed to deduct coins");
            cb(null);
          }
        );
      }
    );
  },

  refundCoins: (userId, amount) => {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET coins = coins + ? WHERE id = ?",
        [amount, userId],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

};

module.exports = coinService;
