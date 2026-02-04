# Google Slides API Reference

## Overview

Optional export from HTML to Google Slides. Requires Google Cloud project with Slides API enabled.

## Prerequisites

1. Google Cloud project
2. Slides API enabled
3. OAuth 2.0 credentials or Service Account
4. Drive API enabled (for image uploads)

## Authentication

### Service Account (Recommended for Automation)

```typescript
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account.json',
  scopes: [
    'https://www.googleapis.com/auth/presentations',
    'https://www.googleapis.com/auth/drive.file',
  ],
});

const slides = google.slides({ version: 'v1', auth });
const drive = google.drive({ version: 'v3', auth });
```

### OAuth 2.0 (For User-Owned Presentations)

```typescript
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);

oauth2Client.setCredentials({
  access_token: 'ACCESS_TOKEN',
  refresh_token: 'REFRESH_TOKEN',
});
```

## Create Presentation

```typescript
const presentation = await slides.presentations.create({
  requestBody: {
    title: 'My Presentation',
  },
});

const presentationId = presentation.data.presentationId;
```

## Add Slides

```typescript
await slides.presentations.batchUpdate({
  presentationId,
  requestBody: {
    requests: [
      {
        createSlide: {
          objectId: 'slide_1',
          insertionIndex: 0,
          slideLayoutReference: {
            predefinedLayout: 'TITLE_AND_BODY',
          },
        },
      },
    ],
  },
});
```

## Predefined Layouts

| Layout | Description |
|--------|-------------|
| `BLANK` | Blank slide |
| `CAPTION_ONLY` | Caption at bottom |
| `TITLE` | Title slide |
| `TITLE_AND_BODY` | Title with body text |
| `TITLE_AND_TWO_COLUMNS` | Title with two columns |
| `TITLE_ONLY` | Title only |
| `SECTION_HEADER` | Section header |
| `SECTION_TITLE_AND_DESCRIPTION` | Section with description |
| `ONE_COLUMN_TEXT` | Single column text |
| `MAIN_POINT` | Main point emphasized |
| `BIG_NUMBER` | Large number display |

## Add Text

```typescript
await slides.presentations.batchUpdate({
  presentationId,
  requestBody: {
    requests: [
      {
        insertText: {
          objectId: 'title_element_id',
          text: 'Slide Title',
        },
      },
      {
        insertText: {
          objectId: 'body_element_id',
          text: 'Body content goes here',
        },
      },
    ],
  },
});
```

## Format Text

```typescript
{
  updateTextStyle: {
    objectId: 'text_box_id',
    textRange: {
      type: 'ALL',
    },
    style: {
      fontFamily: 'Arial',
      fontSize: { magnitude: 18, unit: 'PT' },
      foregroundColor: {
        opaqueColor: {
          rgbColor: { red: 0.2, green: 0.2, blue: 0.2 },
        },
      },
      bold: true,
    },
    fields: 'fontFamily,fontSize,foregroundColor,bold',
  },
}
```

## Add Images

### Upload to Drive First

```typescript
const imageFile = await drive.files.create({
  requestBody: {
    name: 'slide-image.png',
    mimeType: 'image/png',
  },
  media: {
    mimeType: 'image/png',
    body: fs.createReadStream('image.png'),
  },
});

// Make file accessible
await drive.permissions.create({
  fileId: imageFile.data.id,
  requestBody: {
    role: 'reader',
    type: 'anyone',
  },
});
```

### Insert Image

```typescript
{
  createImage: {
    objectId: 'image_1',
    url: `https://drive.google.com/uc?id=${imageFile.data.id}`,
    elementProperties: {
      pageObjectId: 'slide_1',
      size: {
        height: { magnitude: 300, unit: 'PT' },
        width: { magnitude: 400, unit: 'PT' },
      },
      transform: {
        scaleX: 1,
        scaleY: 1,
        translateX: 100,
        translateY: 150,
        unit: 'PT',
      },
    },
  },
}
```

## Set Background Color

```typescript
{
  updatePageProperties: {
    objectId: 'slide_1',
    pageProperties: {
      pageBackgroundFill: {
        solidFill: {
          color: {
            rgbColor: { red: 0.1, green: 0.1, blue: 0.1 },
          },
        },
      },
    },
    fields: 'pageBackgroundFill',
  },
}
```

## HTML to Slides Mapping

| HTML (reveal.js) | Slides API |
|------------------|------------|
| `<section>` | `createSlide` |
| `<h1>`, `<h2>` | Title placeholder |
| `<p>`, `<ul>`, `<ol>` | Body placeholder |
| `<img>` | `createImage` |
| `data-background-color` | `updatePageProperties` |
| `<aside class="notes">` | Speaker notes (separate API) |
| CSS colors | `rgbColor` objects |

## Speaker Notes

```typescript
{
  insertText: {
    objectId: 'speaker_notes_shape_id',
    text: 'Speaker notes for this slide',
  },
}
```

## Export Link

After creation, generate shareable link:

```typescript
const shareUrl = `https://docs.google.com/presentation/d/${presentationId}/edit`;
const presentUrl = `https://docs.google.com/presentation/d/${presentationId}/present`;
```

## Rate Limits

- 300 requests per minute per user
- Batch requests to stay under limit
- Use exponential backoff on 429 errors

## Error Handling

```typescript
try {
  await slides.presentations.batchUpdate({ ... });
} catch (error) {
  if (error.code === 429) {
    // Rate limited - wait and retry
    await sleep(error.retryAfter * 1000);
    // Retry request
  } else if (error.code === 403) {
    // Permission denied - check scopes
  } else if (error.code === 404) {
    // Presentation not found
  }
}
```
