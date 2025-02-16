# 🔗 Shrinx

A **modern, minimalistic URL shortener** that transforms long, complex links into clean, concise URLs. **Shrinx** is designed for simplicity, speed, and seamless integration.

## 🚀 Features

- 🌐 **Instant URL Shortening**: Quickly shorten long URLs.
- 📊 **Analytics**: Track click counts and link performance.
- 🔒 **Secure**: Protect your data with encrypted storage.
- 🔗 **Custom Short URLs**: Create custom alias links.
- ⚡ **RESTful API**: Integrate Shrinx with other applications.

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express**
- **SQLite** (NoSQL database)
- **JWT** for authentication
- **Mongoose** for data modeling

### Frontend
- **React.js**
- **Axios** for API calls

## 📂 Project Structure

```
Shrinx/
│── backend/
│   ├── controllers/      # API controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── server.js         # Server entry point
│── frontend/
│   ├── public/           # Public files
│   ├── src/              # React components
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── utils/        # API utilities
│── README.md             # Project documentation
```

## 📜 Auto Installation & Setup Script With PM2

### 🔹 How to Run?

Test

```sh
bash install-shrinx.sh
```

## ⚙️ Manual Installation & Setup

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/your-username/Shrinx.git
cd Shrinx
```

### 2️⃣ Backend Setup
```sh
cd backend
npm install
npm start
```
- Copy and clone example.config.yml.

#### Example config:
```
database:
  path: "database.db"  # Path to the SQLite database file

turnstile:
  secret_key: "secret_key"

url: "localhost:5000"

server:
  port: 5000

domains:
  - "domain.com"

admin:
  username: 'admin'       # Set your desired admin username
  password: 'password'    # Set your desired admin password
```

### 3️⃣ Frontend Setup
```sh
cd ../frontend
npm install
npm start
```
- Runs the React app at `http://localhost:3000/`.

## 📝 API Endpoints

| Method | Endpoint          | Description              |
|--------|-------------------|--------------------------|
| POST   | `/api/shorten`    | Create a shortened URL   |
| GET    | `/api/:shortUrl`  | Redirect to original URL |
| GET    | `/api/stats/:id`  | Get URL click stats      |

## 📜 License

This project is open-source under the [MIT License](LICENSE).

## 💡 Contribute

Contributions are welcome! Feel free to open issues or submit pull requests.

---

🚀 **Shrinx**: Shorten URLs, expand possibilities!
