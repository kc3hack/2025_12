"use client";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

const InvitePage = () => {
  const pathname = usePathname().split("/");

  const handleClick = () => {};

  return (
    <div>
      <p>{pathname[2]}</p>
      <Button onClick={handleClick}>参加</Button>
    </div>
  );
};

export default InvitePage;
