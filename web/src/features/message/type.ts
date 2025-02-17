export type Message = {
  id: string;
  author: string;
  content: string;
  is_me: boolean;
  icon: string;
  reply_to_id: string | undefined;
};
