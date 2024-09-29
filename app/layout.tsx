import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/navbar";
import { FC, ReactNode } from 'react';

export const metadata: Metadata = {
  title: "shaz",
  description: "shaz",
};

const RootLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <html lang="en">
      <body className="bg-[#191919] text-white min-h-screen">
        <Navbar />
        <div>{children}</div>
      </body>
    </html>
  );
};

export default RootLayout;
