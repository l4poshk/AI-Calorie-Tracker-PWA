# Project: AI Calorie Tracker PWA

## 1. Commands
- Start development server: `npm run dev`
- Production build: `npm run build`
- Run test suite (Vitest): `npm test`
- Linting check: `npm run lint`
- Supabase type generation: `npx supabase gen types typescript --local > src/types/supabase.ts`

## 2. Project Architecture & Stack
- **Framework:** Next.js 15 (App Router). All business logic should reside in Server Actions (`src/actions`).
- **Auth & Database:** Supabase (PostgreSQL + Auth).
- **State Management:** Zustand for global UI state.
- **Styling:** Tailwind CSS. 
- **Design System:** Minimalist aesthetic with an earth-tone color palette (olive, cream, slate).
- **Icons:** Lucide React.
- **AI Engine:** Gemini Vision API for multimodal (image/text) processing.

## 3. Code Style & Rules
- **Strict TypeScript:** No `any` type allowed. Define interfaces for all AI responses and database models.
- **Async Patterns:** Use `async/await` exclusively. Avoid `.then()` chains.
- **Absolute Imports:** Use `@/` prefix for all internal imports (e.g., `@/components/UI/Button`). No relative paths like `../../../`.
- **Modular Components:** Keep components small and focused. Extract logic into custom hooks if it exceeds 50 lines.
- **Clean Code:** Use descriptive variable names. Ensure all code is self-documenting.

## 4. Boundaries & Constraints
- **Never** hardcode API keys or secrets. Always use `.env.local` and prefix public keys with `NEXT_PUBLIC_`.
- **Never** modify the Supabase database schema without explicit approval.
- **Never** use heavy external libraries (e.g., lodash, moment) if a native JavaScript solution is available.
- **Always** ensure the PWA remains functional in offline mode (read-only history).
- **Always** run `npm test` before suggesting a commit.
- **Ask First** before installing any new NPM packages or changing the existing folder structure.

## 5. Tone & Personality
- Address the developer as "bra".
- Keep communication direct, honest, and innovative.
- If a request is technically poor or violates standard engineering principles, point it out immediately.