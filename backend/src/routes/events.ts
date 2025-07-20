import express from 'express';
import * as eventController from '../controllers/eventController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/events/locations/predefined
// @desc    Get predefined locations for events
// @access  Public (or Private if only for logged-in users)
router.get('/locations/predefined', eventController.getPredefinedLocations); // Add authMiddleware if needed

// @route   POST api/events
// @desc    Create a new event
// @access  Private
router.post('/', protect, eventController.createEvent);

// @route   GET api/events
// @desc    Get all events
// @access  Public (or Private)
router.get('/', eventController.getAllEvents); // Add authMiddleware if needed

// @route   GET api/events/:eventId
// @desc    Get a single event by ID
// @access  Public (or Private)
router.get('/:eventId', eventController.getEventById); // Add authMiddleware if needed

// @route   PUT api/events/:eventId
// @desc    Update an event
// @access  Private
router.put('/:eventId', protect, eventController.updateEvent);

// @route   DELETE api/events/:eventId
// @desc    Delete an event
// @access  Private
router.delete('/:eventId', protect, eventController.deleteEvent);

// @route   POST api/events/:eventId/participate
// @desc    Toggle participation in an event (join/leave)
// @access  Private
router.post('/:eventId/participate', protect, eventController.toggleEventParticipation);

export default router;