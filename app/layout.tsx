import type { Metadata } from "next";
import {
  Figtree,
  Red_Hat_Display,
  Noto_Sans_Georgian,
  Cantata_One,
} from "next/font/google";
import "./globals.css";
import { Nav } from "../components/nav";
import { Footer } from "../components/footer";
import { AuthProvider } from "@/components/context/authContext";
import { api } from "@/components/lib/api";
import { SiteProvider } from "@/components/helper/siteProvider";
import { Toaster } from "sonner";

const figTree = Figtree({
  variable: "--font-figTree",
  subsets: ["latin"],
});

const cantataOne = Cantata_One({
  variable: "--font-cantataOne",
  subsets: ["latin"],
  weight: ["400"],
});

const georgia = Noto_Sans_Georgian({
  variable: "--font-georgia",
  subsets: ["latin"],
  weight: ["400"],
});

const redHat = Red_Hat_Display({
  variable: "--font-redhat",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "Seraphé Beauty",
  description:
    "Our goal is to elevate and promote African beauty standards through Afro-inspired innovative beauty products, beauty technologies and beauty education.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [
    categories,
    trendFocusAreas,
    teamGrouped,
    products,
    trends,
    tips,
    lifestyle,
    tipsCategories,
  ] = await Promise.all([
    api.publicShop.getCategories(),
    api.publicShop.getTrendsByFocusAreas(),
    api.publicShop.getTeamByGrouped(),
    api.publicShop.getProducts(),
    api.publicShop.getTrends(),
    api.publicShop.getBeautyTips(),
    api.publicShop.getLifestyle(),
    api.publicShop.getBeautyTipsByCategories(),
  ]);
  return (
    <html
      lang="en"
      className={`${figTree.variable} ${cantataOne.variable} ${georgia.variable} ${redHat.variable} bg-[#faf9f9] h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteProvider
          categories={categories}
          trendFocusAreas={trendFocusAreas}
          teamGrouped={teamGrouped}
          products={products}
          trends={trends}
          tips={tips}
          lifestyle={lifestyle}
          tipsCategories={tipsCategories}
        >
          <Nav />
          <AuthProvider>
            <Toaster position="top-right" richColors />
            {children}
          </AuthProvider>

          <Footer />
        </SiteProvider>
      </body>
    </html>
  );
}
