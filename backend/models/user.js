const db = require("../config/db");

const User = {
  create: (username, coins = 1000, callback) => {
    const sql = "INSERT INTO users (username, coins) VALUES (?, ?)";
    db.query(sql, [username, coins], callback);
  },
  getAll: (callback) => {
    db.query("SELECT * FROM users", callback);
  },
};

module.exports = User;
