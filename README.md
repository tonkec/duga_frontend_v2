# Duga App

## A modern dating application designed to connect people through common interests, fun features, and a seamless user experience. This app allows users to create profiles, chat with matches, and explore unique ways to interact, such as sharing photos, favorite songs, and hobbies.

## Features

- **User Profiles**: Create and customize your profile with personal details and photos.
- **Chat System**: Real-time messaging with support for emojis and media sharing.
- **Interactive Features**: Share your favorite songs, movies, and personal thoughts to connect deeper.
- **Responsive Design**: Optimized for both desktop and mobile devices.

---

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
PORT=8080
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_DATABASE=your_db_name
JWT_SECRET=your_secret_key
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

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.
