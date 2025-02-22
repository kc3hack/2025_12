export type Message = {
  id: string;
  author_id: string | null;
  author_name: string | null;
  content: string;
  is_me: boolean;
  icon: string | null;
  reply_to_id: string | null;
  reactions: Reaction[] | null;
};

export type Reaction = {
  reaction_name: string;
  count: number;
};
