import './theme.css';
import '@coinbase/onchainkit/styles.css';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// Define frame metadata for Farcaster embedding
const frame = {
  version: "next",
  imageUrl: "https://talenthub-minikit.vercel.app/logo.png",
  button: {
    title: "Launch TalentHub",
    action: {
      type: "launch_frame",
      name: "TalentHub",
      url: "https://talenthub-minikit.vercel.app/",
      splashImageUrl: "https://talenthub-minikit.vercel.app/logo.png",
      splashBackgroundColor: "#0052FF",
    },
  },
};

export const metadata = {
  title: 'TalentHub - Find top developers with verified credentials',
  description: 'A recruitment mini app powered by Talent Protocol API',
  icons: {
    icon: '/logo.png',
  },
  // Add frame metadata for embedding in Farcaster
  other: {
    "fc:frame": JSON.stringify(frame),
  },
  // Add Mini App specific metadata
  miniApp: {
    name: 'TalentHub',
    description: 'Find talented developers with verified credentials from Talent Protocol',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
