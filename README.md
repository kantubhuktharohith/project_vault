# ⚡ Project Vault (`project_vault`)

> A modern, retro-terminal styled personal bookmark vault and link manager for developer projects, live web applications, and GitHub repositories.

![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)
![TanStack Start](https://img.shields.io/badge/TanStack_Start-1.168-ff4154?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-38bdf8?style=flat-square&logo=tailwindcss)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pg-336791?style=flat-square&logo=postgresql)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## 🌟 Overview

**Project Vault** is an offline-first, database-backed web application designed for developers to organize, showcase, filter, and back up all the projects they have shipped or built. Featuring a sleek, dark retro-terminal interface, Project Vault provides full control over your project links, live deployments, repository URLs, stack tags, and media previews.

---

## 🔥 Key Features

- 🖥️ **Retro Terminal Aesthetic**: Modern dark UI inspired by developer terminals, complete with green/cyan accents, crisp typography, and responsive micro-interactions.
- 🗂️ **Project Management**: Add, edit, remove, and showcase projects with titles, descriptions, live URLs, GitHub repository links, image previews, and technology stack tags.
- 🏷️ **Categorization & Real-time Search**: Instant full-text search across titles, descriptions, and technology stacks, with category tab filtering (e.g., *AI Projects*, *Hardcoded Projects*, *All*).
- 🔒 **Admin Mode**: Secure HMAC cookie-authenticated session system allowing authorized project creation, editing, and deletion.
- 📦 **Data Import & Export**: One-click JSON backup export and seamless JSON restoring to preserve your portfolio metadata anywhere.
- ⚡ **Full-Stack Performance**: Powered by **TanStack Start** (SSR/SSG), **TanStack Router**, **React 19**, and **PostgreSQL** via `pg`.

---

## 🛠️ Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Framework** | [TanStack Start](https://tanstack.com/start) / [TanStack Router](https://tanstack.com/router) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Radix UI Primitives |
| **Database** | [PostgreSQL](https://www.postgresql.org/) (via `pg` pool with fallback support) |
| **Icons & Notifications** | [Lucide React](https://lucide.dev/) & [Sonner](https://sonner.embla.com/) |
| **Validation & State** | [Zod](https://zod.dev/) & custom React hooks |
| **Build Tooling** | [Vite 8](https://vitejs.dev/) & TypeScript 5 |

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) or `bun` / `pnpm`
- A [PostgreSQL](https://www.postgresql.org/) database instance (e.g., Supabase, Neon, or local Postgres)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/project-vault.git
   cd project-vault
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory (or copy from `.env.example`):
   ```env
   # PostgreSQL Connection String
   DATABASE_URL=postgresql://user:password@host:5432/dbname

   # Admin Secret Password for Vault Management
   ADMIN_PASSWORD=your-secure-admin-password
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000` (or the port specified in terminal output).

---

## 📜 Available Scripts

In the project directory, you can run:

- `npm run dev` — Starts the development server with Hot Module Replacement (HMR).
- `npm run build` — Builds the application for production deployment.
- `npm run preview` — Locally previews the built production application.
- `npm run lint` — Runs ESLint checks across the codebase.
- `npm run format` — Formats files with Prettier.

---


## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues page](https://github.com/your-username/project-vault/issues).

---

## 📝 License

This project is [MIT](LICENSE) licensed.

