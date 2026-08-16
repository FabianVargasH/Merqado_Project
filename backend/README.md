# Merqado API

## Local setup

```bash
npm ci
cp .env.example .env
npm run seed
npm run dev
```

The API listens on port `5743` by default. `MONGODB_URI` must point to a MongoDB replica set when creating orders because stock decrement and order creation run in one transaction.

## Partner authentication contract

This backend does not issue tokens or implement login/registration. The partner authentication flow must issue a JWT signed with the same `JWT_SECRET` and include:

```json
{ "id": "user-id", "email": "customer@example.com", "role": "customer" }
```

Admin endpoints require `role: "admin"`. The frontend looks for the token in `merqado_access_token` or `token` in `localStorage`.

## Tests

```bash
npm test
```
