import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jokester Merch Generator',
  description: 'Turn your images into custom merchandise in seconds',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

