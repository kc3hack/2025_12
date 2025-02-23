"use client";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

const InvitePage = () => {
  const { getToken } = useAuth();
  const pathname = usePathname().split("/");
  const room_id = pathname[2];
  const router = useRouter();

  const handleClick = async () => {
    const token = await getToken();
    try {
      await apiClient.add_user_to_room(undefined, {
        params: { room_id: room_id },
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push(`/room/${room_id}`);
    } catch (error) {
      toast.error("すでに参加しているか，存在しません");
    }
  };

  return (
    <div>
      <p>{pathname[2]}</p>
      <Button onClick={handleClick}>参加</Button>
    </div>
  );
};

export default InvitePage;
