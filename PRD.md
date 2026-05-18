# Project: AI Calorie Tracker PWA

## 1. Overview
What: A Progressive Web App (PWA) for ultra-fast calorie tracking using AI photo and text analysis.
Who: People who track calories but hate manually searching databases for food items.
Why: To reduce the friction of logging meals from minutes to less than 5 seconds using AI.

## 2. Core Features (MVP)
- Multimodal AI Logging: Example: User uploads a photo of a burger OR types "large cheeseburger". The system calls Gemini API and returns estimated calories, protein, carbs, and fats. If a photo was uploaded, it is saved to the user's history.
- Manual Adjustments: Example: After AI returns "500 kcal", user can manually edit it to "600 kcal" before hitting "Save".
- Monthly History & Progress: Example: User navigates to the "History" tab and sees a calendar view with daily total calories for the last 30 days.
- Offline Read-Only Mode (PWA): Example: When the device has no internet connection, the user can still open the app and view previously cached history for the month.
- User Registration: Example: User creates an account via email/password to save their history across devices.

## 3. Non-Goals (CRITICAL)
- We will NOT build a barcode scanner (AI text/photo replaces this).
- We will NOT build native iOS/Android apps (strictly PWA).
- We will NOT build social features (no sharing, no friends lists).
- We will NOT provide diet coaching or meal plans (purely a tracker).
- We will NOT support complex third-party integrations (Apple Health, Google Fit).

## 4. Technical Constraints
- Framework: Next.js 15+ (App Router).
- State Management: Zustand.
- Styling: Tailwind CSS (minimalist, earth-tone color palette).
- AI Provider: Gemini Vision API (for both image and text processing).
- Auth & Database: Supabase (Email/Password Auth, PostgreSQL, and Storage for food photos).
- Testing: Vitest.
- Language: TypeScript (Strict mode).

## 5. Success Criteria
- [ ] Running `npm test` executes successfully with at least 5 passing tests.
- [ ] Creating a new user via Supabase auth successfully redirects to the dashboard.
- [ ] Uploading a mock image of food to the AI utility function returns a parsed object with name and calories.
- [ ] Submitting a text prompt like "1 apple" to the AI utility function returns a parsed object with name and calories.
- [ ] Disconnecting the network (offline mode) allows the user to view the cached monthly history page without crashing.

## 6. Implementation Phases
**Phase 1: Project Setup & Auth**
- Goal: Initialize Next.js PWA, set up Supabase Auth, and create basic routing.
- Tasks: Scaffold Next.js project with Tailwind. Configure next-pwa. Integrate Supabase Auth.
- Verification: `npm run dev` and register a test user.

**Phase 2: AI Core (Photo & Text)**
- Goal: Build the Gemini API integration and the logging UI.
- Tasks: Create a server action to communicate with Gemini API. Build UI with camera upload and text input. Build the "Review & Edit" modal.
- Verification: Run `npm test` on the Gemini utility.

**Phase 3: Database & History**
- Goal: Save logs and photos to Supabase and display monthly history.
- Tasks: 
  - Create `meals` table in Supabase (must include `image_url` field).
  - Upload compressed food photos to Supabase Storage (`food-photos` public bucket) before saving the log.
  - Implement save functionality. 
  - Build the Monthly History calendar view.
- Verification: Add a meal with a photo, check Supabase DB and Storage, verify it appears in the History tab.

## 7. Agent Rules
**Always**
- Use strict TypeScript interfaces for all database models and AI responses.
- Implement error handling for AI API calls.
- Validate user input and AI output before saving to the database.
- Compress images on the client side before uploading to Supabase Storage to save bandwidth and storage limits.

**Ask First**
- Before modifying the Supabase database schema.
- Before installing any external NPM packages not listed in the Technical Constraints.

**Never**
- Never use the `any` type in TypeScript.
- Never hardcode Gemini or Supabase API keys in client-side code.
- Never skip writing tests for core AI parsing functions.