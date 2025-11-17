import { Router } from "express";
import auth from "../middleware/authMiddleware.js";
import { sendMail, listMails } from "../controllers/mailController.js";

const router = Router();

router.post("/send", auth, sendMail);
router.get("/list", auth, listMails);

export default router;
