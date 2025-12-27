# GearGuard CMMS - Maintenance Management System

A modern, feature-rich **Computerized Maintenance Management System (CMMS)** built with Next.js 14, Tailwind CSS, and shadcn/ui components.

## 🚀 Features

### ✅ Implemented Features

- **Modern Dark Theme** - Professional dark mode with deep charcoal backgrounds and vibrant accent colors
- **Dashboard Overview** - Summary cards for critical equipment, technician load, and open requests
- **Maintenance Request Form** - Complete form with:
  - Visual pipeline stepper (New → In Progress → Repaired → Scrap)
  - 2-column layout for organized data entry
  - Auto-fill logic for equipment selection
  - Priority rating system
  - AI-powered note summarization button
  - Tabbed sections for Notes and Instructions
- **Equipment Management** - Full CRUD interface with:
  - Searchable equipment list
  - Equipment categories overview
  - Employee and technician assignments
- **Maintenance Calendar** - Interactive calendar with:
  - Full month view with event indicators
  - Sidebar showing selected date details
  - Color-coded preventive vs corrective maintenance
  - Mini calendar and legend

### 🎨 Design Features

- **Responsive Layout** - Works perfectly on desktop, tablet, and mobile
- **Global Navigation** - Persistent top nav with breadcrumbs
- **Smart Search** - Global search bar with QR code scanner integration
- **Professional UI Components** - Using shadcn/ui for consistency
- **Smooth Animations** - Thoughtful transitions and hover states
- **Color-Coded Status** - Visual indicators for priorities and stages

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Dark Mode**: Default dark theme optimized for enterprise use

## 📦 Installation
# GearGuard — Maintenance Management Frontend

This repository contains the frontend prototype for GearGuard, a Computerized Maintenance Management System (CMMS). It provides an interactive user interface for tracking equipment, managing maintenance requests, scheduling preventive work, and monitoring technician load.

This frontend was developed as a hackathon prototype and is optimized for demonstration and rapid iteration.

## Key Features

- Dashboard with operational metrics (critical equipment, technician utilization, open requests)
- Maintenance request form with stage pipeline and scheduling
- Equipment inventory and category management
- Calendar view for preventive maintenance scheduling
- Reusable component library based on Radix and Tailwind CSS

## Technology Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Radix UI primitives (shadcn/ui-style components)
- Lucide icons

## Quick Start (Development)

1. Install dependencies:

```bash
cd /home/Luffyy/Desktop/Projects/gearguard-cmms
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the app at: `http://localhost:3000`

## Project Structure

```
gearguard-cmms/
├── app/            # Next.js app routes and pages
├── components/     # Reusable UI components and page components
├── lib/            # Utility functions
├── public/         # Static assets
├── package.json
└── README.md
```

## Recommended Workflow for Hackathon Collaboration

- Work on a feature branch and push changes to the remote branch (for example: `frontend/gearguard-cmms`).
- Open a pull request when ready for review or demo.
- Use small, focused commits and descriptive commit messages.

## Next Steps and Integration

The frontend is a prototype and can be integrated with a backend service (for example, Odoo or a custom API) to persist equipment and request data. Suggested next steps:

- Add REST or GraphQL API endpoints for equipment and requests
- Implement authentication and role-based access control
- Add persistence for calendar events and notifications

## License

This project is provided under the MIT License.

---

For questions or to request backend scaffolding, open an issue or contact the project maintainer.
- **Accents**:
