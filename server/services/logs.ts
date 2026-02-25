import { Elysia, t } from "elysia"
import { db } from "../db"

export const logsService = new Elysia({ prefix: "/logs", aot: false })
  .get(
    "/",
    ({ query }) => {
      let entries = [...db.logs]

      if (query.service) {
        entries = entries.filter((e) => e.service === query.service)
      }
      if (query.level) {
        entries = entries.filter((e) => e.level === query.level)
      }
      if (query.repo) {
        entries = entries.filter((e) => e.repoName === query.repo)
      }
      if (query.search) {
        const s = query.search.toLowerCase()
        entries = entries.filter((e) => e.message.toLowerCase().includes(s))
      }

      const page = Number(query.page ?? 1)
      const perPage = Number(query.perPage ?? 25)
      const total = entries.length
      const paged = entries.slice((page - 1) * perPage, page * perPage)

      return { data: paged, total, page, perPage }
    },
    {
      query: t.Object({
        service: t.Optional(t.String()),
        level: t.Optional(t.String()),
        repo: t.Optional(t.String()),
        search: t.Optional(t.String()),
        page: t.Optional(t.String()),
        perPage: t.Optional(t.String()),
      }),
    }
  )
