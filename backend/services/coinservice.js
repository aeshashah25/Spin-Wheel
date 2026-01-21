const db = require("../config/db");

exports.deductCoins = (userId, amount, callback) => {
  db.getConnection((err, conn) => {
    if (err) return callback(err);

    conn.beginTransaction(err => {
      if (err) return callback(err);

      conn.query(
        "SELECT coins FROM users WHERE id=? FOR UPDATE",
        [userId],
        (err, rows) => {
          if (err || rows.length === 0) {
            return conn.rollback(() => callback(err || "User not found"));
          }

          if (rows[0].coins < amount) {
            return conn.rollback(() =>
              callback("Insufficient coins")
            );
          }

          conn.query(
            "UPDATE users SET coins = coins - ? WHERE id=?",
            [amount, userId],
            err => {
              if (err)
                return conn.rollback(() => callback(err));

              conn.commit(err => {
                if (err)
                  return conn.rollback(() => callback(err));
                conn.release();
                callback(null);
              });
            }
          );
        }
      );
    });
  });
};
