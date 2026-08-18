# 🚕 CabIndia - Your Trusted Ride Partner

**CabIndia** is a full-stack, multi-platform cab booking and ride-hailing application. It's designed to connect passengers (Customers) with drivers (Captains) seamlessly through a Web App, a Mobile App, and a dedicated Captain App.

This is a monorepo containing the **backend API**, **frontend web dashboard**, and **React Native mobile applications** for both customers and captains.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Table of Contents

-   [🌟 Key Features](#-key-features)
-   [🏗️ Technology Stack](#️-technology-stack)
-   [📂 Project Structure](#-project-structure)
-   [🚀 Getting Started](#-getting-started)
    -   [Prerequisites](#prerequisites)
    -   [Backend Setup](#backend-setup)
    -   [Web App Setup](#web-app-setup)
    -   [Mobile Apps Setup](#mobile-apps-setup)
-   [🔧 Environment Variables](#-environment-variables)
-   [🗄️ Database Setup](#️-database-setup)
-   [🤝 Contributing](#-contributing)
-   [📝 License](#-license)
-   [📞 Support](#-support)

---

## 🌟 Key Features

### For Customers (Riders)
-   **Ride Booking:** Easily book rides by selecting pickup and drop-off locations.
-   **Real-time Tracking:** Track your assigned captain's location on a live map.
-   **Multiple Vehicle Options:** Choose from Auto, Bike, Mini, Sedan, and more.
-   **Secure Payments:** Pay via Cash, UPI, or Cards.
-   **Ride History:** View past rides and trip details.
-   **Captain Rating:** Rate your captain after each trip.

### For Captains (Drivers)
-   **Online/Offline Toggle:** Control your availability to accept rides.
-   **Ride Requests:** Receive and accept or decline real-time ride requests.
-   **GPS Navigation:** Get live turn-by-turn navigation to the customer's pickup location.
-   **Earnings Dashboard:** Track your daily and total earnings.
-   **Ride History:** View your completed and cancelled rides.

### For Admin
-   **Dashboard:** Centralized view of all platform activity.
-   **User & Captain Management:** View, edit, and manage all users and captains.
-   **Ride Oversight:** Monitor all rides and their status.
-   **Support Tickets:** Manage and resolve customer support tickets.

---

## 🏗️ Technology Stack

This project leverages a modern, scalable technology stack:

-   **Frontend (Web):** React, TypeScript, Tailwind CSS, Vite
-   **Mobile (Customer & Captain):** React Native (Expo), React Navigation, Google Maps API
-   **Backend:** Node.js, Express.js
-   **Database:** MySQL
-   **Real-time Communication:** Socket.IO
-   **Authentication:** JWT (JSON Web Tokens)
-   **Deployment:** Netlify (Frontend), Render (Backend)

---

## 📂 Project Structure

The repository is a monorepo containing three core applications:

```
CabIndia-ALLINONE/
├── cabindia-backend/        # Node.js + Express API
│   ├── config/              # Database configuration
│   ├── controllers/         # Business logic for routes
│   ├── middleware/          # Authentication and other middleware
│   ├── models/              # Database models (MySQL queries)
│   ├── routes/              # API endpoint definitions
│   └── server.js            # Application entry point
├── cabindia-web/            # React + TypeScript Web App
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page-level components (Login, Dashboard, etc.)
│   │   ├── context/         # React Context for state management
│   │   ├── services/        # API calls and utilities
│   │   ├── App.tsx          # Main app router
│   │   └── main.tsx         # Application entry point
│   ├── public/              # Static assets
│   ├── index.html
│   └── package.json
├── cabindia-mobile/         # React Native (Expo) - Customer App
│   ├── src/
│   │   ├── components/
│   │   ├── screens/         # RideBooking, Profile, etc.
│   │   ├── context/         # AuthContext, NotificationContext
│   │   ├── utils/           # API client and helpers
│   │   ├── config.js
│   │   └── App.js
│   ├── assets/              # Images and fonts
│   ├── app.json             # Expo configuration
│   └── package.json
└── cabindia-captain/        # React Native (Expo) - Captain App
    ├── src/
    │   ├── screens/         # Dashboard, Requests, Earnings, etc.
    │   ├── styles/          # Theme configuration
    │   ├── utils/
    │   ├── config.js
    │   └── App.js
    ├── assets/
    ├── app.json
    └── package.json
```

---

## 🚀 Getting Started

Follow these steps to set up the entire project locally.

### Prerequisites

-   **Node.js** (v18 or later)
-   **npm** or **yarn**
-   **MySQL** Server (or a cloud-based MySQL instance like Aiven)
-   **Expo CLI** (for mobile apps)
    ```bash
    npm install -g expo-cli
    ```

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd cabindia-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables:**
    Copy the example environment file and fill in your credentials.
    ```bash
    cp .env.example .env
    ```
    Edit the `.env` file and update the following variables:
    -   `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
    -   `JWT_SECRET`: Generate a strong secret.
    -   `GOOGLE_MAPS_API_KEY`: Your Google Maps API key (for distance calculations).
    -   `EMAIL_USER`, `EMAIL_PASS`: For the contact form email service.

4.  **Initialize the Database:**
    Run the script to create the necessary tables.
    ```bash
    node init-db.js
    ```

5.  **Seed the Database (Optional but recommended):**
    This will create demo users and data for testing.
    ```bash
    npm run seed
    # or
    yarn seed
    ```

6.  **Start the Backend Server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The server will run on `http://localhost:5000`.

---

### Web App Setup

1.  **Navigate to the web app directory:**
    ```bash
    cd cabindia-web
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the `cabindia-web` directory.
    ```env
    VITE_APP_API_URL=http://localhost:5000
    VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
    ```

4.  **Start the Web App:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The app will be available at `http://localhost:5173`.

---

### Mobile Apps Setup

**Note:** Both the Customer (`cabindia-mobile`) and Captain (`cabindia-captain`) apps use a similar setup.

1.  **Navigate to the mobile app directory:**
    ```bash
    cd cabindia-mobile
    # or
    cd cabindia-captain
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Update the API Configuration:**
    The `src/config.js` file imports the `apiUrl` from `app.json` or `Constants.expoConfig`. For local testing, you may need to update the `apiUrl` in `app.json` or directly in `src/config.js` (though it's recommended to use `app.json` for flexibility).
    
    *Temporary fix for local development:* In `src/config.js`, you can change the fallback URL:
    ```javascript
    // src/config.js
    import Constants from 'expo-constants';
    const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://YOUR_LOCAL_IP:5000'; // Use your local IP address
    ```
    **Important:** Use your computer's local IP address (e.g., `http://192.168.1.10:5000`) for the API URL, as `localhost` will not work on an actual device.

4.  **Start the Mobile App:**
    ```bash
    npm start
    # or
    yarn start
    ```
    This will start the Expo development server. You can then scan the QR code with the Expo Go app on your iOS or Android device, or press 'a' to run on an Android emulator or 'i' to run on an iOS simulator.

---

## 🔧 Environment Variables

### Backend (`cabindia-backend/.env`)

```env
# Database
DB_HOST=your-database-host
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=your-db-name
DB_PORT=3306

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Email (for contact form)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Server
PORT=5000
NODE_ENV=development
```

### Web Frontend (`cabindia-web/.env`)

```env
VITE_APP_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## 🗄️ Database Setup

The backend includes scripts to initialize and seed the database with demo data. The MySQL schema consists of the following main tables:

-   `users` (id, name, email, mobile, password, role, created_at)
-   `drivers` (id, user_id, license_number, status, current_lat, current_lon, is_available)
-   `vehicles` (id, driver_id, make, model, license_plate, type)
-   `rides` (id, user_id, driver_id, pickup/dropoff details, status, estimated_price, payment_status)
-   `contact_messages` (id, name, email, mobile, message)
-   `support_tickets` (id, user_id, ticket_id, category, priority, status, description)

To run the initialization and seeding scripts, use the commands provided in the [Backend Setup](#backend-setup) section.

---

## 🤝 Contributing

We welcome contributions to the CabIndia project! To contribute:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix (`git checkout -b feature/your-feature`).
3.  Make your changes and commit them with a clear message (`git commit -m 'Add: New feature description'`).
4.  Push your changes to your forked repository (`git push origin feature/your-feature`).
5.  Create a Pull Request to the `main` branch of this repository.

---

## 📝 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

---

## 📞 Support

For any issues or questions, please reach out to our support team:

-   **Email:** [support@cabindia.in](mailto:support@cabindia.in)
-   **Visit the Website:** [https://cabindia.com](https://cabindia.com)

---

**Developed with ❤️ by First Track Solution Technologies**