# Kromo-AI Backend

Backend server for the Kromo-AI Digital Guardian Chrome Extension.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express
- **ORM**: Prisma
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini 2.0 Flash

## Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

### 3. Push Database Schema
```bash
npx prisma db push
```

### 4. Generate Prisma Client
```bash
npx prisma generate
```

### 5. Run Server
```bash
npm run dev
```

Server will start at `http://localhost:8000`

## API Endpoints

### POST /api/analyze
Analyze comment sentiment.

**Request:**
```json
{
  "text": "komentar yang akan dianalisis",
  "platform": "TikTok",
  "user_name": "NamaUser",
  "api_key": "optional-gemini-api-key"
}
```

**Response:**
```json
{
  "level": "harmful",
  "emotion": "Marah",
  "problem": "Komentar mengandung kata-kata kasar",
  "nudge": "Coba bayangkan jika kamu yang membaca komentar ini",
  "wisdom": "Mulutmu harimaumu",
  "alternative": "Mungkin bisa disampaikan dengan lebih sopan"
}
```

### GET /api/logs
Get analysis history (last 50 entries).

### GET /
Health check.
