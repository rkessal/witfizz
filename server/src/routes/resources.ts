import express from "express";
const router = express.Router();

import * as controller from "../controllers/resources";

router.get("/", controller.getAllResources);
router.post("/", controller.createResource);
router.put("/:id", controller.updateResource);
router.delete("/:id", controller.deleteResource);

export default router; 