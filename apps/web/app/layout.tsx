import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Duze — Local favourites. Delivered.',
  description: 'Discover local kitchens, shisanyamas and everyday favourites in eXobho. Explore the Duze pilot catalogue.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-ZA"><body>{children}</body></html>;
}
