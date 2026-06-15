import type { Role, Status } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
      };
      owningEntity?: {
        id: string;
        status: Status;
      };
    }
  }
}

export {};
