# Digital Wardrobe

Clean Astro project for Digital Wardrobe.

## Project Structure

```text
/
├── src
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

## Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## Database

Digital Wardrobe uses PostgreSQL with Prisma ORM for persistent wardrobe data.

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` to your Postgres connection string.
3. Generate Prisma Client:

```bash
npm run db:generate
```

4. Apply the schema locally:

```bash
npm run db:migrate -- --name init
```

5. Seed the demo wardrobe:

```bash
npm run db:seed
```

Useful database commands:

| Command           | Action                                      |
| :---------------- | :------------------------------------------ |
| `npm run db:generate` | Generate Prisma Client from the schema  |
| `npm run db:migrate`  | Create and apply a development migration |
| `npm run db:push`     | Push schema changes without a migration  |
| `npm run db:seed`     | Seed demo wardrobe data                  |
| `npm run db:studio`   | Open Prisma Studio                       |

## Authentication

Firebase Auth handles sign-in. Client-side Firebase uses the public `PUBLIC_FIREBASE_*` values. Server API routes verify Firebase ID tokens before reading or writing Neon data, so production also needs Firebase Admin service account values:

```bash
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Create these in Firebase Console from Project settings > Service accounts > Generate new private key. Keep them only in `.env` or your hosting provider's secret store.

Check the service account configuration without printing the private key:

```bash
npm run auth:check
```
