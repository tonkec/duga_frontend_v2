# Duga App

- A modern dating application designed to connect people through common interests, fun features, and a seamless user experience. This app allows users to create profiles, chat with matches, and explore unique ways to interact, such as sharing photos, favorite songs, and hobbies.

## Features

- **User Profiles**: Create and customize your profile with personal details and photos.
- **Chat System**: Real-time messaging with support for emojis and media sharing.
- **Interactive Features**: Share your favorite songs, movies, and personal thoughts to connect deeper.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Technologies

### Frontend (FE)

The frontend is built using modern frameworks and tools to ensure a responsive, interactive, and smooth user experience.

- **React**: A JavaScript library for building user interfaces.
- **React Query (TanStack)**: For efficient data fetching, caching, and synchronization.
- **React Router / React Router DOM**: For handling routing and navigation in a single-page application.
- **React Hook Form**: For form management with validation.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **Socket.IO**: For real-time communication between users.
- **Vite**: A fast build tool for optimized React development.

---

### Backend (BE)

The backend is designed to handle real-time interactions, file uploads, and relational data storage with a focus on scalability.

- **Node.js**: A JavaScript runtime for building the server-side application.
- **Express**: A lightweight framework for routing and middleware management.
- **Socket.IO**: For real-time, bi-directional communication between server and clients.
- **PostgreSQL**: A relational database for structured data storage.
- **Sequelize**: An ORM (Object-Relational Mapping) library for database management.
- **Multer**: For handling file uploads efficiently.
- **Amazon S3**: For storing and retrieving user-uploaded files and images.
- **JWT (JSON Web Tokens)**: For secure user authentication and session management.

## Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or later)
- **npm** or **yarn**
- **PostgreSQL** (configured for the backend)
- **Git**

### Clone the Repository

```bash
git clone https://github.com/tonkec/duga_frontend_v2
cd duga_frontend_v2
```

```bash
git clone https://github.com/tonkec/duga_backend
cd duga_backend
```

### Install Dependencies

#### For the Frontend:

```bash
cd frontend
npm install
```

#### For the Backend:

```bash
cd backend
npm install
```

### Configure Environment Variables

Create `.env` files in both the `frontend` and `backend` directories based on the `.env.example` files provided.

#### Example for Backend `.env`:

```env
APP_KEY=somekey
APP_PORT=8080
APP_URL=http://localhost
AWS_S3_ACCESS_KEY_ID=somekey
AWS_S3_BUCKET_NAME=duga
AWS_S3_SECRET_ACCESS_KEY=somekey
DB_DATABASE=somekey
DB_HOST=localhost
DB_PASSWORD=somekey
DB_USER=asomekey
PGSSLMODE=disable
DATABASE_URL=somekey
SENDGRID_API_KEY=somekey
URI=somekey
APP_FRONTEND_PORT=5173
NODE_ENV=development
```

#### Example for Frontend `.env.development`:

```env
VITE_BASE_URL=http://localhost:8080

```

---

## How to Run

### Backend

1. **Start the Database**:
   Ensure your PostgreSQL server is running and properly configured.

2. **Run Migrations**:

   ```bash
   npx sequelize-cli db:migrate
   ```

3. **Start the Backend Server**:

   ```bash
   npm run dev
   ```

   The backend will be available at `http://localhost:8080`.

---

### Frontend

1. **Start the Frontend**:

   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`.

---

## How to Use

1. Open the application in your browser.
2. Register a new account and set up your profile.
3. Browse profiles, send messages, and enjoy connecting with new people!

---

## Contribution

We welcome contributions! Follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Commit your changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature-name`).
5. Open a Pull Request.

## Tasks that need to be worked on

- https://trello.com/b/pD7lOUSE/designs

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.
