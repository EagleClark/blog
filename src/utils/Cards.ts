import { CARD_POS } from "./Constant";

interface CardInfo {
  name: string;
  cardInfo: any;
  position: CARD_POS;
}

class Card {
  name: string;
  cardInfo: object;
  position: CARD_POS;
  next: Card | null;

  constructor(name: string, cardInfo: object, position: CARD_POS) {
    this.name = name;
    this.cardInfo = cardInfo;
    this.position = position;
    this.next = null;
  }

  getCradInfo(): CardInfo {
    return {
      name: this.name,
      cardInfo: this.cardInfo,
      position: this.position,
    }
  }
}

export default class Cards {
  card: Card = new Card('', {}, CARD_POS.WAIT);
  size: number = 0;

  constructor(cardsInfo: CardInfo[]) {
    this.init(cardsInfo);
  }

  private init(cardsInfo: CardInfo[]) {
    let currentCard = null;
    let lastCard = null;
    for (let i = 0; i < cardsInfo.length; i++) {
      const { name, cardInfo, position } = cardsInfo[i];
      lastCard = currentCard;
      currentCard = new Card(name, cardInfo, position);
      if (lastCard) {
        lastCard.next = currentCard;
      }
      
      if (i === 0) {
        this.card = currentCard;
      }
      
      if (i === cardsInfo.length - 1) {
        currentCard.next = this.card;
      }

      this.size++;
    }
  }

  getCardsInfo(): CardInfo[] {
    const res: CardInfo[] = [this.card.getCradInfo()];
    let currentCard = this.card.next;

    if (currentCard) {
      while (currentCard !== this.card) {
        res.push(currentCard.getCradInfo());
        if (currentCard.next) {
          currentCard = currentCard.next;
        }
      }
    }

    return res;
  }

  switchCards() {
    let currentCard = this.card;
    let index = 0;
    while (index < this.size) {
      if (currentCard.position === CARD_POS.FRONT) {
        currentCard.position = CARD_POS.FALL;
      } else if (currentCard.position === CARD_POS.FOLLOWED) {
        currentCard.position = CARD_POS.FRONT;
        if (currentCard.next) {
          currentCard = currentCard.next;
          currentCard.position = CARD_POS.FOLLOWED;
          index++;
        }
      } else {
        currentCard.position = CARD_POS.WAIT;
      }

      if (currentCard.next) {
        currentCard = currentCard.next;
        index++;
      }
    }
  }
}