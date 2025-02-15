import type { Metadata } from "next";
import "@/style/global.scss";
import "@/style/theme-tailwind.css";

export const metadata: Metadata = {
  title: "Occha",
  description: "",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
