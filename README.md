# Imparo — Back Office Web Dashboard

A robust, localized, and theme-able web dashboard built for the **Imparo Driver Training Registration Platform**. This back-office application enables administrators to view field agent submissions, manage agent profiles, and process driver registration requests securely.

---

## 🚀 Tech Stack

- **Framework**: [React](https://reactjs.org/) (bootstrapped with [Vite](https://vitejs.dev/))
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom SCSS (`index.scss`)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Internationalization (i18n)**: [react-i18next](https://react.i18next.com/)
- **Authentication**: JWT Bearer Tokens stored in `localStorage`

## ✨ Key Features

- **Dual Theme (Light & Dark Mode)**: System default with explicit user toggle support.
- **Bilingual Interface**: Seamless switching between English (EN) and Bulgarian (BG) with real-time UI text rendering.
- **Authentication System**: Secure token-based API communication (`Bearer token` attached to every request based on login state).
- **Responsive Layout**: Designed thoughtfully across mobile, tablet, and desktop views.
- **Dynamic Image Sliders**: Custom aesthetic login/landing pages featuring interactive visuals.

---

## 🛠️ Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v16+ recommended) and `npm` installed.

### Installation

1. Clean install all dependencies:
   ```bash
   npm install
   ```

### Running Locally

To run the development server:
```bash
npm run dev
```

The app will typically be available at `http://localhost:5173`.

### Building for Production

This project is configured to run on shared hosting requiring a statically generated build folder. To generate the production assets:
```bash
npm run build
```
Once completed, the `/dist` directory will contain your static content ready for deployment.

You can preview the production build locally using:
```bash
npm run preview
```

---

## 📂 Project Structure

```text
src/
├── components/       # Reusable UI components (Layouts, AuthProvider, ThemeProvider, etc.)
├── lib/              # Utility configurations (Axios instances, API configs)
├── locales/          # Localization JSON files
│   ├── bg.json       # Bulgarian Dictionary
│   └── en.json       # English Dictionary
├── pages/            # Application routes/pages
│   ├── AgentsPage.tsx
│   ├── DashboardPage.tsx
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   └── SubmissionsPage.tsx
├── App.tsx           # App Router & Root Setup
├── i18n.ts           # i18next initialization and config
├── index.scss        # Global custom SCSS styles and Tailwind directives
└── main.tsx          # React application mount point
```

---

## 🌍 Internationalization (i18n)

The project leverages `react-i18next` utilizing standalone JSON files for dictionary maintenance. 
- **Default Locale**: Bulgarian (`bg`)
- To add or modify translations, edit the explicit key-value pairs inside `src/locales/en.json` and `src/locales/bg.json`.

---

## 🔗 API Connection

The base API URL is statically handled via Axios (located typically in `src/lib/api.ts`). Currently, it points to:
`https://course-in-api.mytextbook.net/api`

The `Accept-Language` header is automatically injected matching the currently selected language, ensuring backend error messages and dynamic content match the frontend preference.

---

## 🎨 Theme Architecture

CSS variables handle the theme engine through Tailwind's utility classes. 
Modifying the raw colors for elements like `--background`, `--foreground`, `--card`, or `--primary` inside `src/index.scss` will automatically propagate UI updates across both Light and Dark themes.
