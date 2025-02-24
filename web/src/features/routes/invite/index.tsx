import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import styles from "./index.module.scss";

type InviteData = {
  image: string;
  name: string;
};
const sampleData: InviteData = {
  image: "https://github.com/shadcn.png",
  name: "name"
};

export const Invite = () => {
  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle className={styles.title}>あんたに招待が来とります</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.group}>
            <Avatar className={styles.icon}>
              <AvatarImage src={sampleData.image} />
              <AvatarFallback>NoImage</AvatarFallback>
            </Avatar>
            <div className={styles.name}>{sampleData.name}</div>
          </div>
        </CardContent>
        <CardFooter className={styles.footer}>
          <Button size="lg">参加する</Button>
        </CardFooter>
      </Card>
    </div>
  );
};
