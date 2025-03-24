import express from "express";
const router = express.Router();

import * as controller from "../controllers/user";
import { isAdmin } from "../middleware/auth";

// Public routes
router.get("/", controller.getAllUsers);
router.get("/:projectID", controller.getUsersByProjectID);

// Protected admin routes
router.put("/:userId", isAdmin, controller.updateUser);
router.put("/:userId/password", isAdmin, controller.updateUserPassword);

export default router;