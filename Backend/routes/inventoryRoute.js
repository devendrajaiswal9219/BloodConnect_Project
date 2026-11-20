const express = require('express');
const { protect, authorize } = require("../middleware/auth");
const { getInventory, adjustInventory } = require("../controllers/inventoryController");
const router = express.Router();
// Public endpoint for visitors to check current blood stock
router.get("/", getInventory);
// Admin-only adjustment endpoint
router.patch("/:bloodGroup", protect, authorize("admin"), adjustInventory);
module.exports = router;
