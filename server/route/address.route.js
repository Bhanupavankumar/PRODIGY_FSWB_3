import express from "express";
import { 
    addAddressController, 
    getAddressController, 
    updateAddressController, 
    deleteAddressController 
} from "../controllers/address.controller.js";

const router = express.Router();

// For testing, assume a middleware that sets req.userId
router.use((req, res, next) => {
    req.userId = "64cc8c8b8a4b2e0012345678"; // replace with a real user ID from your DB
    next();
});

router.post("/add", addAddressController);
router.get("/all", getAddressController);
router.put("/update", updateAddressController);
router.delete("/delete", deleteAddressController);

export default router;
