<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/salad.svg" width="80" height="80" alt="Logo" />
  <h1>AI Calorie Tracker PWA 🥗🤖</h1>
  <p><strong>A lightning-fast, offline-capable Progressive Web App for smart calorie and macro tracking using AI.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Supabase-Database_&_Auth-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
    <img src="https://img.shields.io/badge/Gemini_AI-Vision_API-8E75B2?style=for-the-badge&logo=google" alt="Gemini" />
    <img src="https://img.shields.io/badge/Zustand-State-black?style=for-the-badge&logo=react" alt="Zustand" />
    <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
  </p>
</div>

---

## 🚀 The Vision

Tracking calories shouldn't feel like a part-time job. **AI Calorie Tracker** reduces the friction of logging meals from minutes to under 5 seconds. Just snap a photo or type what you ate, and our Gemini-powered AI engine instantly calculates your macros (calories, protein, carbs, fats). 

Designed with an absolute focus on **database optimization, cloud storage efficiency**, and **offline-first reliability**.

## ✨ Features

- 📸 **AI-Powered Food Recognition**: Upload a photo or type a prompt (e.g., "large cheeseburger"). The Gemini API instantly returns estimated macros.
- 📱 **Offline-First PWA**: Install it on your home screen. View your monthly history and cached data even when you have zero network connection.
- 🗑️ **Smart Garbage Collection**: A custom Vercel Cron Job triggers a Supabase SQL function nightly to purge orphaned photos older than 30 days, keeping AWS S3 costs at zero.
- ⭐ **"VIP" Favorite Meals**: Save frequent meals. A smart SQL Reference Counting logic grants these images "immunity" from the automated cleanup script.
- 🌍 **Bilingual Interface**: Built-in `i18n` support (RU / EN) with local storage memory.
- 🔒 **Row Level Security (RLS)**: Strict Supabase PostgreSQL policies ensure data privacy.

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | TypeScript (Strict Mode) |
| **State Management** | Zustand |
| **Styling** | Tailwind CSS v4, Lucide Icons |
| **Database & Auth** | Supabase (PostgreSQL, Auth, Storage) |
| **AI Engine** | Google Gemini Vision API |
| **Testing** | Vitest |
| **Deployment** | Vercel (Hosting, Serverless, Cron Jobs) |

## 🏗️ Architecture & Cloud Storage Flow

To prevent cloud storage from filling up with old logs, we implemented a self-cleaning architecture:
1. When a user uploads a meal, the image is compressed client-side and sent to a public Supabase Storage bucket.
2. Every midnight, a **Vercel Cron Job** pings `/api/cron/purge-photos`.
3. The server bypasses RLS securely and calls a custom Postgres function: `get_old_food_photos`.
4. It filters out images linked to the `favorite_meals` table. 
5. Unprotected files older than 30 days are permanently deleted, while the frontend gracefully catches 404s via a soft-deletion fallback UI.

## ⚙️ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/your-username/ai-calorie-tracker-pwa.git
cd ai-calorie-tracker-pwa
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
CRON_SECRET=your_custom_cron_secret
```

### 3. Run Development Server
```bash
npm run dev
# App will be available at http://localhost:3000
```

### 4. Run Tests
```bash
npm test
```

## 🤝 Code Rules & Constraints
- **Strict TypeScript:** No `any` types.
- **Async/Await:** Used exclusively.
- **Architecture:** All business logic resides in Next.js Server Actions.

---
<div align="center">
  <i>Built with ❤️ for zero-friction tracking.</i>
</div>
