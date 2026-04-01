// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <html>
      <body>
        <h2>404 - Page Not Found</h2>
        <Link href="/">Go Home</Link>
      </body>
    </html>
  );
}