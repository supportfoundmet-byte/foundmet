# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## FoundMet — Find Your Co-Founder

**Founder Discovery • Professional Networking • Social Feed • Premium Communication**

| Field | Details |
| :--- | :--- |
| **Product Name** | FoundMet |
| **Product Tagline** | Find Your Co-Founder |
| **Document Type** | Product Requirements Document (PRD) |
| **Version** | 1.0 (Development Ready) |
| **Date** | 18 September 2026 |
| **Prepared For** | Global Institute of Management & Technology (GIMT), Department of CSE |
| **Document Status** | Proposed for Development / Active Implementation |
| **Primary Palette** | Primary `#0B5CFF`, Dark Navy `#011940`, Accent Purple `#7038F5`, Canvas `#F8FAFF` |

---

## 1. Executive Summary

FoundMet is a startup networking platform specifically engineered for entrepreneurs, startup builders, and aspiring founders to discover complementary co-founders, establish professional connections, securely communicate, and share startup progress.

This document establishes the official product requirements for the comprehensive redesign and upgrade of FoundMet. The core design direction draws inspiration from the professional clarity, intuitive navigation, and high trust of **LinkedIn**, distilled into a simpler, fast, mobile-first experience tailored for startup building.

### Key Objectives:
1. **LinkedIn-Inspired Simplicity & Mobile-First UX**: Deliver a clean, 3-column desktop layout and a persistent 5-destination bottom navigation bar for mobile (`Home/Feed`, `Discover`, `Create Post`, `Chat`, `Profile`).
2. **Social Feed with Interactive Engagement**: Enable authenticated founders to publish startup updates, ideas, and milestones with optional media, accompanied by full threaded comments, optimistic likes, and sharing.
3. **Focused Text Chat with Erasure Features**: Refactor standard messaging to be strictly text-focused by removing confusing voice/video buttons from the standard chat header. Support individual message deletion ("Erase message") and full conversation clearing.
4. **Subscription-Gated Premium Calling**: Provide dedicated audio and video calling entry points exclusively to eligible paid subscribers, enforced strictly via backend authorization.
5. **Robust Superadmin Control Panel**: Provide comprehensive administrative control over staff role assignments (Superadmin, Admin, Moderator, Support), user account lifecycle, and dynamic subscription plans.
6. **Hardened Security & Logout State Wipe**: Ensure sessions restore seamlessly upon refresh, while logging out thoroughly purges all cached authentication tokens, local/session storage, cookies, and active socket connections.

---

## 2. Problem Statement & Target Personas

### 2.1 Problem Statement
Mainstream social and professional platforms (LinkedIn, Twitter, Reddit) are general-purpose and lack dedicated mechanisms for startup team formation:
- Builders struggle to filter potential collaborators by project stage (Idea, Development, Live execution) and complementary skill sets (Tech, Business, Design, Product).
- Existing tools do not offer location-bounded discovery (10–100 km radius) essential for local startup pairs.
- Free-form communication platforms suffer from spam and unverified calling requests.

### 2.2 User Personas
- **The Technical Builder (CTO / Developer)**: Seeks visionary founders with validated business models, market insight, or domain expertise. Needs to inspect project stages and exchange code/ideas.
- **The Business Founder (CEO / Operator)**: Has an idea or early traction and needs an engineer or designer to build the MVP. Needs verified skill discovery and radius-based search.
- **The Early Stage Explorer**: Brainstorming concepts and validating market demand. Needs the social feed to share ideas, test assumptions, and gather community feedback.
- **Staff / Moderator**: Needs structured queues to moderate reported posts, review flagged accounts, and assist users.
- **Superadmin**: Full executive authority to manage staff roles, configure subscription pricing, inspect audit trails, and oversee system health.

---

## 3. UI/UX Design Requirements

### 3.1 Design Principles & Brand Palette
| Principle | Requirement |
| :--- | :--- |
| **Simple** | Zero learning curve; core actions (post, discover, chat) accessible in 1 tap/click. |
| **Mobile-First** | Complete touch ergonomics, zero horizontal scrolling, keyboard-adaptive chat. |
| **Professional** | Crisp card boundaries (`#E3E9F5`), whitespace, subtle drop shadows, clean typography. |
| **Fast** | Lightweight components, optimistic UI updates, responsive skeleton loaders. |
| **Secure** | All destructive and private actions require explicit visual confirmation and backend auth. |

#### Brand Palette:
- **Primary Brand**: `#0B5CFF` (Action buttons, active nav tabs, primary links)
- **Dark Navy / Main Text**: `#011940` (Headlines, body typography, dark surfaces)
- **Accent Purple**: `#7038F5` (Milestone badges, co-founder tags, gradient highlights)
- **Background Canvas**: `#F8FAFF` (Light, readable backdrop for high contrast cards)
- **Surface Cards**: `#FFFFFF` with `border: 1px solid #E3E9F5`

### 3.2 Responsive Layout Architecture
```
+-----------------------------------------------------------------------------+
| [FoundMet Logo]  [Search founders, skills, posts...]      [Home][Discover][Post][Chat][Me] |
+-----------------------------------------------------------------------------+
|                   |                                     |                   |
|   LEFT COLUMN     |           CENTER COLUMN             |   RIGHT COLUMN    |
|  (User Mini Card  |  +-------------------------------+  |  (Suggested       |
|   & Quick Stats)  |  |  [Avatar] Start a post...     |  |   Founders &      |
|                   |  +-------------------------------+  |   Startup News)   |
|   - Profile photo |                                     |                   |
|   - Name & Role   |  +-------------------------------+  |  - Recommended    |
|   - Connections   |  | Post Card: Author, Time, Tag  |  |    Co-Founders    |
|   - Saved Posts   |  | "Building an AI workflow..."  |  |    with "+ Connect"|
|                   |  | [Media Preview Image]         |  |  - Trending tags  |
|                   |  | [Like] [Comment] [Share]      |  |                   |
|                   |  |   |-- Threaded Comments       |  |                   |
|                   |  +-------------------------------+  |                   |
+-----------------------------------------------------------------------------+
| Mobile Only: Fixed Bottom Navigation: [Home] [Discover] [+] [Chat] [Profile] |
+-----------------------------------------------------------------------------+
```

### 3.3 Mobile Navigation Bar (5 Destinations)
1. **Home**: Social feed featuring user posts, milestone updates, and startup discussions.
2. **Discover**: Search and proximity filter for founders, co-founders, and builders.
3. **Create (`+`)**: Prominent floating or centered action button opening the post compose modal.
4. **Chat**: Private conversations list with unread badges.
5. **Profile**: User's founder identity, startup details, settings, and subscription management.

---

## 4. Functional Requirements

### FR-01: Authentication, Security & Logout State Wipe
- **Registration**: Full name, email, strong password, role selection (`founder`, `co-founder`, `builder`), startup stage, and profile image.
- **Login**: Email and password with brute-force rate limiting (40 attempts / 15 mins).
- **Session Persistence**: Secure, HTTP-only cookie with fallback Bearer token stored in `localStorage` for cross-context API and Socket.IO handshakes. Survives page reloads seamlessly.
- **Exhaustive Logout Wipe**:
  - Immediately invokes `POST /auth/logout` to clear HTTP-only server cookies.
  - Clears `localStorage` (`foundmet_user`, `foundmet_access_token`, `foundmet_admin_token`, `foundmet_connections`, `foundmet_shared_phones`, drafts).
  - Clears `sessionStorage`.
  - Disconnects Socket.IO connection (`disconnectSocket()`).
  - Clears Axios authorization headers.
  - Erases form state in memory so subsequent users on shared devices cannot retrieve credentials.

### FR-02: User Profile & Startup Identity
- **Profile Fields**: Name, Avatar, Bio, Founder Role, Match Role (`co-founder`, `builder`), Skills badges (`tech`, `product`, `design`, `business`, `marketing`), Project stage (`idea`, `development`, `execution`), Public location (city/state), Project link, and Phone sharing preferences.
- **Privacy Controls**: Precise coordinates and phone numbers remain private by default. Contact info is only disclosed upon mutual connection and explicit permission.

### FR-03: Founder Discovery & Geo-Radius Engine
- **Multi-parameter Search**: Search by keywords across founder name, bio, and skills.
- **Filters**: Role filter, Project Stage filter, and Distance radius (10 km, 25 km, 50 km, 100 km, or Any).
- **Actions**: Send connection request, cancel pending request, accept incoming request. Duplicate requests are strictly blocked at database level.

### FR-04: Professional Social Feed & Commenting Engine
- **Post Creation**:
  - Text body (up to 2,000 characters).
  - Optional media image attachment.
  - Category tags: `General`, `Seeking Co-Founder`, `Milestone`, `Idea`, `Tech`.
- **Feed Visibility**:
  - Unauthenticated visitors can view public feed posts (via `optionalAuth` middleware).
  - Write actions (Create post, Like, Comment, Share, Delete, Edit) strictly require authentication.
- **Interactions**:
  - **Like**: Optimistic toggle with atomic database increment/decrement.
  - **Threaded Comments**:
    - Add comments to any post with instantaneous UI append.
    - View full comment thread with author photo, name, and timestamp.
    - Delete own comments (or post owner / admin can moderate).
  - **Share**: One-click URL copy with visual confirmation toast + native Web Share API support on mobile. Increments share count.
  - **Post Management**: Post author can edit or delete their own posts; deleting removes associated comments atomically.

### FR-05: Chat & Communication (Text-Focused)
- **Standard Chat UI**:
  - Standard chat header displays ONLY contact photo, name, connection status, and options.
  - **Audio and video call buttons are removed from the standard chat header** to eliminate clutter and prevent unauthorized calling.
- **Chat Actions & Erasure**:
  - Send and receive text messages with real-time delivery via Socket.IO.
  - Read receipts and typing indicators.
  - **Erase Message**: Sender can delete individual messages. Propagates in real-time via Socket.IO to remove message from both participants' screens.
  - **Clear Conversation**: User can delete the entire chat history for a clean slate.

### FR-06: Subscription System & Feature Gating
- **Tier Logic**:
  | Feature | Free Tier | Paid Subscriber |
  | :--- | :--- | :--- |
  | Browse Founders & Discover | Yes | Yes |
  | Send Connection Requests | Yes | Yes |
  | Text Messaging | Yes | Yes |
  | Browse & Create Posts | Yes (Auth required) | Yes |
  | Like, Comment & Share | Yes (Auth required) | Yes |
  | High-Definition Voice Calling | **No** | **Yes (Verified on backend)** |
  | 1-on-1 Video Calling | **No** | **Yes (Verified on backend)** |
  | Priority Support & Profile Badge | No | Yes |
- **Security Rule**: Subscription status is verified **server-side** on every WebRTC call initiation attempt. Frontend flags cannot be bypassed.

### FR-07: Superadmin Management System
- **Real-Time Dashboard**: Total users, active users, new registrations, total staff, active subscriptions, pending reports, and server health.
- **Staff Management (RBAC)**:
  - Add staff with predefined roles: `Superadmin`, `Admin`, `Moderator`, `Support Staff`.
  - Suspend staff account or revoke administrative access.
  - Full audit logging of staff administrative actions.
- **User Management**:
  - Search and filter users by account status (`active`, `suspended`, `banned`).
  - Warn user, suspend user, or delete user with audit trail.
- **Subscription Management**:
  - Create and configure subscription plans (Name, Price, Duration, Permitted Features).
  - Enable/disable plans.
  - View active subscribers, expiry dates, and payment records.

---

## 5. Security & Privacy Requirements

- **SEC-01: Session & Password Security**: Passwords hashed with `bcrypt` (10 rounds minimum). Session tokens issued via cryptographically signed JWT with expiration.
- **SEC-02: Role-Based Access Control (RBAC)**: Strict separation between user routes, staff routes, and superadmin routes.
- **SEC-03: Input Validation & Sanitization**: Strict length limits, XSS prevention, and regex sanitization on all user input.
- **SEC-04: Non-blocking Email Pipeline**: Email dispatch utilizes bounded timeouts (under 5 seconds) to prevent SMTP network latency from stalling HTTP registration requests.

---

## 6. Technical Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 + Vite |
| **Routing** | React Router 7 |
| **Styling** | Bootstrap 5 + Custom Modern SCSS/CSS |
| **API Client** | Axios with centralized auth & error interceptors |
| **Backend Runtime** | Node.js (ES Modules) + Express 5 |
| **Database** | MongoDB + Mongoose 9 |
| **Real-time Engine** | Socket.IO 4 |
| **Email Service** | Nodemailer with non-blocking async execution |
| **Calling** | WebRTC with backend subscription handshake gating |

---

## 7. Acceptance Criteria & Definition of Done

1. [x] **LinkedIn-Style UI**: Desktop features a 3-column layout (profile, feed, recommendations); mobile features responsive cards with a 5-tab bottom navigation bar.
2. [x] **Social Feed & Comments**: Authenticated users can publish posts, like, write threaded comments, delete their own comments, and share. Unauthenticated visitors can view public posts without errors.
3. [x] **Chat Cleanliness & Erasure**: Standard chat header does not display call/video buttons. Senders can erase individual messages and clear conversations in real time.
4. [x] **Exhaustive Logout Wipe**: Logging out clears all storage, tokens, cookies, and socket listeners, leaving zero residual credentials.
5. [x] **Superadmin Panel**: Allows full staff role assignment, user status moderation, and subscription plan management with audit logging.
6. [x] **Security & Integrity**: 100% of backend tests and frontend tests pass cleanly.
