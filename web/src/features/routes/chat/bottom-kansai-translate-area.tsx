import style from "./footer.module.scss";

type Props = {
  inputMessage: string | null;
};

export const BottomKansaiTranslateArea = (props: Props) => {
  return (
    <div className={style.kansai_bar}>
      <p>{props.inputMessage}</p>
    </div>
  );
};
