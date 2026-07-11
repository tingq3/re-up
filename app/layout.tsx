import type { Metadata } from "next";
import "./globals.css";
import { FridgeProvider } from "@/lib/fridge-context";
import TopBar from "./components/top-bar";

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
    <html lang="en">
      <body>
        <FridgeProvider>
          <TopBar />
          <main>{children}</main>
        </FridgeProvider>
      </body>
    </html>
  );
}
