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

```bash
# Navigate to project directory
cd gearguard-cmms

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
gearguard-cmms/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Dashboard home
│   ├── maintenance/       # Maintenance request form
│   ├── equipment/         # Equipment management
│   ├── calendar/          # Maintenance calendar
│   ├── teams/             # Teams management
│   └── reporting/         # Reports & analytics
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── pages/             # Page components
│   └── DashboardLayout.tsx # Global layout wrapper
├── lib/
│   └── utils.ts           # Utility functions
└── public/                # Static assets
```

## 🎯 Key Pages

### Dashboard (`/`)
- Critical equipment alerts (health < 30%)
- Technician capacity utilization (85%)
- Open requests tracker (12 pending, 3 overdue)
- Recent activity table
- Quick stats overview

### Maintenance Request Form (`/maintenance`)
- Interactive stage pipeline
- Equipment selector with auto-fill
- Maintenance type selection (Corrective/Preventive)
- Team and technician assignment
- Scheduled date and duration
- Priority rating (star system)
- Notes with AI summary generation
- Step-by-step instructions

### Equipment Management (`/equipment`)
- Complete equipment inventory
- Serial number tracking
- Department and employee assignments
- Category management
- Equipment health monitoring

### Calendar View (`/calendar`)
- Monthly calendar grid
- Event scheduling
- Preventive maintenance tracking
- Selected date details sidebar
- Upcoming tasks overview

## 🎨 Color Scheme

- **Background**: `#1a1a1a` (Deep charcoal)
- **Cards**: `#0f0f0f` with subtle borders
- **Accents**:
  - Critical/Red: `rgb(239, 68, 68)`
  - Info/Blue: `rgb(59, 130, 246)`
  - Success/Green: `rgb(16, 185, 129)`
  - Warning/Amber: `rgb(245, 158, 11)`
  - Purple: `rgb(168, 85, 247)`

## 🚧 Future Enhancements

- [ ] Backend API integration (Odoo/Custom)
- [ ] Real-time notifications
- [ ] Advanced reporting & analytics
- [ ] Mobile app
- [ ] QR code scanning for equipment
- [ ] Drag-and-drop Kanban board
- [ ] File attachments
- [ ] User authentication
- [ ] Role-based access control
- [ ] Email notifications

## 📝 Notes for Hackathon

This is a **frontend-focused prototype** designed to showcase:
- Modern UX/UI design principles
- Enterprise-grade component architecture
- Responsive and accessible design
- Smart workflows and automation hints
- Professional dark mode implementation

**Perfect for**: Hackathons, client demos, MVP presentations, or as a foundation for a full-stack CMMS application.

## 🤝 Contributing

This is a hackathon project. Feel free to fork and adapt for your needs!

## 📄 License

MIT License - Feel free to use this in your projects.

---

Built with ❤️ using Next.js, Tailwind CSS, and shadcn/ui
