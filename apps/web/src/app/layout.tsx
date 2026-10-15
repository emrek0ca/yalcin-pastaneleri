import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { BranchProvider } from '@/context/BranchContext';
import { CartProvider } from '@/context/CartContext';
import { BRAND_INFO } from '@yalcin/shared';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata: Metadata = {
  title: `${BRAND_INFO.name} — Osmaniye'nin En Lezzetli Mekanı`,
  description:
    '1997’den beri Pastaneci Emine Abla. Taptaze baklavalar, özel gün pastaları, sütlü tatlılar, çikolatalar ve zengin dünya mutfağı. Osmaniye Merkez Raufbey ve Adnan Menderes şubeleriyle hizmetinizde.',
  icons: {
    icon: `${basePath}/assets/brand/favicon.png`,
  },
  openGraph: {
    title: 'Yalçın Pastaneleri — Osmaniye',
    description: '1997’den beri Pastaneci Emine Abla. Yalçın Ailenizin Pastanesi.',
    url: 'https://qrmenu.yalcinpastaneleri.com',
    siteName: 'Yalçın Pastaneleri',
    locale: 'tr_TR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen flex flex-col bg-white text-primary selection:bg-accent-light selection:text-accent">
        <BranchProvider>
          <CartProvider>
            <Navbar />
            <CartDrawer />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </BranchProvider>
      </body>
    </html>
  );
}
