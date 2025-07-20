const Event = require('../models/Event');
const User = require('../models/User'); // To populate user details

// Predefined locations (as discussed in the plan)
// In a real application, these might come from a database or a configuration file
const predefinedLocations = [
  {
    name: 'Central Park - Great Lawn',
    address: 'Mid-Park between 79th and 85th Streets, New York, NY',
    latitude: 40.7812,
    longitude: -73.9665,
    isPredefined: true,
  },
  {
    name: 'Prospect Park - Long Meadow',
    address: 'Prospect Park West, Brooklyn, NY',
    latitude: 40.6602,
    longitude: -73.969,
    isPredefined: true,
  },
  {
    name: 'Washington Square Park',
    address: '5 Ave, Waverly Pl, W 4th St and Macdougal St, New York, NY',
    latitude: 40.7308,
    longitude: -73.9973,
    isPredefined: true,
  },
  {
    name: 'Union Square Park',
    address: 'E 14th St & Broadway, New York, NY',
    latitude: 40.7359,
    longitude: -73.9905,
    isPredefined: true,
  },
  {
    name: 'Bryant Park',
    address: 'New York, NY 10018 (Between 5th and 6th Avenues, and 40th and 42nd Streets)',
    latitude: 40.7536,
    longitude: -73.9832,
    isPredefined: true,
  },
];

// Get predefined locations
exports.getPredefinedLocations = async (req, res) => {
  try {
    res.status(200).json(predefinedLocations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching predefined locations', error: error.message });
  }
};

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      locationName,
      address,
      latitude,
      longitude,
      isPredefined,
    } = req.body;

    if (!title || !description || !startTime || !locationName) {
      return res
        .status(400)
        .json({
          message: 'Missing required event fields (title, description, startTime, locationName).',
        });
    }

    // Validate if a predefined location is chosen, its details should match or be provided
    let eventLocation = {
      locationName,
      address,
      latitude,
      longitude,
      isPredefined: !!isPredefined,
    };

    if (isPredefined && locationName) {
      const chosenLocation = predefinedLocations.find(loc => loc.name === locationName);
      if (chosenLocation) {
        eventLocation = { ...chosenLocation }; // Use all details from predefined
      } else if (!latitude || !longitude) {
        // If isPredefined is true but not found in our list, and no coords provided, it's an issue
        // Or, allow custom 'predefined-like' entries if coords are given
        return res
          .status(400)
          .json({ message: 'Selected predefined location not found or missing coordinates.' });
      }
    } else if (!isPredefined && (!latitude || !longitude)) {
      // For non-predefined, we might still want coordinates, but for now, make them optional
      // Or enforce them if a map-like feature is intended for custom locations too
    }

    const newEvent = new Event({
      creator: req.user.id, // Assuming req.user is populated by auth middleware
      title,
      description,
      startTime,
      endTime,
      ...eventLocation, // Spread the determined location details
    });

    await newEvent.save();
    const populatedEvent = await Event.findById(newEvent._id)
      .populate('creator', 'username avatar')
      .populate('participants', 'username avatar');
    res.status(201).json(populatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('creator', 'username avatar')
      .populate('participants', 'username avatar')
      .sort({ startTime: 1 }); // Sort by upcoming first
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};

// Get a single event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate('creator', 'username avatar')
      .populate('participants', 'username avatar');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to update this event' });
    }

    const {
      title,
      description,
      startTime,
      endTime,
      locationName,
      address,
      latitude,
      longitude,
      isPredefined,
    } = req.body;

    if (title) event.title = title;
    if (description) event.description = description;
    if (startTime) event.startTime = startTime;
    event.endTime = endTime; // Allow unsetting endTime

    // Location update logic
    if (locationName) event.locationName = locationName;
    if (address) event.address = address;
    if (latitude) event.latitude = latitude;
    if (longitude) event.longitude = longitude;
    if (typeof isPredefined === 'boolean') event.isPredefined = isPredefined;

    event.updatedAt = Date.now();
    await event.save();
    const populatedEvent = await Event.findById(event._id)
      .populate('creator', 'username avatar')
      .populate('participants', 'username avatar');
    res.status(200).json(populatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error updating event', error: error.message });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to delete this event' });
    }

    await event.deleteOne();
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
};

// Toggle participation in an event (Join/Leave)
exports.toggleEventParticipation = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const userId = req.user.id;
    const participantIndex = event.participants.findIndex(pId => pId.toString() === userId);

    if (participantIndex > -1) {
      // User is already a participant, so leave
      event.participants.splice(participantIndex, 1);
    } else {
      // User is not a participant, so join
      event.participants.push(userId);
    }

    await event.save();
    const populatedEvent = await Event.findById(event._id)
      .populate('creator', 'username avatar')
      .populate('participants', 'username avatar');
    res.status(200).json(populatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling event participation', error: error.message });
  }
};
