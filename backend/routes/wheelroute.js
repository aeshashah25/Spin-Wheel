const express = require("express");
const router = express.Router();
const wheelController = require("../controllers/wheelcontrollers");

router.post("/create", wheelController.createWheel);
router.get("/active", wheelController.getActiveWheel);
router.post("/join", wheelController.joinWheel);


module.exports = router;
