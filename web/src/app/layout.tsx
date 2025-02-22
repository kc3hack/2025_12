import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "@/style/global.scss";
import "@/style/theme-tailwind.css";
import { jaJP } from "@clerk/localizations";
import { UserInitialyzer } from "@/features/account/user-initialyzer";
import { Header } from "@/features/header";

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
        <body>
          <Header />
          <UserInitialyzer />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
};

export default RootLayout;
