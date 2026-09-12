import '../styles/globals.css';

export const metadata = {
  title: 'Flint Living Wiki v0',
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
