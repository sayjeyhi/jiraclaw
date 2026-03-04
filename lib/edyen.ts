import { treaty } from "@elysiajs/eden";
import type { App } from "@/server/app";

// .api to enter /api prefix
export const api = treaty<App>("localhost:3000").api;
