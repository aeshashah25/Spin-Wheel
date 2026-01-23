const router = require("express").Router();
const ctrl = require("../controllers/wheelcontrollers");

router.post("/create", ctrl.createWheel);
router.post("/join", ctrl.joinWheel);
router.post("/start/:id", ctrl.manualStart);
router.get("/:id", ctrl.getWheel);

module.exports = router;
