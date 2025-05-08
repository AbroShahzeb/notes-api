import express from "express";
import {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
} from "../controllers/notes.controller.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = express.Router();

// All routes are protected and require authentication
router.use(authorize);

// Create a new note
router.post("/", createNote);

// Get all notes for the authenticated user
router.get("/", getNotes);

// Get a single note by ID
router.get("/:id", getNoteById);

// Update a note
router.patch("/:id", updateNote);

// Delete a note
router.delete("/:id", deleteNote);

export default router;
