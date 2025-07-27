import type {Request, Response} from 'express';
import {Types} from 'mongoose';
import type {IApiResponse, IEventDocument, AuthenticatedUser} from '../types/common';
import Event from '../models/Event.js';
import User from '../models/User.js';

interface PredefinedLocation {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  isPredefined: boolean;
}

interface CreateEventRequest {
  title: string;
  description: string;
  startTime: string | Date;
  endTime?: string | Date;
  locationName: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  isPredefined?: boolean;
}

interface UpdateEventRequest {
  title?: string;
  description?: string;
  startTime?: string | Date;
  endTime?: string | Date;
  locationName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  isPredefined?: boolean;
}

interface EventUser {
  _id: string;
  username: string;
  avatar: string;
}

interface EventResponse {
  _id: string;
  creator: EventUser;
  title: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  locationName: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  isPredefined: boolean;
  participants: EventUser[];
  createdAt: Date;
  updatedAt: Date;
}

// Remove custom Request interface - use standard Express Request type

interface ErrorResponse {
  success?: false;
  message: string;
  error?: string;
}

// Predefined locations (as discussed in the plan)
// In a real application, these might come from a database or a configuration file
const predefinedLocations: PredefinedLocation[] = [
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
export const getPredefinedLocations = async (req: Request<{}, PredefinedLocation[] | ErrorResponse, {}>, res: Response<PredefinedLocation[] | ErrorResponse>): Promise<void> => {
  try {
    res.status(200).json(predefinedLocations);
  } catch (error) {
    res.status(500).json({message: 'Error fetching predefined locations', error: (error as Error).message});
  }
};

// Create a new event
export const createEvent = async (req: Request<{}, EventResponse, CreateEventRequest>, res: Response<EventResponse | ErrorResponse>): Promise<void> => {
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
      res.status(400).json({
        message: 'Missing required event fields (title, description, startTime, locationName).',
      });
      return;
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
        eventLocation = {
          locationName: chosenLocation.name,
          address: chosenLocation.address,
          latitude: chosenLocation.latitude,
          longitude: chosenLocation.longitude,
          isPredefined: chosenLocation.isPredefined
        }; // Use all details from predefined
      } else if (!latitude || !longitude) {
        // If isPredefined is true but not found in our list, and no coords provided, it's an issue
        // Or, allow custom 'predefined-like' entries if coords are given
        res.status(400).json({message: 'Selected predefined location not found or missing coordinates.'});
        return;
      }
    } else if (!isPredefined && (!latitude || !longitude)) {
      // For non-predefined, we might still want coordinates, but for now, make them optional
      // Or enforce them if a map-like feature is intended for custom locations too
    }

    const newEvent = new Event({
      creator: new Types.ObjectId(req.user?.id), // Assuming req.user is populated by auth middleware
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

    if (!populatedEvent) {
      res.status(500).json({message: 'Error creating event'});
      return;
    }

    res.status(201).json(populatedEvent as unknown as EventResponse);
  } catch (error) {
    res.status(500).json({message: 'Error creating event', error: (error as Error).message});
  }
};

// Get all events
export const getAllEvents = async (req: Request<{}, EventResponse[] | ErrorResponse, {}>, res: Response<EventResponse[] | ErrorResponse>): Promise<void> => {
  try {
    const events = await Event.find()
      .populate('creator', 'username avatar')
      .populate('participants', 'username avatar')
      .sort({startTime: 1}); // Sort by upcoming first
    res.status(200).json(events as unknown as EventResponse[]);
  } catch (error) {
    res.status(500).json({message: 'Error fetching events', error: (error as Error).message});
  }
};

// Get a single event by ID
export const getEventById = async (req: Request<{
  eventId: string
}, EventResponse>, res: Response<EventResponse | ErrorResponse>): Promise<void> => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate('creator', 'username avatar')
      .populate('participants', 'username avatar');
    if (!event) {
      res.status(404).json({message: 'Event not found'});
      return;
    }
    res.status(200).json(event as unknown as EventResponse);
  } catch (error) {
    res.status(500).json({message: 'Error fetching event', error: (error as Error).message});
  }
};

// Update an event
export const updateEvent = async (req: Request<{
  eventId: string
}, EventResponse, UpdateEventRequest>, res: Response<EventResponse | ErrorResponse>): Promise<void> => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      res.status(404).json({message: 'Event not found'});
      return;
    }

    if (event.creator.toString() !== req.user?.id) {
      res.status(403).json({message: 'User not authorized to update this event'});
      return;
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
    if (startTime) event.startTime = new Date(startTime);
    event.endTime = endTime ? new Date(endTime) : undefined; // Allow unsetting endTime

    // Location update logic
    if (locationName) event.locationName = locationName;
    if (address) event.address = address;
    if (latitude) event.latitude = latitude;
    if (longitude) event.longitude = longitude;
    if (typeof isPredefined === 'boolean') event.isPredefined = isPredefined;

    event.updatedAt = new Date();
    await event.save();
    const populatedEvent = await Event.findById(event._id)
      .populate('creator', 'username avatar')
      .populate('participants', 'username avatar');

    if (!populatedEvent) {
      res.status(500).json({message: 'Error updating event'});
      return;
    }

    res.status(200).json(populatedEvent as unknown as EventResponse);
  } catch (error) {
    res.status(500).json({message: 'Error updating event', error: (error as Error).message});
  }
};

// Delete an event
export const deleteEvent = async (req: Request<{ eventId: string }>, res: Response<{
  message: string;
  error?: string
}>): Promise<void> => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      res.status(404).json({message: 'Event not found'});
      return;
    }

    if (event.creator.toString() !== req.user?.id) {
      res.status(403).json({message: 'User not authorized to delete this event'});
      return;
    }

    await event.deleteOne();
    res.status(200).json({message: 'Event deleted successfully'});
  } catch (error) {
    res.status(500).json({message: 'Error deleting event', error: (error as Error).message});
  }
};

// Toggle participation in an event (Join/Leave)
export const toggleEventParticipation = async (req: Request<{
  eventId: string
}>, res: Response<EventResponse | ErrorResponse>): Promise<void> => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      res.status(404).json({message: 'Event not found'});
      return;
    }

    const userId = req.user?.id;
    const participantIndex = event.participants.findIndex((pId: Types.ObjectId) => pId.toString() === userId);

    if (participantIndex > -1) {
      // User is already a participant, so leave
      event.participants.splice(participantIndex, 1);
    } else {
      // User is not a participant, so join
      event.participants.push(new Types.ObjectId(userId));
    }

    await event.save();
    const populatedEvent = await Event.findById(event._id)
      .populate('creator', 'username avatar')
      .populate('participants', 'username avatar');

    if (!populatedEvent) {
      res.status(500).json({message: 'Error toggling event participation'});
      return;
    }

    res.status(200).json(populatedEvent as unknown as EventResponse);
  } catch (error) {
    res.status(500).json({message: 'Error toggling event participation', error: (error as Error).message});
  }
};
