import express from "express";
import { 
	getMessages, 
	sendMessage, 
	deleteMessage, 
	editMessage, 
	addReaction, 
	removeReaction 
} from "../controllers/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.delete("/:messageId", protectRoute, deleteMessage);
router.put("/:messageId", protectRoute, editMessage);
router.post("/:messageId/reaction", protectRoute, addReaction);
router.delete("/:messageId/reaction", protectRoute, removeReaction);

export default router;
