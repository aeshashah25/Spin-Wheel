import { db } from "./db.js";

export async function credit(userId, amount, reason) {
  await db.query(
    "INSERT INTO coin_transactions (user_id, amount, type, reason) VALUES (?, ?, 'credit', ?)",
    [userId, amount, reason]
  );
  await db.query("UPDATE users SET coins = coins + ? WHERE id = ?", [
    amount,
    userId
  ]);
}

export async function refund(userId, amount, reason) {
  await db.query(
    "INSERT INTO coin_transactions (user_id, amount, type, reason) VALUES (?, ?, 'refund', ?)",
    [userId, amount, reason]
  );
  await db.query("UPDATE users SET coins = coins + ? WHERE id = ?", [
    amount,
    userId
  ]);
}
