import type { Role } from "../generated/prisma/client.js";

declare global {
  namespace Express {
    interface Request {
      /** Set by the `authenticate` middleware. */
      user?: {
        id: string;
        email: string;
        name: string | null;
        phone: string | null;
        role: Role;
        createdAt: Date;
      };
      /** Id of the current Session row. */
      sessionId?: string;
    }
  }
}

export {};
