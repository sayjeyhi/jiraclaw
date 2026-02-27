import { Elysia } from "elysia";
import { searchSkills } from "@/lib/skills-data";

export const skillsService = new Elysia({ prefix: "/skills" }).get("/", ({ query }) => {
  const q = (query.q as string) ?? "";
  const limit = Math.min(parseInt((query.limit as string) ?? "50", 10) || 50, 100);
  return searchSkills(q, limit);
});
