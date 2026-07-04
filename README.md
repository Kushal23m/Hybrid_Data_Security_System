 # Hybrid Data Security System

A lightweight web application that demonstrates secure message hiding (steganography) in images combined with AES-GCM encryption and OTP-based verification for controlled message extraction. The project provides an end-to-end flow for encoding a secret message inside an image, protecting it with a password, and securely revealing it to an authorized recipient.

**Highlights**
- **Steganography**: Hide and extract messages in images using LSB techniques with `sharp` performant image processing.
- **Encryption**: AES-256-GCM encryption of messages before embedding for confidentiality and integrity.
- **OTP Protection**: One-time password (OTP) email flow to authenticate decode requests.
- **Flexible Storage**: Optional Cloudinary integration with an automatic local `public/uploads` fallback.
- **Simple UI**: EJS views for encode/decode workflows and lightweight API endpoints for automation.

---

**Table of Contents**
- **Project**: Summary and features
- **Tech Stack**: Libraries and frameworks
- **Getting Started**: Prerequisites, install, environment
- **Running**: Available scripts and how to run
- **Usage**: Encode / Decode workflows and endpoints
- **Architecture & Files**: Key files and components
- **Configuration**: Environment variables and optional services
- **Troubleshooting**: Common issues and fixes
- **Contributing**: How to help
- **License**

---

**Project**
- **Purpose**: Demonstrate practical integration of steganography and modern symmetric encryption inside a full-stack Node.js app with safety controls (OTP), pluggable storage, and an approachable UI.
- **Use Cases**: Secure message sharing for demos, learning cryptography + steganography integration, or prototyping secure content workflows.

**Tech Stack**
- **Runtime**: Node.js (recommended v16+ but works with newer Node versions)
- **Server**: Express.js
- **View Engine**: EJS
- **Database**: MongoDB via Mongoose (default URI: `mongodb://127.0.0.1:27017/steganoDB`)
- **Image Processing**: `sharp`
- **File Uploads**: `multer` with optional `multer-storage-cloudinary` and `cloudinary` SDK
- **Email**: `nodemailer` (Gmail app password recommended) with console fallback
- **Encryption**: Node `crypto` (AES-256-GCM using `crypto.scryptSync` for key derivation)

**Getting Started**

Prerequisites
- Node.js and npm installed
- MongoDB running locally (or provide a remote URI)

Clone the repository and install dependencies:

```bash
git clone <repo-url>
cd Hybrid_Data_Security_System/Hybrid_Data_Security_System
npm install
```

Configuration (.env)
- Copy the example environment variables and provide values as needed:

```bash
cp .env.example .env
# then edit .env to set EMAIL_USER and EMAIL_PASS (Gmail app password recommended)
```

Minimum `.env` variables used by the app
- `EMAIL_USER` — SMTP login (optional; if not set the app logs OTPs to console)
- `EMAIL_PASS` — SMTP password / App Password (optional)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — optional for Cloudinary uploads; otherwise app uses `public/uploads`

**Run the App**

Development (with auto-restart if you use `nodemon`):

```bash
npm run dev
```

Production / Manual:

```bash
npm start
```

Default server: listens on port `8000` (configurable inside `app.js`) and expects MongoDB at `mongodb://127.0.0.1:27017/steganoDB` unless you change the connection string in `app.js`.

**Usage / Workflows**

Encode (Hide message)
- Visit `/encode` in the browser.
- Provide: a title, your secret message, a password (this password is used to encrypt the message), and an image file.
- The server encrypts the message with AES-GCM (key derived from the provided password), embeds the ciphertext into the image via LSB steganography, and stores both original and stego images (Cloudinary if configured, otherwise `public/uploads`).

Decode (Reveal message)
- Request decode by selecting an encoded entry via the UI.
- The app sends an OTP to the recipient email (or logs it to console if SMTP not configured).
- Provide the OTP and the correct password to decrypt and extract the original message.

API Endpoints (selected)
- `GET /home` — Home page
- `GET /encode` — Encode UI
- `POST /send-otp` — Trigger OTP email for decode flow
- `POST /verify-decode` — Verify OTP and initiate decode workflow
- `POST /extract-message` — Server-side endpoint to fetch & decrypt message (requires `recordId` & `password`)

For automation tests, use JSON payloads; the server supports both form submissions and JSON bodies.

**Architecture & Important Files**
- **`app.js`**: Server bootstrap, middleware, DB connection, route hookup.
- **`routes/pages.js`**: Primary route handlers for encode/decode/OTP flows and helper utilities.
- **`models/encode.js`**: Mongoose schema for stored encodings (title, originalImage, stegoImage, email, passwordHash, createdAt).
- **`utils/steganography.js`**: Core hide/extract functions — uses `sharp` raw buffers to manipulate LSBs.
- **`cloudConfig.js`**: Cloudinary integration and local upload fallback (`public/uploads`).
- **`views/`**: EJS templates used by the UI.
- **`public/`**: Static assets, CSS and client-side JS.

**Security Notes**
- Passwords provided for encryption are used to derive symmetric keys with `crypto.scryptSync` and are NOT stored in plaintext. The app stores a bcrypt hash for any stored password (where applicable).
- AES-GCM provides confidentiality and authentication — the code concatenates authentication tags correctly during encryption/decryption; binary buffers are used to avoid encoding-corruption.
- OTPs are currently held in an in-memory store (suitable for demo purposes). For production, replace with a persistent, expiring store (Redis recommended).

**Configuration Options**
- Cloudinary: set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` to enable remote uploads and CDN links.
- Email: set `EMAIL_USER` and `EMAIL_PASS` for SMTP via Gmail (use App Passwords for security). If omitted, OTPs are printed to server console for testing.

**Troubleshooting**
- "Cannot find module '../cloudConfig.js'" — Ensure `cloudConfig.js` exists in project root (this repo includes a fallback implementation that writes to `public/uploads`).
- Nodemailer errors — verify `EMAIL_USER` and `EMAIL_PASS` in `.env`; for Gmail you may need an App Password.
- Decryption fails / gibberish — ensure you supply the exact password used at encode time; the app uses binary `Buffer` for AES-GCM operations, and local URLs are resolved to absolute URLs when fetching stored stego images.
- MongoDB connection issues — confirm MongoDB is running and accessible at the configured URI.

**Development Notes & Tests**
- The app has been manually validated for:
	- Server startup and DB connection
	- OTP flow (email or console fallback)
	- Encode UI and local storage upload fallback
	- Buffer-based AES-GCM encryption/decryption and LSB-based steganography extraction
- Recommended automated tests:
	1. Encode a sample image with a known message and password.
	2. Retrieve the record, run `/extract-message` with the password, assert the extracted plaintext matches.
	3. Test OTP lifecycle (send → verify) using a mocked SMTP or console logs.

**Contributing**
- Fork the repo, create a feature branch, and open a PR with a clear description of changes.
- Tests and small reproducible demo data are appreciated for any functional changes.

**License**
- This project does not include an explicit license in the repository. Add a `LICENSE` file to clarify usage terms (MIT is a popular permissive choice).

---

If you want, I can now run a fully automated encode→decode round-trip (upload a sample image, encode a test message, then extract & decrypt it) and paste the exact curl / PowerShell commands for reproducing the test locally. Would you like me to run that test now?

