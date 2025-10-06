# Project Structure

- app/layout.tsx
  - Root layout. Wraps the app with ThemeProvider to enable dark/light theme used by the Topbar and shadcn/ui.
  - Dashboard shell. Provides a responsive layout with a collapsible Sidebar and a sticky Topbar.
  - Uses shadcn/ui SidebarProvider/SidebarInset to keep content width stable and avoid layout shifting.
- components/app-sidebar.tsx
  - Sidebar composition using shadcn/ui sidebar primitives. 
  - Edit `mainNav` and `systemNav` arrays to add links (icon, title, href).
- components/app-topbar.tsx
  - Topbar with Sidebar trigger, theme toggle, notifications, and account logo.
- components/ui/*
  - shadcn/ui primitives (button, input, dropdown-menu, sidebar, etc.). Avoid editing these; compose higher-level components instead.
- pages and feature routes (e.g., app/users, app/transactions)
  - Render inside the dashboard shell automatically when placed under `app/(dashboard)/*`.

## Extending the Navigation

- Add or remove items in `mainNav` / `systemNav` inside `components/app-sidebar.tsx`.
- Icons come from `lucide-react`. Import the icon and reference it in the item.

## Design and Accessibility

- Uses semantic tokens: `bg-background`, `text-foreground`, `border-border` for consistent theming.
- Mobile-first layout with flex; Sidebar collapses to icons on smaller screens and Topbar remains sticky for quick access.
- All actionable controls include appropriate `aria-label`s or screen-reader text.

## Installation setup

- clone this project from github link:  `https://github.com/sivaraman123456/User_admin_dashboard`
- Install command: `npm install --force`
- run command : `npm run dev`


