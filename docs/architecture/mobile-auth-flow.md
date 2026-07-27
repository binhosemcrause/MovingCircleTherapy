# Mobile auth flow

Traces `mobile/src/screens/ProfileScreen.tsx` sign-in/sign-up through the
backend `auth` module to Postgres, including where the client currently stops
using what the API gives it back.

Diagram: [`auth-mobile-flow.mmd`](./auth-mobile-flow.mmd) — open it in the
[Mermaid Live Editor](https://mermaid.live) or any Mermaid-aware editor
extension. Kept as a single `.mmd` source rather than pasted here too, so
there's nothing to fall out of sync.

## Layers

- **UI layer (mobile)** — the login/register screen collects credentials and calls the API client. It only ever reads the `user` field back out of the response.
- **API client layer (mobile)** — a thin fetch wrapper that posts credentials to the backend and parses the JSON response into a typed result.
- **Presentation layer (backend)** — routes and a controller validate the incoming request and delegate to the application layer. Nothing here touches the database or the tokens directly.
- **Application layer (backend)** — use cases hold the actual logic: check the email, hash or compare the password, issue a token pair, and (for refresh/logout) rotate or revoke tokens.
- **Security layer (backend)** — password hashing and JWT signing/verification live here as isolated services. Refresh tokens are hashed before anything is persisted, so the raw value never reaches storage.
- **Data layer** — Postgres holds users and a hashed refresh-token table used to validate and revoke sessions.

## Where the layering breaks down

The backend's layers are complete end to end — including refresh and logout,
and a hashed refresh-token record for revoking sessions. The mobile side stops
one layer short: the UI layer never hands the issued tokens down to a
persistence layer, and the API client layer never reads a token back to attach
to later requests. Concretely, that means:

- No token persistence layer on the client (nothing like secure storage exists yet).
- The API client layer never attaches an authenticated header, so every request is effectively anonymous.
- The backend's refresh and logout capabilities are unused — the client has no code path that calls them.

Closing that gap means adding a persistence layer on the client and teaching
the API client layer to attach and refresh a token — the natural next step
before any screen needs an authenticated request.
