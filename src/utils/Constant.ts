export enum CARD_POS {
  FRONT = 'frontCard',
  FOLLOWED = 'followedCard',
  WAIT = 'introCard',
  FALL = 'fallCard',
};

export interface CardInfo {
  [propName: string]: string | string[];
}

interface CardInfoConfig {
  name: string;
  cardInfo: CardInfo;
}

export interface ICardsInfo extends CardInfoConfig {
  position: CARD_POS;
};

type CardsInfoConfigArr = CardInfoConfig[];

const CardsInfoConfig: CardsInfoConfigArr = [
  {
    name: 'Person',
    cardInfo: {
      firstName: 'Eagle',
      lastName: '古 transform: rotate(90deg)',
      age: '90后',
      gender: 'Male',
      hometown: 'Chungking',
      residence: 'Xi\'an China',
      hobbies: ['Programming', 'Play video Games', 'Electrionic product', 'lalala~'],
      career: 'Big Front-end Developer',
    },
  },
  {
    name: 'Skills',
    cardInfo: {
      JavaScript: '吃饭的家伙',
      React: '源码看一部分了',
      'NodeJS/Koa': '熟练使用',
      'CSS/Sass/Less': '经常使用',
      Electron: '偶尔做点儿小工具',
      Git: '熟练使用',
      TypeScript: '经常使用',
      Webpack: '经常使用',
      Redis: '熟练使用',
      SQL: '以前熟练使用',
      Cordova: '以前打包APP老用'
    },
  },
  {
    name: 'Self-Introduction',
    cardInfo: {
      past: '我曾就职于一个国内知名的工控软件公司，做了7年工控人，大大小小的工控项目做了几十个，'
        + '涉及市政、能源、重工、轻工等多个行业。'
        + '做过技术，也做过一段时间管理，发现自己还是喜欢做技术，并一心想去大厂学习。',
      present: '目前就职于一个国内著名的加班超厉害的大厂，入职以来通过参与大型项目和认证考试使自己成长了很多，'
        + '也逐渐看清自己的定位，看清自己想要的是什么。',
      future: '我热爱大前端，专注大前端，热爱技术分享，拥抱新技术。厚积薄发，未来可期。',
    },
  },
  {
    name: 'ThinkDifferent',
    cardInfo: {
      '致疯狂的人': `
     他们特立独行，
     他们桀骜不驯，
     他们惹是生非，
     他们格格不入，'
     他们用与众不同的眼光看待事物，
     他们不喜欢墨守成规，
     他们也不愿安于现状。
     ......
     因为只有那些疯狂到以为自己能够改变世界的人，
     才能真正的改变世界。`
    },
  }
];

CardsInfoConfig.forEach((value, index) => {
  const val = value as ICardsInfo;
  if (index === 0) {
    val.position = CARD_POS.FRONT;
  } else if (index === 1) {
    val.position = CARD_POS.FOLLOWED;
  } else {
    val.position = CARD_POS.WAIT;
  }
});

export const CardsInfo = CardsInfoConfig as ICardsInfo[];
