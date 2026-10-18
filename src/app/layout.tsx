import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Big Board | CFB Prospect Tracker',
  description: 'College football prospect rankings, season statistics, scouting notes, and ESPN stats sync.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="dark"><body className="antialiased">{children}</body></html>;
}
