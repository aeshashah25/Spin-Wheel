const SpinWheel = require("../models/spinwheel");
const Participant = require("../models/participant");
const db = require("../config/db");

const START_DELAY = 60 * 1000;

// 1️⃣ AUTO START
exports.autoStart = (wheelId) => {
  setTimeout(() => {
    Participant.count(wheelId, (e, c) => {
      if (c < 3) {
        // 🔥 REFUND LOGIC ADDED
        refundAll(wheelId, () => {
          SpinWheel.updateStatus(wheelId, "aborted");
        });
      } else {
        SpinWheel.updateStatus(wheelId, "running");
        startElimination(wheelId);
      }
    });
  }, START_DELAY);
};

// 2️⃣ ELIMINATION PROCESS
function startElimination(wheelId) {
  const interval = setInterval(() => {
    Participant.getAlive(wheelId, (e, users) => {
      if (users.length === 1) {
        const winner = users[0];

        // 🔥 PAYOUT LOGIC ADDED
        payoutWinner(wheelId, winner.user_id, () => {
          SpinWheel.updateStatus(wheelId, "completed");
          clearInterval(interval);
        });

        return;
      }

      const random = users[Math.floor(Math.random() * users.length)];
      Participant.eliminate(random.id);
    });
  }, 7000);
}

/////////////////////////
// 🔥 NEW FUNCTIONS
/////////////////////////

// 🔁 REFUND ALL USERS
function refundAll(wheelId, cb) {
  const sql = `
    SELECT p.user_id, w.entry_fee
    FROM spin_participants p
    JOIN spin_wheels w ON w.id = p.wheel_id
    WHERE p.wheel_id = ?
  `;

  db.query(sql, [wheelId], (err, rows) => {
    if (err || rows.length === 0) return cb();

    db.getConnection((err, conn) => {
      if (err) return cb();

      conn.beginTransaction(err => {
        if (err) return cb();

        rows.forEach(r => {
          // Refund coins
          conn.query(
            "UPDATE users SET coins = coins + ? WHERE id=?",
            [r.entry_fee, r.user_id]
          );

          // Transaction log
          conn.query(
            `INSERT INTO coin_transactions (user_id, amount, type, reason)
             VALUES (?, ?, 'refund', 'Wheel aborted refund')`,
            [r.user_id, r.entry_fee]
          );
        });

        conn.commit(err => {
          if (err) return conn.rollback(() => cb());
          conn.release();
          cb();
        });
      });
    });
  });
}

// 🏆 PAYOUT WINNER + ADMIN
function payoutWinner(wheelId, winnerId, cb) {
  db.query(
    "SELECT winner_pool, admin_pool FROM spin_wheels WHERE id=?",
    [wheelId],
    (err, r) => {
      if (err || !r[0]) return cb();

      const { winner_pool, admin_pool } = r[0];

      db.getConnection((err, conn) => {
        if (err) return cb();

        conn.beginTransaction(err => {
          if (err) return cb();

          // Winner payout
          conn.query(
            "UPDATE users SET coins = coins + ? WHERE id=?",
            [winner_pool, winnerId]
          );

          conn.query(
            `INSERT INTO coin_transactions (user_id, amount, type, reason)
             VALUES (?, ?, 'credit', 'Spin wheel win')`,
            [winnerId, winner_pool]
          );

          // Admin payout (assuming admin id = 1)
          conn.query(
            "UPDATE users SET coins = coins + ? WHERE role='admin' LIMIT 1",
            [admin_pool]
          );

          conn.query(
            `INSERT INTO coin_transactions (user_id, amount, type, reason)
             SELECT id, ?, 'credit', 'Spin wheel admin commission'
             FROM users WHERE role='admin' LIMIT 1`,
            [admin_pool]
          );

          conn.commit(err => {
            if (err) return conn.rollback(() => cb());
            conn.release();
            cb();
          });
        });
      });
    }
  );
}
