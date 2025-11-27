 //If we are in production (Vercel), use the Environment Variable.
// If we are local, use localhost.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";