import express from "express";
const router = express.Router();

import * as controller from "../controllers/bbb";

router.post("/create-room", controller.createRoom);
router.get("/check-rooms", controller.checkRooms);
router.post("/join-room", controller.joinRoom);

export default router