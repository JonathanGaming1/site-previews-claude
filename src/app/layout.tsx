import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "העסק שלך | אתר הדגמה",
  description:
    "אתר דמו יוקרתי לעסק שלך — עיצוב, תוכן ומיתוג שנבנו בהתאמה אישית. הופק אוטומטית על ידי הסוכנות.",
  robots: { index: false, follow: false },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Assistant:wght@200;300;400;600;700&family=Cormorant+Garamond:wght@300;400;500;600&family=Frank+Ruhl+Libre:wght@300;400;500;700&family=Heebo:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
