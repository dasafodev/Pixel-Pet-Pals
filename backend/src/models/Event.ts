import { model, type Model, Schema } from 'mongoose';
import type { IEventDocument } from '../types/common';

// Event model interface
interface IEventModel extends Model<IEventDocument> {}

const eventSchema = new Schema<IEventDocument>(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    locationName: {
      type: String,
      required: true,
    },
    address: {
      // Optional, can be a general description or specific address
      type: String,
    },
    latitude: {
      // For predefined locations
      type: Number,
    },
    longitude: {
      // For predefined locations
      type: Number,
    },
    isPredefined: {
      // To identify if the location was from our predefined list
      type: Boolean,
      default: false,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
); // timestamps will automatically manage createdAt and updatedAt

// Create and export the model
const Event: IEventModel = model<IEventDocument, IEventModel>('Event', eventSchema);

export default Event;
export type { IEventDocument };
