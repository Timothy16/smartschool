# Smart Secondary School Management System

A web application that lets a secondary school manage its academic records in one place: student records, score entry, automatic result calculation, report cards, and performance tracking with an at-risk early-warning feature (the "smart" part).

This README is the build specification. It is written to be read by **Claude Code**. Build strictly in the phases defined below. Do not jump ahead. Each phase is independently testable — finish and verify one before starting the next.

---

## 1. Scope & Philosophy

This is a **final-year undergraduate project built as an MVP**. Bias every decision toward simplicity and defensibility over completeness.

**In scope (build this):**
- Admin management of students, teachers, classes, subjects, and teacher↔subject assignments.
- Teacher score entry, scoped to only the subjects they are assigned to, with validation.
- Automatic result calculation and report card generation from raw scores.
- A read-only student/parent view of report cards and personal performance over time.
- One smart feature: performance analytics with at-risk / declining flags.

**Explicitly OUT of scope (do NOT build — list as "future work" only):**
- Email verification / account-approval flows.
- Soft-delete / deactivate-don't-delete (plain delete is fine).
- Term-locking of report cards (generate on demand from current scores).
- Separate multi-child parent accounts (one read-only `Student` login serves the student/parent view).
- Ranking/position (optional; only if time remains).
- SMS notifications, fee management, attendance, timetabling.

**Golden rule:** results and report cards are always **computed** from `Assessment` records. Never store a duplicated, editable "total" or "average" field that can drift out of sync.

---

## 2. Tech Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Nuxt 3** (SSR enabled) | Server routes under `server/api`. |
| Database | **MongoDB** via **Mongoose** | Models under `models/`. |
| State | **Pinia** (`@pinia/nuxt`) | |
| Styling | **Tailwind CSS** (`@nuxtjs/tailwindcss`) | |
| UI components | **Nuxt UI** (`@nuxt/ui`) | 100+ accessible components, SSR-ready, Tailwind-native. |
| Notifications | **Nuxt UI toasts** (`useToast` + `<UToast>`) | No separate toast library. Do NOT add `vue-toastification`. |
| Password hashing | **bcrypt** | Replaces SHA-256. Salted, best practice. |
| Auth | **httpOnly session cookie** | See §5. No JWT. |

Add Nuxt UI to `modules` in `nuxt.config.ts`. Prefer Nuxt UI components (`UButton`, `UCard`, `UTable`, `UModal`, `UForm`, `UInput`, `USelectMenu`, `UBadge`, etc.) over hand-rolled markup so the UI stays consistent and professional. Use the semantic color aliases (`primary`, `success`, `warning`, `error`, `neutral`) rather than raw color values.

---

## 3. Project Conventions (follow exactly)

These mirror the owner's existing production codebase. Consistency here is required.

### Models — `models/<Name>.model.ts`
- Mongoose schema with `{ timestamps: true }`.
- Optional fields use `default: null`; string fields use `trim: true`; emails `lowercase: true`.
- Export guard: `export const X = mongoose.models.X || mongoose.model('X', XSchema)`.
- Hash password in a `pre('save')` hook **only when modified**.
- Provide a `verifyPassword(plain: string): Promise<boolean>` instance method.
- Provide a `getFullName()` method / `fullName` virtual where a name exists.
- Enable virtuals in output: `schema.set('toJSON', { virtuals: true })` and `toObject` likewise.

**Password hashing (bcrypt) — canonical shape:**
```ts
import bcrypt from 'bcryptjs' // or 'bcrypt'; bcryptjs avoids native build issues

Schema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10)
  }
  next()
})

Schema.methods.verifyPassword = async function (password: string): Promise<boolean> {
  if (!this.password) return false
  return bcrypt.compare(password, this.password)
}
```

### API routes — `server/api/**/<name>.<method>.ts`
- `export default defineEventHandler(async (event) => { ... })`.
- Read input with `readBody(event)`.
- Wrap the whole handler in `try/catch`.
- Call `ensureConnection()` (or rely on the mongoose plugin) so the DB is connected.
- **Strip sensitive fields** (`password`, tokens) via destructuring before returning any user object.

### Error handling — what the USER sees vs what gets LOGGED (strict)

There are two audiences and they must never be confused:

- **Server logs only:** `console.error('[route/path]', error)` prints to the terminal/log for debugging. This is NOT sent to the browser. Keep it.
- **User-facing:** the message inside `createError({ statusCode, message })` is the ONLY thing the client sees. It must always be a clean, human-readable sentence. **Never** put a route path, stack trace, field path, or a raw Mongoose/Mongo error into a user-facing message.

**Rule: only deliberately-thrown errors reach the user.** A caught error's raw `.message` is never forwarded to the client, because DB errors (duplicate key, cast, validation) leak field names and internals. Distinguish *known* errors (ones you threw on purpose with a friendly message) from *unknown* ones (anything else → generic 500).

Every route uses this pattern:

```ts
export default defineEventHandler(async (event) => {
  try {
    await ensureConnection()
    // ... validate input, do work, throw createError({ statusCode, message }) for known cases ...
    return { success: true, /* stripped data */ }
  } catch (error: any) {
    console.error('[route/path]', error)          // internal only
    throw toUserError(error)                        // clean message only
  }
})
```

`toUserError` (a shared server util) re-throws known errors untouched and converts everything else to a safe, human message:

```ts
// server/utils/errors.ts
export function toUserError(error: any) {
  // A known error we threw on purpose — has a statusCode < 500 and a safe message.
  if (error?.statusCode && error.statusCode < 500) return error

  // Map common Mongoose/Mongo errors to human messages (no field paths leaked).
  if (error?.code === 11000) {
    return createError({ statusCode: 409, message: 'A record with these details already exists.' })
  }
  if (error?.name === 'ValidationError') {
    return createError({ statusCode: 400, message: 'Some details are missing or invalid. Please check and try again.' })
  }
  if (error?.name === 'CastError') {
    return createError({ statusCode: 400, message: 'That request was invalid.' })
  }

  // Anything unexpected: never leak it.
  return createError({ statusCode: 500, message: 'Something went wrong. Please try again.' })
}
```

User-facing messages must read like the school office is talking, e.g. `'Invalid email or password'`, `'You are not allowed to perform this action.'`, `'That student could not be found.'` — never `'[teacher/scores/create] CastError: ...'`.

### DB connection
- Keep `utils/mongodb.ts` `ensureConnection()` (checks `mongoose.connection.readyState`) and/or the server plugin that connects on startup.
- Mongo URI comes from `runtimeConfig.mongodbUri` (env `MONGODB_URI`). All secrets go through `runtimeConfig`, never hardcoded.

---

## 4. User Models (three separate collections)

Following the existing codebase pattern, user types are **separate collections**, distinguished in the session by a `userModel` discriminator — NOT one `User` collection with a role field.

| Model | `userModel` value | Purpose |
|---|---|---|
| `Admin` | `'Admin'` | School owner. Manages everything structural. |
| `Teacher` | `'Teacher'` | Enters scores for assigned subjects only. |
| `Student` | `'Student'` | Read-only login for the student/parent report-card view. |

MVP gates: only `isActive`. (No email-verified / approved gates — those are out of scope.)

### Who can do what

**Admin**
- CRUD: students, teachers, classes, subjects.
- Assign teachers to specific class+subject pairs.
- Set the current academic session + term (a single settings document).
- Set grading configuration (grade boundaries, CA/exam weighting, pass mark).
- View all students, all results, and school-wide analytics.
- Trigger report card generation for a class/term.
- **Adds students.** Students are never self-registered and are not created by teachers.

**Teacher**
- Enter/edit assignment, test, and exam scores **only for their assigned class+subject pairs**, for the current term.
- Validation on entry: reject score `< 0` or `> max`.
- View performance of their own students in their own subjects (trends, class averages).
- See at-risk flags scoped to their subjects.
- Add subject remarks that flow onto the report card.
- **Cannot**: touch another teacher's subject, manage users, or change grading settings.

**Student / Parent (read-only)**
- View own report cards per completed term (with print / PDF export).
- View own performance trend over time.
- **No write access anywhere. Scoped to their single student record only.**

The teacher-scoping check (teacher may only act on their assigned class+subject) is the single most important access rule. Enforce it server-side on every score-related route, never only in the UI.

---

## 5. Authentication

Session cookie exactly like the existing codebase:

```ts
setCookie(event, 'school_session', JSON.stringify({
  userId: user._id,
  email: user.email,
  userModel: 'Admin' | 'Teacher' | 'Student'
}), { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: '/', sameSite: 'lax' })
```

- One login route per user type (or one shared route that checks all three collections — implementer's choice, keep it simple).
- A server utility `getSession(event)` reads and parses the cookie, and a helper `requireRole(event, 'Teacher')` throws `401/403` when the `userModel` doesn't match.
- Route middleware protects pages by role; server routes re-check the session (never trust the client).
- Seed a first Admin via a one-off script or a guarded seed route (there is no public admin signup).

### No-loophole rules (enforce all of these server-side)

Client-side middleware and hidden UI buttons are **UX only** — never the security boundary. Assume a user can craft any HTTP request directly. Therefore:

1. **Every protected server route re-checks the session and role itself.** Never rely on the page middleware having run. If the route needs a Teacher, it calls `requireRole(event, 'Teacher')` at the top.
2. **Teacher scoping is verified against the database on every score write.** Before accepting a score, confirm an `Assignment` document exists linking this teacher to that exact `classId` + `subjectId`. If not → `403 'You are not allowed to perform this action.'` Do not trust a `classId`/`subjectId` sent in the body without this check.
3. **Students can only ever read their own record.** Derive the `studentId` from the session, never from the request body/query. A student requesting another student's report card gets `403`, not that student's data.
4. **No mass assignment.** Never spread `...body` into `Model.create()` or `.save()`. Whitelist the exact fields each route accepts. This prevents a crafted request from setting `isActive`, `userModel`, `role`, another user's `studentId`, or a score's `enteredBy`.
5. **Server sets trusted fields, not the client.** `enteredBy` comes from the session; `session`/`term` come from the Settings document; `userModel` is fixed by which model created the account. The client cannot supply these.
6. **Generic auth errors — no enumeration.** Unknown email and wrong password both return the same `'Invalid email or password'`, so an attacker can't discover which emails are registered.
7. **Validate and clamp all numeric input.** Reject `score < 0`, `score > maxScore`, and non-numeric values server-side, regardless of what the UI allows.
8. **Score writes are blocked outside the current term** unless the user is Admin — a Teacher can only write to the active session/term from Settings.
9. **No sensitive fields ever leave the server.** `password` and any tokens are stripped from every response object, including nested/populated documents.
10. **Login is rate-limited.** Throttle repeated failed logins per email/IP (a simple in-memory or DB counter with a short lockout window is enough for the MVP) so the generic-error login can't be brute-forced.
11. **Session cookie is `secure` in production.** Set `secure: true` when `NODE_ENV === 'production'` (keep it off for local `http`), alongside the existing `httpOnly` + `sameSite: 'lax'`, so the session is never sent over plain HTTP in production.

---

## 6. Data Model (collections)

Keep link records as their own collections (do not deeply nest) because scoping queries hit them constantly.

- **Admin** — `firstName, lastName, email, password, isActive`.
- **Teacher** — `firstName, lastName, email, password, isActive`.
- **Student** — `firstName, lastName, email(optional), password, admissionNumber, classId (ref Class), isActive`.
- **Class** — `name` (e.g. "JSS1A"), `session`, optional `formTeacherId`.
- **Subject** — `name`, `code`.
- **Assignment** (teacher↔class↔subject) — `teacherId (ref Teacher)`, `classId (ref Class)`, `subjectId (ref Subject)`. This is what scopes a teacher.
- **Assessment** (one score record) — `studentId`, `subjectId`, `classId`, `term`, `session`, `type ('assignment'|'test'|'exam')`, `score`, `maxScore`, `enteredBy (ref Teacher)`, timestamps.
- **Settings** (single doc) — `currentSession`, `currentTerm`, `gradeBoundaries[]`, `caWeight`, `examWeight`, `passMark`.

Report cards and results are computed by aggregating `Assessment` records for a `studentId + term + session`, applying the weighting and boundaries from `Settings`. Nothing is stored pre-computed.

---

## 7. The Smart Feature — At-Risk / Performance Analytics

This is what earns the word "Smart" in the title. Do not cut it.

- For each student per subject, compute the trend across their assessments over time (and across terms where data exists).
- **Flag** a student as *at-risk* when their current computed subject result is below the pass mark, and *declining* when their trend across the most recent assessments is negative by a set threshold.
- Surface flags in: the teacher's subject dashboard (their students only) and the admin's school-wide dashboard.
- Present with clear Nuxt UI `UBadge` states (e.g. `error` = at-risk, `warning` = declining, `success` = on track) and simple charts (a lightweight chart lib or Nuxt UI chart community component) showing score trend per student/subject.
- Keep the logic transparent and explainable — the owner must be able to defend exactly how a flag is derived. Simple threshold + slope logic is preferred over anything opaque. (Optional stretch: simple linear regression to project end-of-term score.)

---

## 8. Build Phases

Build in order. Each phase must run and be testable before moving on.

**Phase 0 — Foundations**
Scaffold Nuxt 3 (SSR). Add Tailwind, Pinia, Nuxt UI. Wire `runtimeConfig`, `MONGODB_URI`, `ensureConnection()` + mongoose plugin. Create a base app layout (sidebar + top bar shell) and confirm a page renders and the DB connects.

**Phase 1 — Auth & user models**
Create `Admin`, `Teacher`, `Student` models (bcrypt, `verifyPassword`, guards). Build login + logout + session cookie + `getSession`/`requireRole` helpers + role-based page middleware. Seed one Admin. Verify each role can log in and reach only its own area.

**Phase 2 — Academic structure (Admin)**
Admin CRUD for Classes, Subjects, Students (admin adds students), Teachers, and Assignments (teacher↔class↔subject). Settings page for current session/term, grade boundaries, weighting, pass mark. Verify a teacher can be assigned to specific class+subject pairs.

**Phase 3 — Score entry (Teacher)**
Teacher dashboard lists only their assigned class+subject pairs. Score entry screen for assignment/test/exam with `0 ≤ score ≤ maxScore` validation, writing `Assessment` records stamped with the current session/term. Server-side scoping check on every write. Verify Teacher A cannot reach Teacher B's subject.

**Phase 4 — Results & report cards**
Computation layer that aggregates `Assessment` records into per-subject results and a full report card (applying weighting + boundaries from Settings). Report card view + print/PDF export. Read-only Student view of their own report cards. Verify totals recompute correctly when a score changes.

**Phase 5 — Smart feature**
At-risk / declining flag logic (§7). Teacher subject-level analytics (their students) and Admin school-wide analytics dashboard, with badges and trend charts. Verify flags update as scores change.

**Phase 6 — Polish**
Consistent Nuxt UI styling, loading and empty states, `useToast` feedback on every create/update/delete, responsive layout, and a clean dashboard landing per role. Tidy, demo-ready.

---

## 9. Environment (`.env`)
```
MONGODB_URI=
APP_URL=http://localhost:3000
NODE_ENV=development
```
All accessed via `runtimeConfig`. Never hardcode secrets.

---

## 10. Definition of Done (MVP)
- All three roles log in; access is correctly scoped server-side.
- Admin manages the full academic structure and adds students.
- Teachers enter validated scores only for their assignments.
- Report cards compute correctly from raw scores and export to PDF/print.
- Students see their own report cards and trend, read-only.
- At-risk flags appear for teachers (their subjects) and admin (school-wide).
- UI is consistent Nuxt UI, with toast feedback and responsive layout.
