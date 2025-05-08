import Note from "../models/note.model.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

// Create a new note
export const createNote = catchAsync(async (req, res, next) => {
  const { title, content } = req.body;
  const userId = req.user._id;

  const note = new Note({
    title,
    content,
    userId,
  });

  await note.save();
  res.status(201).json({
    status: "success",
    data: note,
  });
});

// Get all notes for the authenticated user
export const getNotes = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const notes = await Note.find({ userId });
  res.status(200).json({
    status: "success",
    data: notes,
  });
});

// Get a single note by ID
export const getNoteById = catchAsync(async (req, res, next) => {
  const note = await Note.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!note) {
    return next(new AppError("Note not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: note,
  });
});

// Update a note
export const updateNote = catchAsync(async (req, res, next) => {
  const { title, content, isArchived } = req.body;
  const note = await Note.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!note) {
    return next(new AppError("Note not found", 404));
  }

  if (title) note.title = title;
  if (content) note.content = content;
  if (typeof isArchived === "boolean") note.isArchived = isArchived;

  await note.save();
  res.status(200).json({
    status: "success",
    data: note,
  });
});

// Delete a note
export const deleteNote = catchAsync(async (req, res, next) => {
  const note = await Note.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!note) {
    return next(new AppError("Note not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: null,
  });
});
