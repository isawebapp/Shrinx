# 🔗 Shrinx

A **modern, minimalistic URL shortener** that transforms long, complex links into clean, concise URLs. **Shrinx** is built with Next.js & Tailwind CSS for a fast, responsive UI, and powered by a lightweight SQLite database.

---

## 🚀 Features

- 🌐 **Instant URL Shortening**  
  Create custom short URLs in seconds.
- 🔐 **Admin Dashboard**  
  Secure, session-based admin area to add, list, and delete redirects.
- 🛡️ **Captcha Protection**  
  Cloudflare Turnstile integration to block bots.
- 🔄 **Catch-all Redirects**  
  `/url/[path]` dynamic routing for seamless redirects.
- ⚙️ **API-First**  
  RESTful API under `/api/` for integrations or automation.

---

## 🛠️ Tech Stack

- **Framework**: Next.js (Pages Router)  
- **Styling**: Tailwind CSS (via PostCSS)  
- **Database**: SQLite (file `db.sqlite`)  
- **Session**: next-iron-session (cookie-based admin auth)  
- **Captcha**: Cloudflare Turnstile (`@marsidev/react-turnstile`)  

---

## 📂 Project Structure

```

shrinx-next/
├── .env.example           # Example environment variables
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── db.sqlite              # SQLite database file
├── public/                # Static assets (favicon, etc.)
└── src/
├── lib/
│   ├── db.js          # SQLite helper
│   └── session.js     # next-iron-session setup
├── pages/
│   ├── \_app.js
│   ├── \_document.js
│   ├── index.js       # Home & URL create form
│   ├── success.js     # Display created URL
│   ├── error.js       # 404 page
│   ├── login.js       # Admin login
│   ├── admin.js       # Admin dashboard
│   ├── url/
│   │   └── \[path].js  # Dynamic redirect page
│   └── api/
│       ├── domains.js
│       ├── save.js
│       ├── url/\[path].js
│       └── admin/
│           ├── login.js
│           ├── redirects.js
│           ├── add.js
│           ├── delete.js
│           └── logout.js
└── styles/
└── globals.css    # Tailwind import

````

---
## Run by script

```sh
curl -sSL https://github.com/isawebapp/Shrinx/releases/latest/download/install-shrinx.sh | sudo bash
```
```sh
bash install-shrinx.sh
```

---

## ⚙️ Getting Started (Run by manual setup)

### 1. Clone & Install

```bash
git clone https://github.com/isawebapp/Shrinx.git
```
```bash
cd Shrinx
```
```bash
npm install
````

### 2. Environment Variables

Rename `example.env.local` to `.env.local` in the project root:

```ini
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key

ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme

SESSION_PASSWORD=complex_password_at_least_32_chars

DOMAINS=localhost:3000
```

### 3. Run in Development

```bash
npm run dev
```

Your app will be available at `http://localhost:3000`.

### 4. Build & Production

```bash
npm run build
```
```bash
npm start
```

---

## 🔗 API Endpoints

| Method | Endpoint                    | Description                                      |
| ------ | --------------------------- | ------------------------------------------------ |
| GET    | `/api/domains`              | Fetch list of allowed domains                    |
| POST   | `/api/save`                 | Create a new redirect (requires Turnstile token) |
| POST   | `/api/admin/login`          | Admin login (sets session cookie)                |
| POST   | `/api/admin/logout`         | Admin logout (destroys session)                  |
| GET    | `/api/admin/redirects`      | List all redirects (admin only)                  |
| POST   | `/api/admin/add`            | Add a redirect (admin only)                      |
| DELETE | `/api/admin/delete?id=<id>` | Delete a redirect by ID (admin only)             |
| GET    | `/url/[path]`               | Redirect to the original URL                     |

---

## 📝 Usage

1. **Shorten a URL:**
   Fill in the long URL, choose a domain & alias, solve the captcha, and click **Shorten URL**.
2. **Manage Redirects:**
   Log in to `/login`, then add, view, or delete redirects in the admin dashboard.
3. **Visit a Short Link:**
   Open `https://your-domain.com/url/<alias>` to be redirected.

---

## 📜 License

This project is open-source under the [MIT License](LICENSE).

---

## 💡 Contribute

Contributions are welcome! Feel free to open issues or submit pull requests. Let’s make Shrinx even better!
