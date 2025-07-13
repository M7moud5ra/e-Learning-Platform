import { Router } from "express";
import {
  createPaymentRequest,
  getPendingPaymentRequests,
  approvePaymentRequest,
  rejectPaymentRequest,
  getStudentPaymentRequests
} from "../controllers/paymentRequest.controller.js";
import { authSTD } from "../middlewares/stdAuth.middleware.js";
import { authAdmin } from "../middlewares/adminAuth.middleware.js";

const router = Router();

// Student routes
router.route("/create").post(authSTD, createPaymentRequest);
router.route("/my-requests").get(authSTD, getStudentPaymentRequests);

// Admin routes
router.route("/pending").get(authAdmin, getPendingPaymentRequests);
router.route("/approve/:requestID").post(authAdmin, approvePaymentRequest);
router.route("/reject/:requestID").post(authAdmin, rejectPaymentRequest);

export default router;