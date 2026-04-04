/**
 * Auth.js v5 route handler.
 * Exports GET and POST from the `handlers` object created by NextAuth().
 * This handles all /api/auth/* endpoints automatically:
 *   /api/auth/signin, /api/auth/signout, /api/auth/session, /api/auth/csrf, etc.
 */
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
