# AI Calorie Tracker PWA 🥗🤖

A production-ready Progressive Web Application for smart calorie and macro tracking. Built with Next.js, this app uses AI vision to recognize food from photos, calculate nutritional value, and seamlessly manage your dietary history. 

Designed with an absolute focus on database optimization and cloud storage efficiency.

## 🔥 Key Features

* **AI-Powered Food Recognition:** Upload a photo, and the app uses the Gemini API to automatically detect the meal, estimating its calories, protein, fats, and carbs.
* **Smart Storage Architecture:** Cloud storage isn't free. The app features a custom Vercel Cron Job integrated with a Supabase SQL function that automatically purges orphaned food photos older than 30 days.
* **"VIP" Favorite Meals Library:** Users can save standard meals to their favorites. The database uses a smart Reference Counting logic (SQL `NOT EXISTS`), granting these images "immunity" from the automated cleanup script, completely preventing duplicate file uploads and saving server space.
* **PWA & Offline-First:** Fully installable on mobile devices with Service Worker caching for instant load times and native app feel.
* **Soft Deletion & Fallback UI:** If a photo is purged by the automated system, the frontend gracefully catches the 404 error via local state and renders a clean "Archive" placeholder without breaking the layout.
* **Bilingual Interface:** Built-in i18n support (RU / EN) with local storage memory.
* **Row Level Security (RLS):** Strict Supabase RLS policies ensure users can only access and modify their own data.

## 🛠 Tech Stack

* **Framework:** Next.js (App Router)
* **Database & Auth:** Supabase (PostgreSQL, Storage, Authentication)
* **AI Vision:** Gemini API
* **Deployment & Automation:** Vercel (Hosting, Serverless Functions, Cron Jobs)
* **Styling:** Tailwind CSS

## ⚙️ Quick Start

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/ai-calorie-tracker-pwa.git](https://github.com/your-username/ai-calorie-tracker-pwa.git)
   cd ai-calorie-tracker-pwa
Install dependencies:

Bash
npm install
Set up Environment Variables:
Create a .env.local file in the root directory and add your keys:

Фрагмент кода
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
CRON_SECRET=your_custom_cron_secret
Run the development server:

Bash
npm run dev
Open http://localhost:3000 to view it in the browser.

🧠 Architecture Highlights
The Garbage Collector Logic
To prevent AWS S3 (Supabase Storage) from filling up with old meal photos, a Vercel Cron Job pings the /api/cron/purge-photos route every midnight. The server bypasses RLS using the Service Role Key, calls a custom PostgreSQL function get_old_food_photos, and filters out any images currently linked to the favorite_meals table. Only unprotected files older than 30 days are permanently deleted via the Supabase Storage API.
