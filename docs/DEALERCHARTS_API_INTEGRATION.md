# DealerCharts API Integration Guide

## Overview

This document explains how to post news, tweets, and Rumble videos to DealerCharts.com from an external admin panel.

---

## API Base URL

```
https://dealercharts.com/api/news
```

---

## Authentication

All write operations require the `Authorization` header with a Bearer token.

```
Authorization: Bearer YOUR_ADMIN_SECRET_TOKEN
```

Contact the DealerCharts admin for the token value.

---

## Endpoints

### 1. Create a News Post

**POST** `/api/news`

Creates a new news post with optional Twitter and Rumble embeds.

#### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_SECRET_TOKEN
```

#### Request Body
```json
{
  "title": "Gold Surges Past $2,700",
  "content": "Optional text content for the post",
  "twitterUrl": "https://x.com/username/status/1234567890",
  "rumbleUrl": "https://rumble.com/v1abc2d-video-title.html",
  "published": true
}
```

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Post headline |
| `content` | string | No | Body text (can be empty) |
| `twitterUrl` | string | No | Twitter/X post URL to embed |
| `rumbleUrl` | string | No | Rumble video URL to embed |
| `published` | boolean | No | Default: `true`. Set to `false` for drafts |

#### Supported URL Formats

**Twitter/X:**
- `https://twitter.com/username/status/1234567890`
- `https://x.com/username/status/1234567890`

**Rumble:**
- `https://rumble.com/v1abc2d-video-title.html` (regular video page)
- `https://rumble.com/embed/v1abc2d/` (embed URL)

#### Response
```json
{
  "id": "abc123xyz",
  "title": "Gold Surges Past $2,700",
  "content": "Optional text content for the post",
  "twitterUrl": "https://x.com/username/status/1234567890",
  "rumbleUrl": "https://rumble.com/v1abc2d-video-title.html",
  "published": true,
  "createdAt": "2026-02-09T00:30:00.000Z",
  "updatedAt": "2026-02-09T00:30:00.000Z"
}
```

---

### 2. Get All Posts (Public)

**GET** `/api/news`

No authentication required. Returns published posts only.

#### Response
```json
[
  {
    "id": "abc123xyz",
    "title": "Gold Surges Past $2,700",
    "content": "...",
    "twitterUrl": "https://x.com/...",
    "rumbleUrl": "https://rumble.com/...",
    "published": true,
    "createdAt": "2026-02-09T00:30:00.000Z",
    "updatedAt": "2026-02-09T00:30:00.000Z"
  }
]
```

---

### 3. Update a Post

**PUT** `/api/news/:id`

#### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_SECRET_TOKEN
```

#### Request Body
```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "twitterUrl": "https://x.com/new/status/999",
  "rumbleUrl": null,
  "published": true
}
```

All fields are optional. Only include fields you want to update.

---

### 4. Delete a Post

**DELETE** `/api/news/:id`

#### Headers
```
Authorization: Bearer YOUR_ADMIN_SECRET_TOKEN
```

#### Response
```json
{
  "success": true
}
```

---

## Code Examples

### cURL - Create Post with Tweet

```bash
curl -X POST https://dealercharts.com/api/news \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET_TOKEN" \
  -d '{
    "title": "Market Update",
    "twitterUrl": "https://x.com/GoldNews/status/1234567890"
  }'
```

### cURL - Create Post with Rumble Video

```bash
curl -X POST https://dealercharts.com/api/news \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET_TOKEN" \
  -d '{
    "title": "Weekly Analysis",
    "rumbleUrl": "https://rumble.com/v1abc2d-gold-analysis.html"
  }'
```

### JavaScript/Fetch

```javascript
async function postToDealerCharts({ title, content, twitterUrl, rumbleUrl }) {
  const response = await fetch('https://dealercharts.com/api/news', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_ADMIN_SECRET_TOKEN'
    },
    body: JSON.stringify({
      title,
      content,
      twitterUrl,
      rumbleUrl,
      published: true
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to post: ${response.status}`);
  }

  return response.json();
}

// Example usage
postToDealerCharts({
  title: 'Gold Market Alert',
  twitterUrl: 'https://x.com/user/status/123456'
});
```

### PHP

```php
<?php
function postToDealerCharts($title, $twitterUrl = null, $rumbleUrl = null) {
    $data = [
        'title' => $title,
        'published' => true
    ];

    if ($twitterUrl) $data['twitterUrl'] = $twitterUrl;
    if ($rumbleUrl) $data['rumbleUrl'] = $rumbleUrl;

    $ch = curl_init('https://dealercharts.com/api/news');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer YOUR_ADMIN_SECRET_TOKEN'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    curl_close($ch);

    return json_decode($response, true);
}

// Example
postToDealerCharts('Gold Update', 'https://x.com/user/status/123');
?>
```

---

## Admin Panel Integration Checklist

For the USMediaRatings.com admin panel, add:

1. **Checkbox**: "Post to DealerCharts"
2. **Input fields** (shown when checkbox is checked):
   - Title (required)
   - Twitter/X URL (optional)
   - Rumble URL (optional)
3. **On form submit**: Call the DealerCharts API if checkbox is checked

---

## Error Responses

| Status | Meaning |
|--------|---------|
| 401 | Invalid or missing Authorization token |
| 400 | Missing required field (title) |
| 404 | Post not found (for update/delete) |
| 500 | Server error |

---

## Contact

For API token or questions, contact the DealerCharts administrator.
