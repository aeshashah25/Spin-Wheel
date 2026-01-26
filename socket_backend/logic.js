import { db } from "./db.js";
import { credit, refund } from "./cointransaction.js";

const ENTRY_SPLIT = {
  winner: 70,
  admin: 20,
  app: 10
};

export async function createWheel(entryFee, adminId) {
  const [active] = await db.query(
    "SELECT id FROM spin_wheels WHERE status IN ('waiting','running')"
  );
  if (active.length) throw new Error("An active wheel already exists");

  const [res] = await db.query(
    "INSERT INTO spin_wheels (entry_fee, status) VALUES (?, 'waiting')",
    [entryFee]
  );

  console.log("🎡 Wheel created:", res.insertId);
  return res.insertId;
}

export async function joinWheel(userId, io) {
  const [[wheel]] = await db.query(
    "SELECT * FROM spin_wheels WHERE status='waiting' ORDER BY id DESC LIMIT 1"
  );
  if (!wheel) throw new Error("No active wheel to join");

  const [[user]] = await db.query("SELECT * FROM users WHERE id=?", [userId]);
  if (!user) throw new Error("User not found");
  if (user.coins < wheel.entry_fee) throw new Error("Insufficient coins");

  await db.query("UPDATE users SET coins = coins - ? WHERE id=?", [
    wheel.entry_fee,
    userId
  ]);

  await db.query(
    "INSERT INTO spin_participants (wheel_id, user_id) VALUES (?, ?)",
    [wheel.id, userId]
  );

  await db.query(
    `UPDATE spin_wheels SET
      winner_pool = winner_pool + ?,
      admin_pool = admin_pool + ?,
      app_pool = app_pool + ?
     WHERE id=?`,
    [
      (wheel.entry_fee * ENTRY_SPLIT.winner) / 100,
      (wheel.entry_fee * ENTRY_SPLIT.admin) / 100,
      (wheel.entry_fee * ENTRY_SPLIT.app) / 100,
      wheel.id
    ]
  );

  io.emit("player_joined", { userId, wheelId: wheel.id });
}

export async function startWheel(io, adminId) {
  const [[wheel]] = await db.query(
    "SELECT * FROM spin_wheels WHERE status='waiting' ORDER BY id DESC LIMIT 1"
  );
  if (!wheel) throw new Error("No wheel to start");

  const [players] = await db.query(
    "SELECT user_id FROM spin_participants WHERE wheel_id=?",
    [wheel.id]
  );

  if (players.length < 3) {
    console.log("⚠️ Aborted: less than 3 players");

    for (const p of players) {
      await refund(p.user_id, wheel.entry_fee, "Wheel aborted");
      console.log("↩️ Refund:", p.user_id);
    }

    await db.query(
      "UPDATE spin_wheels SET status='aborted' WHERE id=?",
      [wheel.id]
    );

    io.emit("wheel_aborted", { wheelId: wheel.id });
    return;
  }

  await db.query(
    "UPDATE spin_wheels SET status='running', started_at=NOW() WHERE id=?",
    [wheel.id]
  );

  let alive = players.map(p => p.user_id);

  const interval = setInterval(async () => {
    if (alive.length === 1) {
      clearInterval(interval);

      const winner = alive[0];

      await credit(winner, wheel.winner_pool, "Spin win");
      await credit(adminId, wheel.admin_pool, "Admin commission");

      console.log(" Winner:", winner);
      console.log(" Admin paid:", adminId);
      console.log(" Winner pool:", wheel.winner_pool);
      console.log(" Admin pool:", wheel.admin_pool);

      await db.query(
        "UPDATE spin_wheels SET status='completed' WHERE id=?",
        [wheel.id]
      );

      io.emit("wheel_completed", { winner });
      return;
    }

    const eliminated =
      alive.splice(Math.floor(Math.random() * alive.length), 1)[0];

    io.emit("player_eliminated", eliminated);
    console.log(" Eliminated:", eliminated);
  }, 7000);
}
