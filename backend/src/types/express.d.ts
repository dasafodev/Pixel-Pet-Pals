// Express type extensions for Pixel Pet Pals

import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedUser } from './common.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      io?: SocketIOServer;
    }
  }
}

// Multer file type extensions
export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

declare global {
  namespace Express {
    interface Request {
      file?: MulterFile;
      files?: MulterFile[] | { [fieldname: string]: MulterFile[] } | undefined;
    }
  }
}
