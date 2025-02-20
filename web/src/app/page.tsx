"use client";

import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, useAuth, UserButton } from "@clerk/nextjs";
import { apiClient } from "../zodios/apiclient";
import { MiniChat } from "@/features/mini-chat";

const Home = () => {
  const { getToken } = useAuth();

  return (
    <div>
      <Button>Push me</Button>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <Button
        onClick={async () => {
          await apiClient.get_user_me({ headers: { Authorization: `Bearer ${await getToken()}` } });
        }}
      >
        Push me
      </Button>
      <div style={{ width: "30em" }}>
        <MiniChat />
      </div>
    </div>
  );
};

export default Home;
