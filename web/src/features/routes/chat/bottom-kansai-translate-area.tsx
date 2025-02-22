import style from "./footer.module.scss";

type Props = {
  inputMessage: string | null;
  isReplyingNow: boolean;
};

export const BottomKansaiTranslateArea = (props: Props) => {
  return (
    <div className={style.kansai_bar} data-is-replying-now={props.isReplyingNow}>
      <p>{props.inputMessage}</p>
    </div>
  );
};
