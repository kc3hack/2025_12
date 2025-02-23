import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "@/style/global.scss";
import "@/style/theme-tailwind.css";
import { UserInitialyzer } from "@/features/account/user-initialyzer";
import { jaJP } from "@clerk/localizations";
import { Toaster } from "@/components/ui/sonner";

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
          <UserInitialyzer />
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
};

export default RootLayout;
