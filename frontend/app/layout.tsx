import '../styles/globals.css';

export const metadata = {
  title: 'Pricing for launch · Flint',
  description: 'Turn Slack into living wikis',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
