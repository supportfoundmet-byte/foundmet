# FoundMet API Documentation

This document describes the backend API contract the frontend currently depends on. It is written for developers working on FoundMet and focuses on the real endpoints used by the React client.

## Base configuration

The frontend builds the API base URL from the environment value `VITE_API_BASE_URL` and falls back to the production backend URL when it is not set.

```js
const configuredApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  "https://foundmet-backend-aoi6.onrender.com";
```

The client config also uses:

- `withCredentials: true`
- `timeout: 15000`
- cookie-based auth for browser requests
- `Authorization` header when a token exists in session storage for admin calls

Example:

```bash
VITE_API_BASE_URL=http://localhost:4000
```

## Authentication model

FoundMet currently uses a cookie-backed session for normal user auth and a session-storage token for admin flows. The frontend stores selected values in browser storage:

- `foundmet_user` in localStorage
- `foundmet_access_token` in sessionStorage
- `foundmet_admin_token` in sessionStorage

The client sends auth through cookies and, in some cases, an `Authorization` header. Any admin-only request uses the admin token if present.

## Common response patterns

The app handles a few common response shapes:

- `response.data.user` / `response.data.data.user`
- `response.data.users`
- `response.data.posts`
- `response.data.connected`
- `response.data.receivedRequests`
- `response.data.sentRequests`
- `response.data.messages`

Errors are normalized in the Axios interceptor and exposed as `error.userMessage` when available.

## Endpoint reference

### 1) Authentication

#### `POST /auth/create-account`
Creates a new founder profile.

Request type: multipart/form-data

Fields commonly sent by the frontend:

- `name`
- `email`
- `password`
- `role`
- `address`
- `matchRole`
- `buildType`
- `commitment`
- `hasProject`
- `projectDetails`
- `projectLink`
- `projectStatus`
- `lookingFor[]`
- `canBring[]`
- `image`

Example:

```js
await api.post("/auth/create-account", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});
```

Expected success behavior:

- returns a created user payload
- stores the user in localStorage
- stores an access token in sessionStorage if the backend returns one

#### `POST /auth/login`
Signs in an existing founder.

Request body:

```json
{
  "email": "founder@example.com",
  "password": "securePassword123"
}
```

Frontend handling:

```js
const res = await api.post("/auth/login", {
  email: formData.email.trim().toLowerCase(),
  password: formData.password,
});
```

Expected success behavior:

- `res.data.user` or `res.data.data.user` contains the authenticated founder
- `res.data.accessToken` or `res.data.data.accessToken` may be stored in sessionStorage
- frontend redirects to `/dashboard`

#### `GET /auth/me`
Loads the currently signed-in user session.

Expected response pattern:

```json
{
  "user": {
    "_id": "64d2...",
    "name": "Aarav",
    "email": "founder@example.com"
  }
}
```

Used by the dashboard to hydrate profile state and redirect banned or unauthorized users to `/login`.

#### `POST /auth/logout`
Ends the current session.

This is called from dashboard and header components and is intentionally tolerant of failure via `.catch(() => {})`.

### 2) Founder discovery

#### `GET /api/v1/users`
Fetches founders for the Explore screen using filters and proximity search.

Query parameters used by the frontend:

- `page` (default / current page)
- `limit`
- `search`
- `lat`
- `lng`
- `radiusKm`
- `skill`
- `stage`

Example:

```js
await api.get("/api/v1/users", {
  params: {
    page: 1,
    limit: 50,
    search: "ai",
    lat: 12.9716,
    lng: 77.5946,
    radiusKm: 25,
    skill: "backend",
    stage: "development",
  },
});
```

Expected response shape:

```json
{
  "users": [
    {
      "_id": "64d2...",
      "name": "Rhea",
      "address": "Bengaluru, India",
      "role": "founder",
      "matchRole": "co-founder",
      "hasProject": "yes"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 42,
    "totalPages": 1
  }
}
```

### 3) Connections

#### `GET /api/v1/connections`
Loads the signed-in user’s connection state and requests.

The dashboard expects:

- `data.connected`
- `data.sentRequests`
- `data.receivedRequests`

The explore page also fetches this endpoint to determine who is already connected and whether the user can message a founder.

Example response shape:

```json
{
  "success": true,
  "connected": [],
  "sentRequests": [],
  "receivedRequests": []
}
```

### 4) Posts

#### `GET /api/v1/posts`
Loads timeline posts for the current user dashboard.

Frontend usage:

```js
api.get("/api/v1/posts").then(({ data }) => setPosts(data.posts || []));
```

Expected response pattern:

```json
{
  "posts": [
    {
      "_id": "...",
      "text": "Launching our MVP next week.",
      "createdAt": "2026-09-12T00:00:00Z"
    }
  ]
}
```

#### `POST /api/v1/posts`
Creates a new post for the authenticated user.

Request body:

```json
{
  "text": "We are looking for a product-focused technical co-founder."
}
```

### 5) Messaging

#### `GET /api/v1/messages/:userId`
Loads message history for a connected user.

Example:

```js
api.get(`/api/v1/messages/${activeContact._id}`);
```

Expected response pattern:

```json
{
  "messages": [
    {
      "_id": "...",
      "senderId": "...",
      "receiverId": "...",
      "text": "Hi! Interested in working together?",
      "timestamp": "2026-09-12T10:00:00Z"
    }
  ]
}
```

#### `POST /api/v1/messages`
Sends a direct message to another founder.

Request body:

```json
{
  "receiverId": "64d2...",
  "text": "Would love to connect and discuss the product idea.",
  "clientId": "msg_172..."
}
```

The client treats `clientId` as an optimistic id for local UI updates before the server confirms the message.

### 6) Admin operations

The admin UI uses a dedicated set of routes behind a restricted session flow. These are all accessed by the frontend at `/admin/*` routes.

#### `GET /admin/session`
Checks whether the current browser session has a valid superadmin session.

#### `POST /admin/login`
Signs in a superadmin.

Request body:

```json
{
  "email": "admin@foundmet.com",
  "password": "supersecurepassword"
}
```

The frontend stores the returned admin token in `sessionStorage` under `foundmet_admin_token`.

#### `GET /admin/data`
Loads superadmin dashboard data, including users, reports, admins, and posts.

Query parameters used:

- `page`
- `limit`
- `search`

#### `GET /admin/status`
Loads backend status data for the admin dashboard shell.

#### `POST /admin/admins`
Creates a new superadmin account.

#### `PATCH /admin/admins/:id`
Performs superadmin actions like delete or status update.

#### `PATCH /admin/posts/:id`
Moderates a reported or flagged post action.

#### `DELETE /admin/posts/:id`
Deletes a post flagged as spam or undesirable.

#### `POST /admin/logout`
Logs out the superadmin session.

### 7) Socket.IO real-time events

The frontend connects to the same backend through Socket.IO and uses a singleton configured with the same base URL.

Connection config:

```js
io(SOCKET_URL, {
  autoConnect: false,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1500,
  timeout: 10000,
  transports: ["websocket", "polling"],
  withCredentials: true,
});
```

#### `register_presence`
Emitted when a user is browsing or active.

```js
socket.emit("register_presence", { userId: String(userId) });
```

#### `join_room`
Emitted when a user opens a chat room.

```js
socket.emit("join_room", { roomId });
```

#### `typing`
Emitted while a user types in a chat thread.

```js
socket.emit("typing", {
  roomId,
  userId: currentUser._id,
  userName: currentUser.name,
  isTyping: true,
});
```

#### `receive_message`
Receives new inbound messages in real time.

#### `user_typing`
Receives typing state updates for the active contact.

#### `message_error`
Receives if message delivery fails in realtime or via fallback HTTP.

## Frontend integration tips

1. Keep the backend URL centralized in `VITE_API_BASE_URL`.
2. Prefer the existing `api` Axios instance instead of creating ad-hoc HTTP clients.
3. Use cookie-based auth for public user flows and keep admin tokens in session storage only.
4. Handle API failures through centralized interceptor logic instead of custom catch branches when possible.
5. Treat the socket connection as a supplement to HTTP messaging; the app uses HTTP for message persistence and Socket.IO for live delivery.

## Notes for maintainers

- The client is a React + Vite frontend and does not own the backend schema.
- Several endpoints are inferred from the frontend usage and business logic rather than a generated OpenAPI spec.
- When adding or changing backend endpoints, update this document together with the frontend consumers in `src/`.
