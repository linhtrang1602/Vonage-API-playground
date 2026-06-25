# 🔷 Vonage API Playground

Interactive web dashboard to demonstrate Vonage Verify and Messages APIs with real-time webhooks.

## ✨ Features

- **Verify OTP API**: Send, verify, and cancel OTPs via SMS/Voice.
- **Messages API**: Send text messages via WhatsApp and SMS using the Messages v1 API.
- **Real-Time Webhooks**: Receive inbound messages and status updates instantly via WebSocket connection.
- **Premium UI**: Modern dark mode with glassmorphism effects, dynamic status badges, and real-time conversation logging.

## 🚀 Quick Start (Local)

1. **Clone & Setup Environment**
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Fill in your Vonage credentials:
   ```env
   VONAGE_API_KEY=your_key
   VONAGE_API_SECRET=your_secret
   VONAGE_FROM_NUMBER=14157386102
   VONAGE_MESSAGES_BASE_URL=https://messages-sandbox.nexmo.com
   BASE_URL=http://localhost:8000
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the App**
   ```bash
   uvicorn main:app --reload
   ```

4. **Open in Browser**
   Go to `http://localhost:8000`

---

## 🌐 Setting up Webhooks (ngrok)

To receive webhooks locally from Vonage, you need to expose your local server using `ngrok`.

1. Run ngrok:
   ```bash
   ngrok http 8000
   ```
2. Copy the ngrok URL (e.g., `https://abc-123.ngrok-free.app`).
3. Update `BASE_URL` in your `.env` file to the ngrok URL and restart the server.
4. Go to **Vonage Dashboard → Messages API → Sandbox**.
5. Set **Inbound webhook URL** to `https://abc-123.ngrok-free.app/webhooks/inbound`.
6. Set **Status webhook URL** to `https://abc-123.ngrok-free.app/webhooks/status`.

---

## ☁️ Deploy to Render (Free)

1. Push this repository to GitHub.
2. Sign in to Render.com and select **"New" -> "Blueprint"** (or Web Service).
3. Connect your repository. Render will automatically use the `render.yaml` configuration.
4. Set the Environment Variables (`VONAGE_API_KEY`, `VONAGE_API_SECRET`) in the Render dashboard.
5. Once deployed, copy your Render app URL (`https://your-app.onrender.com`).
6. Update the `BASE_URL` env variable in Render and update your Webhook URLs in the Vonage Dashboard to point to your new Render URL.

---

## 🛠 Project Structure

```
vonage-playground/
├── main.py                  # FastAPI app entry point
├── config.py                # Environment configuration
├── routes/                  # API Endpoints
│   ├── verify.py            # Verify API routes
│   ├── messages.py          # Messages API routes
│   └── webhooks.py          # Webhook receivers
├── services/                # Vonage API Clients
│   ├── vonage_verify.py     # Verify logic
│   └── vonage_messages.py   # Messages logic
├── ws/                      # WebSocket
│   └── manager.py           # Real-time connection manager
└── static/                  # Frontend App
    ├── index.html           # UI layout
    ├── css/style.css        # Premium styling
    └── js/                  # App logic
        ├── app.js           # Tabs, WebSocket, Toasts
        ├── verify.js        # Verify OTP flow
        └── messages.js      # Sending/Receiving messages
```

---

## ➕ How to add a new Vonage API

1. **Service layer**: Create `services/vonage_newapi.py` with an async function to call the Vonage API.
2. **Route layer**: Create `routes/newapi.py` with FastAPI endpoints to expose the service.
3. **Register route**: Import and include the new router in `main.py`.
4. **Frontend**: Add a new tab to `static/index.html` and write the client-side logic in `static/js/newapi.js`.

---

## 💻 Tech Stack

- **Backend**: Python 3.11, FastAPI, Uvicorn
- **HTTP Client**: `httpx` (async)
- **Real-time**: FastAPI WebSockets
- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS (via CDN), custom CSS
