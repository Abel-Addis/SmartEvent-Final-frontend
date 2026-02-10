# Convene Frontend

A modern, robust frontend for the **Convene** Event Management System. Built with **Vue 3** and **Vite**, this application provides a seamless experience for Attendees, Organizers, Gatepersons, and Administrators.

## 🚀 Overview

This project serves as the user interface for a comprehensive event management platform. It facilitates the entire event lifecycle, from creation and promotion to ticketing and real-time check-ins.

### Key Features

- **👥 Multi-Role Support**: Tailored interfaces for **Admins**, **Organizers**, **Attendees**, and **Gatepersons**.
  - **Admins**: System-wide management, category control, and platform oversight.
  - **Organizers**: intricate dashboard for creating events, managing tickets, viewing analytics, and handling promotions (boosts/credits).
  - **Attendees**: Browse events, purchase tickets, manage profiles, and view booking history.
  - **Gatepersons**: Dedicated tools for validating tickets and managing entry.
- **🎫 Ticketing & Entry**:
  - QR Code generation for tickets.
  - **HTML5-QRCode** integration for efficient ticket scanning and validation.
- **📍 Interactive Maps**: **Leaflet** integration to visualize event locations and venue details.
- **📊 Analytics & Dashboards**:
  - Data visualization using **Chart.js** for organizers to track sales and engagement.
- **🔔 Real-Time Updates**: **SignalR** integration for live notifications and status updates.
- **📱 Responsive Design**: Fully responsive UI built with **Tailwind CSS**, ensuring a great experience on desktop, tablet, and mobile (PWA-ready).
- **🔐 Secure Authentication**: Robust auth flow with JWT handling and role-based access control (RBAC).

## 🛠️ Tech Stack

- **Core Framework**: [Vue.js 3](https://vuejs.org/) (Composition API)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Routing**: [Vue Router](https://router.vuejs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Validation**: [Vee-Validate](https://vee-validate.logaretm.com/) & [Yup](https://github.com/jquense/yup)
- **Maps**: Leaflet / Vue-Leaflet
- **Charts**: Chart.js / Vue-Chartjs
- **Real-time**: Microsoft SignalR

## 🔧 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- **Node.js** (v16.0.0 or higher recommended)
- **npm** or **yarn**

### Installation

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/your-username/SmartEventV1-main.git
    cd SmartEventV1-main
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory (or copy `.env.example`).

    ```env
    VITE_API_BASE_URL=http://localhost:5000/api  # Example Backend URL
    ```

4.  **Run the application**:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173` (or the port shown in your terminal).

## 📂 Project Structure

```bash
src/
├── assets/         # Static assets (images, fonts)
├── components/     # Reusable Vue components
├── composables/    # Shared logic (Vue Composables)
├── layouts/        # Layout wrappers (Auth, Dashboard, etc.)
├── router/         # Vue Router configuration
├── services/       # API service modules (Axios calls)
├── stores/         # Pinia state stores
├── views/          # Page components (Admin, Attendee, etc.)
└── utils/          # Helper functions
```

## 🔗 Backend Reference

This frontend is designed to work with the **Convene Backend**.
Backend Repository: [Convene Backend](https://github.com/NATANN-M/Convene-Backend.git)

## 📜 License
