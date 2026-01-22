const SpinWheel = require("../models/spinwheel");
const Participant = require("../models/participant");
const coinService = require("./coinservice");

// Timer delay: 3 minutes (for testing, reduce to 10 seconds)
//const WHEEL_START_DELAY = 3 * 60 * 1000; // 3 min
 const WHEEL_START_DELAY = 30 * 1000; // 10 sec for DEV

/**
 * Starts the timer for a spin wheel
 * After delay, checks participants and starts/aborts wheel
 */
const startWheelTimer = (wheelId) => {
  console.log(`⏳ Wheel timer scheduled for wheel ID: ${wheelId}`);

  setTimeout(() => {
    console.log(`⏰ Timer fired for wheel ID: ${wheelId}`);

    // 1️⃣ Get current wheel
    SpinWheel.getById(wheelId, (err, wheel) => {
      if (err) {
        console.error("Error fetching wheel:", err);
        return;
      }

      if (!wheel) {
        console.log("Wheel not found, aborting timer");
        return;
      }

      console.log("Wheel status at timer fire:", wheel.status);

      // Only process waiting wheels
      if (wheel.status !== "waiting") {
        console.log("Wheel is not waiting, skipping start");
        return;
      }

      // 2️⃣ Count participants
      Participant.count(wheel.id, (err, count) => {
        if (err) {
          console.error("Error counting participants:", err);
          return;
        }

        console.log(`Participant count: ${count}, min required: ${wheel.min_players}`);

        if (count < wheel.min_players) {
          // ❌ Abort wheel
          console.log("Aborting wheel due to insufficient participants");
          SpinWheel.updateStatus(wheel.id, "aborted");

          // Refund users
          Participant.getByWheel(wheel.id, async (err, users) => {
            if (err) {
              console.error("Error fetching users for refund:", err);
              return;
            }

            console.log("Refunding coins to participants...");
            for (let user of users) {
              try {
                await coinService.refundCoins(user.user_id, wheel.entry_fee);
                console.log(`Refunded ${wheel.entry_fee} coins to user ${user.user_id}`);
              } catch (refundErr) {
                console.error(`Failed to refund user ${user.user_id}:`, refundErr);
              }
            }
          });

        } else {
          // ✅ Start wheel
          console.log("Starting wheel!");
          SpinWheel.updateStatus(wheel.id, "running");
          SpinWheel.setStartedAt(wheel.id);
        }
      });
    });
  }, WHEEL_START_DELAY);
};

module.exports = { startWheelTimer };
