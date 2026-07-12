import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { FridgeProvider } from "@/lib/fridge-context";
import TopBar from "./components/top-bar";

const jost = Jost({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PrepFridge — Cook what you have",
  description: "Turn fridge ingredients into personalised recipes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jost.className}>
      <body className="bg-cream text-ink">
        <FridgeProvider>
          <TopBar />
          <main>{children}</main>
        </FridgeProvider>
      </body>
    </html>
  );
}
