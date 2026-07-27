# Architecture

Diagrams for how the pieces of Moving Circle Therapy fit together, written as
[Mermaid](https://mermaid.js.org/) so they render directly on GitHub and stay
next to the code they describe (no separate diagramming tool to keep in sync).

## Diagrams

- [Mobile auth flow](./mobile-auth-flow.md) ([source `.mmd`](./auth-mobile-flow.mmd)) — register/login trace across `mobile/`, the backend `auth` module, and Postgres.

## Conventions

- Each diagram lives once, as a `.mmd` file with the raw Mermaid source (openable in [Mermaid Live Editor](https://mermaid.live) or any Mermaid-aware editor). The matching `.md` file links to it rather than pasting a copy — one source, nothing to fall out of sync.
- The `.md` file explains the diagram and links the source files it was traced from — one click from the diagram to the code.
- Diagrams describe what the code actually does today. If the code changes, update the diagram in the same PR — a stale diagram is worse than no diagram.
