import { Button } from "@/components/ui/button";
import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";

const Root = () => {
  return (
    <main>
      <Link href="/home">
        <Button>Go Home</Button>
      </Link>
    </main>
  );
};
export default Root;
