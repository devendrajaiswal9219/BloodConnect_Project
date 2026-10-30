const express=require('express');
const {protect,authorize}=require("../middleware/auth");
const {getInventory,adjustInventory}=require("../controllers/inventoryController");

const router=express.Router();

router.use(protect);

router.get("/",getInventory);
router.patch("/:bloodGroup",authorize("admin"),adjustInventory);

module.exports=router;
