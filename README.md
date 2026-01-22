# Spin-Wheel
real-time multiplayer Spin Wheel game system where users join a wheel by paying coins, get eliminated in real time, and the last remaining player wins the prize pool.



flow chart
[Admin creates wheel]
          |
          v
[Wheel status = "waiting"] 
          |
          v
[Users join wheel]
          |  (coins deducted atomically)
          v
[Participants table updated]
          |
          v
[Min players reached OR 3 min timer]
          |
          v
[Wheel starts] -----------------------> [Not enough players? Auto-abort & refund]
          |
          v
[Elimination sequence every 7s]
          |
          v
[Last user remaining → Winner]
          |
          v
[Distribute coins: Winner pool + Admin pool]
          |
          v
[Wheel status = "completed"]




Overview

The Spin Wheel Game System is a real-time multiplayer game where users can:

Join spin wheels by paying an entry fee in coins

Compete in rounds with elimination every 7 seconds

Winners receive the prize pool while admins receive a portion

All operations are atomic, concurrency-safe, and database-driven

This project is built for the ROXSTAR assessment and follows MVC architecture, ensuring clean separation of concerns.

Tech Stack

Backend: Node.js, Express

Database: MySQL (phpMyAdmin used for local testing)

Real-time communication: Socket.IO (planned for live updates)

Environment Variables: dotenv

Styling / Frontend: (Optional) Tailwind CSS

Features Implemented

User Management: Create users, manage coins

Spin Wheel Lifecycle:

Admin creates wheel

Only one active wheel at a time

Users can join by paying coins

Coin System:

Deducts entry fee atomically

Prevents duplicate entries

Participant Management:

Tracks participants per wheel

Prevents double joins



API Safety:

Error handling for invalid wheel

Concurrency-safe coin deduction

Folder Structure (MVC)
backend/
├── config/
│   └── db.js            # Database connection
├── controllers/
│   └── wheelController.js
├── models/
│   ├── Participant.js
│   └── SpinWheel.js
├── routes/
│   └── wheelRoutes.js
├── services/
│   └── coinService.js
├── server.js
├── package.json
└── .env



controllers → business logic

models → database queries

services → reusable logic (coin operations)

routes → REST endpoints

server.js → main entry point



Database Schema
-- Users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  coins INT DEFAULT 1000,
  role ENUM('admin','user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Spin Wheels
CREATE TABLE spin_wheels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50),
  prize INT DEFAULT 0,
  status ENUM('waiting','active','completed','aborted') DEFAULT 'waiting',
  entry_fee INT NOT NULL,
  min_players INT DEFAULT 3,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Participants
CREATE TABLE spin_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  wheel_id INT,
  user_id INT,
  eliminated BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wheel_id) REFERENCES spin_wheels(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Transactions (Coin ledger)
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  amount INT,
  type ENUM('debit','credit'),
  reason VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE spin_wheels
ADD COLUMN started_at DATETIME NULL,
ADD COLUMN aborted_at DATETIME NULL;


Setup & Installation

Clone repository

git clone <your-repo-url>
cd backend



Install dependencies

npm install


Create .env

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=<your-password>
DB_NAME=spin_wheel_game
PORT=5000


Start server

node server.js


Verify DB connection

Server running on port 5000
DB Connected!

API Endpoints
1️⃣ Create Wheel (Admin)
POST /api/wheels/create
Body: { name, prize, entryFee, adminId }

2️⃣ Get Active Wheel
GET /api/wheels/active

3️⃣ Join Wheel (User)
POST /api/wheels/join
Body: { userId }


Coin deduction and participant insert handled automatically.

Gameplay Flow

Admin creates a wheel → status = waiting

Users join → coins deducted, participants added

Wheel auto-start / manual start → elimination sequence begins (next steps planned)

Last user remaining → winner, coins distributed

Edge Cases & Safety

Only one active wheel allowed at a time

User cannot join twice

Coins deducted atomically

Handles invalid wheel gracefully

Future Improvements (Bonus Points)

Auto-start after 3 minutes

Elimination every 7 seconds

Real-time updates using Socket.IO

Coin pools configurable in DB

Admin dashboard + analytics

Comprehensive unit tests + load testing

Interview Talking Points

MVC Architecture → easy separation of concerns

Atomic transactions → no partial coin updates

Error handling → all invalid scenarios return meaningful errors

Scalable → only one active wheel simplifies concurrency

Edge cases documented → duplicates, invalid wheel, insufficient coins
