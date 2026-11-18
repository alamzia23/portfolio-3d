import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Alam Zia — DevOps, Cloud & AI Engineering',
  description: 'Production infrastructure. Intentional automation. Explore Alam Zia’s work across webMethods MFT, cloud platforms, GitOps and AI agents.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
