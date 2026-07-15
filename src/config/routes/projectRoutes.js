import express from "express";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectSummary
} from "../controllers/projectController.js";

const router = express.Router();

router.get("/summary", getProjectSummary);
router.get("/", getProjects);
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;
