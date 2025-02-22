import { Button } from "@/components/ui/button";
import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";

const Root = () => {
  return (
    <div>
      <Link href="/home">
        <Button>Go Home</Button>
      </Link>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
};
export default Root;
