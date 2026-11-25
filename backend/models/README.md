# Database layer (MongoDB + Mongoose)

Owner: Pankaj Gurjar. Models live in `backend/models/`. Import them with:

```js
const { User, CompanyContent, Campaign, GeneratedContent, SocialAccount, Post } = require("./models");
```

Set `MONGO_URI` and `TOKEN_ENCRYPTION_KEY` in `backend/.env` (see `.env.example`). `server.js` connects on start-up.

## Collections

| Model | Purpose | Key rules |
|---|---|---|
| `User` | Admin and editor accounts | Unique email. Password stored as a bcrypt hash and hidden by default. Roles: `admin`, `editor`. |
| `CompanyContent` | Extracted company data | `sourceUrl` required. Unique `contentHash` (type + title + source URL), so a re-sync updates instead of duplicating. Status: `pending`, `approved`, `rejected`. |
| `Campaign` | A promotion of one approved content item | References `CompanyContent` and `User`. At least one platform. |
| `GeneratedContent` | AI captions and hashtags | One row per campaign, platform and `version`. Regenerating adds a new version. |
| `SocialAccount` | Connected social accounts | Tokens stored AES-256-GCM encrypted, hidden by default. Unique per platform and external account ID. `isSimulated` marks test mode. |
| `Post` | A post to publish | Status flow with automatic `history`. `dedupeKey` blocks duplicate live posts. `metrics` holds analytics. |

## Helpers for the other modules

**Gouranvi (extraction):**
`CompanyContent.upsertFromExtraction({ type, title, text, sourceUrl, imageRefs })` returns `{ doc, action }` where action is `created`, `updated` or `unchanged`. If the source text changed, the item returns to `pending`.

**Garima (APIs):**
- `User.register({ name, email, password, role })` and `User.authenticate(email, password)` (returns the user or `null`).
- `contentDoc.approve(userId)` and `contentDoc.reject()`.

**Ninad (AI):**
`GeneratedContent.addVersion({ campaign, sourceContent, platform, caption, hashtags, unsupportedClaims })` sets the version number for you.

**Sumana (social and scheduling):**
- Save a token: `account.setAccessToken(plain); await account.save()`.
- Read it back: load with `.select("+accessTokenEnc")`, then `account.getAccessToken()`.
- Due posts: `Post.findDue()`.
- Change status: `post.setStatus("failed", "reason"); await post.save()`. Every status change is written to `post.history`.

## Status flow for `Post`

`draft` -> `approved` -> `scheduled` or `publishing` -> `published` or `failed` -> (retry) `publishing`. `cancelled` is possible before publishing. A scheduled post needs `scheduledFor`.

## Tests

`npm run test:db` runs create, read, update, delete, duplicate and encryption checks against `MONGO_URI` (use a throwaway database, the script drops it). With no `MONGO_URI` it tries an in-memory MongoDB, which needs internet access to download the MongoDB binary.
