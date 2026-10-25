# Project Vault

Personal project vault and link manager application.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

### Database

This project uses **SQLite** for local storage (`vault.db`), powered by `better-sqlite3`. The database and tables are created automatically on first run. You can configure the path via `DATABASE_PATH` in `.env`.

## Built with

- TanStack Start
- TypeScript
- React
- SQLite (`better-sqlite3`)
- Tailwind CSS
