"use client";

import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, useAuth, UserButton } from "@clerk/nextjs";
import { apiClient } from "../zodios/apiclient";

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
          const token = await getToken();
          await apiClient.get_user_me({ headers: { Authorization: token } });
        }}
      >
        Push me
      </Button>
    </div>
  );
};

export default Home;
