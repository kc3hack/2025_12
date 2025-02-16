import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import type { Metadata } from "next";
import "@/style/global.scss";
import "@/style/theme-tailwind.css";
import { jaJP } from "@clerk/localizations";

export const metadata: Metadata = {
  title: "Occha",
  description: ""
};

const RootLayout = ({
  children
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <ClerkProvider localization={jaJP}>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
};

export default RootLayout;
