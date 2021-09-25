import { useState } from 'react';
import { CardsInfo, CARD_POS } from '../utils/Constant';
import Cards from '../utils/Cards';
import '../style/IntroCards.scss';
import '../style/onedark.css';

const cards = new Cards(CardsInfo);

export default function IntroCards() {
  const cardsInfo = cards.getCardsInfo();
  const [, setRefresh] = useState(Math.random());
  
  return (
    <div className="introCards">
      {
        cardsInfo.map((val, index) => {
          const { name, cardInfo, position } = val;
          return <IntroCard key={index} name={name} cardInfo={cardInfo} position={position} refresh={setRefresh} />;
        })
      }
    </div>
  );
}

interface IProps {
  name: string;
  cardInfo: any;
  position: CARD_POS;
  refresh: any;
};

function IntroCard(props: IProps) {
  const { name, cardInfo, position, refresh } = props;
  const keys = Object.keys(cardInfo);

  const handleClick = () => {
    cards.switchCards();
    refresh(Math.random());
  };

  const getHTMLForArrVal = (val: string[]) => {
    const start = <span>{`[`}</span>;
    const content = [];
    for (let i = 0; i < val.length; i++) {
      content.push(
        <pre key={val[i]} className="CodeMirror-line">
          <span className="cm-string">{`    "${val[i]}"`}</span>
          <span>{`,`}</span>
        </pre>
      );
    }
    const end = (
      <pre className="CodeMirror-line">
        <span>{`  ],`}</span>
      </pre>
    );

    return (
      <>
        {start}
        {content}
        {end}
      </>
    );
  };

  return (
    <div className={position} onClick={handleClick}>
      <div className="circles">
        <div className="navCircleRed"></div>
        <div className="navCircleYellow"></div>
        <div className="navCircleGreen"></div>
      </div>
      <div className="procode">
        <pre className="CodeMirror-line">
          <span className="cm-keyword">const </span>
          <span className="cm-def">{name}</span>
          <span className="cm-operator">{` = `}</span>
          <span>{`{`}</span>
        </pre>
        {
          keys.map(key => {
            let val = cardInfo[key];
            if (Array.isArray(val)) {
              val = getHTMLForArrVal(val);
            } else {
              val = (
                <>
                  <span className="cm-string">{`"${val}"`}</span>
                  <span>{`,`}</span>
                </>
              )
            }
            return (
              <pre key={key} className="CodeMirror-line">
                <span className="cm-property">{`  ${key}: `}</span>
                {val}
              </pre>
            );
          })
        }
        <pre className="CodeMirror-line">
          <span>{`}`}</span>
        </pre>
      </div>
    </div>
  );
}