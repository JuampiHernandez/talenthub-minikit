import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    "miniApp": {
      "name": "TalentHub",
      "description": "Find talented developers with verified credentials from Talent Protocol",
      "icons": [
        {
          "src": "/logo.svg",
          "sizes": "512x512",
          "type": "image/svg+xml"
        }
      ],
      "image": {
        "src": "/logo.svg"
      },
      "domains": ["talenthub-minikit.vercel.app", "localhost:3000"],
      "permissions": [
        "notification:read",
        "notification:write",
        "frame:read",
        "frame:write",
        "user:read",
        "cast:write"
      ]
    }
  });
}
