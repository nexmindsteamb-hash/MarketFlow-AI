# AI Content Contract (v1 draft)

Owner: Ninad Nemawarkar (AI module). Status: draft for team feedback.

## Endpoint (to be added to the backend by Garima)
`POST /api/ai/generate`

## Request
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| companyItem.id | string | yes | ID from the database |
| companyItem.title | string | yes | Service, product or page title |
| companyItem.type | string | yes | e.g. service, product, blog, offer |
| companyItem.description | string | yes | Approved company text used as the facts |
| companyItem.sourceUrl | string | yes | Page the data came from |
| platform | string | yes | instagram, facebook, linkedin, x (to confirm with Sumana) |
| tone | string | no | professional, friendly, energetic (default: professional) |
| goal | string | no | awareness, leads, engagement, promotion |
| variations | number | no | 1-3 (default: 1) |
| instruction | string | no | For regeneration, e.g. "make it shorter" |

Example:
```json
{
  "companyItem": {
    "id": "64f1...",
    "title": "Social Media Management",
    "type": "service",
    "description": "We plan, design and schedule posts for small businesses.",
    "sourceUrl": "https://example.com/services/social-media"
  },
  "platform": "instagram",
  "tone": "friendly",
  "goal": "leads",
  "variations": 1
}
```

## Success response
| Field | Type | Notes |
| --- | --- | --- |
| success | boolean | true |
| data.items[] | array | One entry per variation |
| items[].caption | string | Final caption text |
| items[].hashtags | string[] | Without limits exceeded for the platform |
| items[].description | string | Longer promotional description |
| items[].cta | string | Call to action |
| items[].sourceRefs | object[] | { itemId, sourceUrl } the content is based on |
| items[].warnings | string[] | Unsupported claims or length issues to review before approval |
| items[].charCount | number | Caption length |
| data.model | string | Model that produced the output |
| data.promptVersion | string | e.g. v1 |

Example:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "caption": "Too busy to post? We plan, design and schedule it for you.",
        "hashtags": ["#SocialMedia", "#SmallBusiness", "#Marketing"],
        "description": "We plan, design and schedule posts for small businesses.",
        "cta": "Message us to get started.",
        "sourceRefs": [{ "itemId": "64f1...", "sourceUrl": "https://example.com/services/social-media" }],
        "warnings": [],
        "charCount": 58
      }
    ],
    "model": "gemini-3.8-flash",
    "promptVersion": "v1"
  }
}
```

## Error response
```json
{ "success": false, "error": { "code": "MODEL_BUSY", "message": "The AI model is busy, please retry." } }
```
| Code | Meaning | Frontend action |
| --- | --- | --- |
| INVALID_INPUT | Missing or wrong field | Show field error |
| MODEL_BUSY | Gemini overloaded (503) after retries | Offer "Try again" |
| RATE_LIMITED | Request limit reached (429) | Ask user to wait |
| TIMEOUT | Gemini too slow | Offer "Try again" |
| BLOCKED_CONTENT | Gemini refused the content | Show message, edit input |
| INTERNAL_ERROR | Anything else | Show generic error |

## Content status (for the database, Pankaj)
`draft` -> `edited` -> `approved`. Store with each item: platform, tone, model, promptVersion, createdAt, and the item IDs used.

## Rules
- The AI uses only the supplied company data; it must not invent prices, clients, statistics or guarantees.
- Anything uncertain goes into `warnings`, and the admin approves before publishing.
- Platform limits come from `platformRules` (confirmed on Day 5).