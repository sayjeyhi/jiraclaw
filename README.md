# Start Postgres

docker compose up -d

# Run migrations

bun run prisma:migrate:dev

# Seed (optional, after first migration)

bun run prisma:seed

# Start dev server

bun run dev
