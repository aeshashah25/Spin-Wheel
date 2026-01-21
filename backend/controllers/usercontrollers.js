const User = require("../models/user");

exports.createUser = (req, res) => {
  const { username } = req.body;
  User.create(username, 1000, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "User created", id: result.insertId });
  });
};

exports.getUsers = (req, res) => {
  User.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};
