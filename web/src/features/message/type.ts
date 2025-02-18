export type Message = {
  id: string;
  author: string;
  content: string;
  is_me: boolean;
  icon: string | null;
  reply_to_id: string | null;
};
