🎟️ SeatSync - Real-Time Event Booking System

SeatSync is a full-stack MERN application that handles high-concurrency ticket reservations. It uses WebSockets for real-time updates and atomic database transactions to prevent double-booking.

🚀 Tech Stack

Frontend: React + Vite, Tailwind CSS (Custom), Socket.io Client

Backend: Node.js, Express, Socket.io

Database: MongoDB (Mongoose)

Auth: Clerk (Secure Authentication)

Notifications: React Hot Toast, Email confirmations via Nodemailer

✨ Key Features

Real-Time Sync: When a user selects a seat, it turns "Held" for everyone else instantly.

Concurrency Control: Uses MongoDB atomic findOneAndUpdate to prevent race conditions.

Hold Timer: Seats are held for 10 minutes before being automatically released by a background "Janitor" service.

Admin Dashboard: Protected route to reset the simulation.

Responsive Design: Works on Mobile and Desktop.

🛠️ Installation & Setup

Prerequisites:

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Clerk account for authentication

1. Clone the repository

```bash
git clone <repository-url>
cd seatSync
```

2. Backend Setup

```bash
cd backend
npm install

# Create a .env file in the backend directory with:
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

npm run dev
```

3. Frontend Setup

```bash
cd ../seatsync-frontend
npm install

# Create a .env.local file in the seatsync-frontend directory with:
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

npm run dev
```

🧪 How to Test

# Here is a live website url fell free to check it out 👇👇

[Live Website](https://cinema-plus-delta.vercel.app)

Open http://localhost:5173.

Log in (Google/Email).

Click a Green seat to hold it (Turns Orange).

Open a second browser window (Incognito) to see the update in real-time.

Click Pay Now to finalize the booking (Turns Red).

Go to /admin to reset the theater.

📂 Project Structure

**Backend (Node.js/Express):**

- `backend/src/controllers/`: Request handling and Socket emitting
- `backend/src/models/`: Mongoose schemas for Events and Seats
- `backend/src/routes/`: API route definitions
- `backend/src/services/`: Business logic (Booking, Holding, releasing, cleanup)
- `backend/src/middleware/`: Authentication middleware
- `backend/src/utils/`: Utility functions

**Frontend (React/Vite):**

- `seatsync-frontend/src/components/`: Reusable UI components (Navbar, SeatMap, TicketForm, etc.)
- `seatsync-frontend/src/pages/`: React pages (LandingPage, Events, Bookingpage, Adminpage, etc.)
- `seatsync-frontend/src/assets/`: Images and static assets
- `seatsync-frontend/public/`: Public assets and PWA files

Built  by Pattin🌀
