// Socket.IO event type definitions

export interface ServerToClientEvents {
  'private-message': (message: {
    _id: string;
    sender: string;
    recipient: string;
    content: string;
    read: boolean;
    createdAt: Date;
  }) => void;
  typing: (data: { sender: string }) => void;
  'stop-typing': (data: { sender: string }) => void;
  'friend-accepted': () => void;
  error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  join: (userId: string) => void;
  'private-message': (data: { sender: string; recipient: string; content: string }) => void;
  typing: (data: { sender: string; recipient: string }) => void;
  'stop-typing': (data: { sender: string; recipient: string }) => void;
}

export interface InterServerEvents {
  // For scaling with multiple servers (if needed later)
}

export interface SocketData {
  userId?: string;
  username?: string;
}
