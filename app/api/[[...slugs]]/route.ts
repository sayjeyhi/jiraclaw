import { app } from "@/server/app"

export const GET = (request: Request) => app.handle(request)
export const POST = (request: Request) => app.handle(request)
export const PUT = (request: Request) => app.handle(request)
export const DELETE = (request: Request) => app.handle(request)
export const PATCH = (request: Request) => app.handle(request)
