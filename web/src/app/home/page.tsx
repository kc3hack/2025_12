import { Chat } from "@/features/routes/home/groups";
import { Friends } from "@/features/routes/home/header";
const home = () => {
  return (
    <div>
      <Friends />
      <Chat />
    </div>
  );
};
export default home;
