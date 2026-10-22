# TECHx26 Museum of Technology

A high-fidelity interactive concept for Westpac's TECHx26 event. The phone-first experience reframes an event site as a digital museum with exhibition wings, curated tours, a venue map, saved exhibits and a QR-powered passport.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

## Concept architecture

This prototype uses React, TypeScript and browser storage. It is intentionally backend-free so the experience can be reviewed immediately. For production, exhibit data would move to a headless CMS and passport state to an authenticated API.

The built-in camera scanner reads QR codes at each booth, reveals the corresponding exhibit and awards its passport stamp. Codes can deep-link to `/exhibits/:id`; manual booth-code entry remains available for accessibility and camera failures.
