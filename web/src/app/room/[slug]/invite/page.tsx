"use client";

import styles from "@routes/invite/index.module.scss";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const InvitePage = () => {
  const { getToken } = useAuth();
  const pathname = usePathname().split("/");
  const roomId = pathname[2];
  const router = useRouter();

  const [roomName, setRoomName] = useState("");
  const [creatorImageUrl, setCreatorImageUrl] = useState("");

  useEffect(() => {
    getToken().then(async token => {
      const room = await apiClient.get_room({
        params: { room_id: roomId },
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoomName(room.room_name);

      if (!room.creator_id) {
        return;
      }

      const creator = await apiClient.get_user({
        params: { user_id: room.creator_id },
        headers: { Authorization: `Bearer ${token}` }
      });
      setCreatorImageUrl(creator.image_url ?? "");

      room.creator_id;
    });
  }, [getToken, roomId]);

  const handleClick = async () => {
    const token = await getToken();
    try {
      await apiClient.add_user_to_room(undefined, {
        params: { room_id: roomId },
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push(`/room/${roomId}`);
    } catch (error) {
      toast.error("すでに参加しているか，存在しません");
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle className={styles.title}>あなたに招待が来ています</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.group}>
            <Avatar className={styles.icon}>
              <AvatarImage src={creatorImageUrl} />
              <AvatarFallback>NoImage</AvatarFallback>
            </Avatar>
            <div className={styles.name}>{roomName}</div>
          </div>
        </CardContent>
        <CardFooter className={styles.footer}>
          <Button size="lg" onClick={handleClick}>
            参加する
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InvitePage;
