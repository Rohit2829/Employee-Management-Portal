/**
 * routes/index.ts - Standalone API routing map
 * Exposes ONLY the Employee CRUD and Health/Rotation routes.
 */

import { Router } from "express";
import {
  getEmployees,
  addEditEmployee,
  getSpecificEmployee,
  deleteEmployee,
  getDashboardStats,
  getDynamicChartData,
} from "../controllers/employeeController";
import {
  getHealthRecords,
  addHealthRecord,
  deleteHealthRecord,
  getJobRotationSuggestions,
  executeJobRotation,
  revertTemporarySwap,
  getRotationAuditTrail,
  respondToAutomatedRecommendation,
  getSickLeaves,
  addSickLeave,
  getSymptomImpactTrend,
  runSchedulerSimulation,
} from "../controllers/healthController";
import { login } from "../controllers/authController";
import { verifyToken } from "../middlewares/authMiddleware";
 
import passport from "passport";
import { oauthCallback } from "../controllers/oauthController";
 
const router = Router();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
 
// Public Authentication Route
router.post("/login", login);
 
// OAuth 2.0 Routes
router.get("/auth/microsoft", passport.authenticate("microsoft", { scope: ["openid", "profile", "email", "user.read"], prompt: "select_account" }));
router.get("/auth/microsoft/callback", (req, res, next) => {
  console.log("Passport authenticate callback details:", { err: null, user: null, info: null });
  passport.authenticate("microsoft", { session: false }, (err: any, user: any, info: any) => {
    console.log("Passport authenticate callback details:", { err, user, info });
    if (err) {
      console.error("Passport authentication error:", err);
      return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(err.message || 'AuthError')}`);
    }
    if (!user) {
      console.warn("Passport login rejected:", info);
      return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(info?.message || 'Unauthorized')}`);
    }
    req.user = user;
    next();
  })(req, res, next);
}, oauthCallback);
 
// Employee CRUD API Endpoints (Protected by JWT)
router.post("/getEmployeeList", verifyToken, getEmployees);
router.post("/addEditEmployee", verifyToken, addEditEmployee);
router.post("/getSpecificEmployee", verifyToken, getSpecificEmployee);
router.post("/deleteEmployee", verifyToken, deleteEmployee);
router.post("/getDashboardStats", verifyToken, getDashboardStats);
router.post("/getDynamicChartData", verifyToken, getDynamicChartData);
router.post("/getHealthRecords", verifyToken, getHealthRecords);
router.post("/addHealthRecord", verifyToken, addHealthRecord);
router.post("/deleteHealthRecord", verifyToken, deleteHealthRecord);
router.post("/getJobRotationSuggestions", verifyToken, getJobRotationSuggestions);
router.post("/executeJobRotation", verifyToken, executeJobRotation);

// New Job Rotation and Health Tracker Endpoints
router.post("/revertTemporarySwap", verifyToken, revertTemporarySwap);
router.post("/getRotationAuditTrail", verifyToken, getRotationAuditTrail);
router.post("/respondToAutomatedRecommendation", verifyToken, respondToAutomatedRecommendation);
router.post("/getSickLeaves", verifyToken, getSickLeaves);
router.post("/addSickLeave", verifyToken, addSickLeave);
router.post("/getSymptomImpactTrend", verifyToken, getSymptomImpactTrend);
router.post("/runSchedulerSimulation", verifyToken, runSchedulerSimulation);

export default router;
