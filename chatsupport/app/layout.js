import { Inter } from "next/font/google";
import ResponsiveAppBar from './appbar';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "hangu.ai | Chat Support",
  description: "Your AI Hangout Planner Chat Support!",
};

export default function RootLayout({ children }) {
  return (
    
    <html lang="en">
      <body className={inter.className}>
        <ResponsiveAppBar />
        {children}
      </body>
    </html>
  );
}
