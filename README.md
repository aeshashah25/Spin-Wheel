Spin Wheel Game System – ROXSTAR Assessment

A production-ready backend implementation of a real-time multiplayer Spin Wheel game with secure coin handling, concurrency safety, and automated lifecycle management.

-> Overview

This project implements a multi-user spin wheel game system where:

Admins create spin wheels

Users join by paying coins

Wheels auto-start or can be manually started

Participants are eliminated periodically

Winner and admin receive coin payouts

Failed wheels are auto-aborted with refunds

The system is designed with correctness, concurrency safety, and scalability as top priorities.

-> Key Design Principles

Single Active Wheel Guarantee

Atomic Coin Operations

Race Condition Prevention

Deterministic State Transitions

Extensible Architecture



Installation & Setup

Follow these steps to run the Spin Wheel Game System locally.

-->Prerequisites
Make sure you have the following installed:
Node.js v16 or higher
MySQL v8+

-->npm (comes with Node.js)
-->Postman (for API testing)

-->Verify installation:
node -v
npm -v
mysql --version

 -->Clone the Repository
git clone https://github.com/aeshashah25/Spin-Wheel
git pull

 -->Install Dependencies
npm install

--> Environment Variables
Create a .env file in the root of the backend folder:
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=spin_wheel_db



-> System Architecture
backend/
├── server.js              # App entry point
├── app.js                 # Express config & routes
│
├── config/
│   └── db.js              # MySQL connection pool
│
├── routes/
│   └── wheelroute.js      # API routes
│
├── controllers/
│   └── wheelController.js # Business logic
│
├── services/
│   └── wheeltimeservice.js # Auto start / elimination / refund logic
│
├── models/
│   ├── spinwheel.js       # Wheel DB operations
│   └── participant.js    # Participant DB operations
│
├── .env
└── package.json

🗄️ Database Schema
users
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  coins INT DEFAULT 0,
  role ENUM('user','admin') DEFAULT 'user'
);

spin_wheels
CREATE TABLE spin_wheels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  entry_fee INT NOT NULL,
  min_players INT DEFAULT 3,
  status ENUM('waiting','running','completed','aborted') DEFAULT 'waiting',
  winner_pool INT DEFAULT 0,
  admin_pool INT DEFAULT 0,
  app_pool INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP NULL
);

spin_participants
CREATE TABLE spin_participants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  wheel_id INT,
  user_id INT,
  eliminated BOOLEAN DEFAULT 0,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

coin_transactions
CREATE TABLE coin_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  amount INT,
  type ENUM('debit','credit','refund'),
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--> Spin Wheel Lifecycle
-> Initialize Wheel
Only admins can create a wheel
Only one active wheel allowed at a time
Auto-start timer begins immediately

-> Join Wheel
User pays entry fee in coins
Duplicate joins prevented
Coins deducted atomically

->Entry fee split:
Winner Pool – 70%
Admin Pool – 20%
App Pool – 10%

-> Auto / Manual Start
Auto-start after configured delay
Minimum participants required: 3
Manual start available for admin

-> Abort Logic
If participants < 3 after timer:
Wheel aborted
All users refunded fully
Transactions logged

->Elimination Process
One user eliminated every 7 seconds
Random selection
Continues until one winner remains

->Final Payout
Winner credited winner pool
Admin credited admin pool
Wheel marked as completed
All payouts recorded in coin_transactions

-->Concurrency & Safety
->Atomic Transactions
All coin operations use MySQL transactions:
Prevent partial debits/credits
Guarantee consistency

->Duplicate Join Protection
Same user cannot join the same wheel twice

->Race Condition Prevention
Wheel state validated before every mutation
Timer and manual start guarded by status checks

-->Edge Cases Handled
User joins twice → rejected
Insufficient coins → rejected
Wheel starts twice → prevented
Auto-start + manual start clash → handled
Abort refunds → safe and idempotent
Winner payout duplication → prevented
Invalid state transitions blocked

-->Testing (Postman)
Create Wheel
POST /api/wheels/create

{
  "entryFee": 200,
  "minPlayers": 3,
  "adminId": 1
}

Join Wheel
POST /api/wheels/join

{
  "userId": 2
}

