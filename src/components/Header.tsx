import { useCallback, useEffect, useState } from 'react';
import '../style/layout.scss';

export default function Header() {
  const [isShowSideMenu, setIsShowSideMenu] = useState(false);

  const eventFunc = useCallback((event: Event) => {
    event.stopPropagation();
    if (isShowSideMenu) {
      setIsShowSideMenu(false);
    }
  }, [isShowSideMenu]);

  useEffect(() => {
    document.addEventListener('click', eventFunc);

    return () => {
      document.removeEventListener('click', eventFunc);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowSideMenu]);

  const switchSideMenu = () => {
    setIsShowSideMenu(!isShowSideMenu);
  };

  const listData = [
    { href: '/', text: '主页' },
    { href: '/', text: '技术文章' },
    { href: '/', text: 'Github' },
    { href: '/', text: '关于我' },
  ];

  return (
    <div className="header">
      <div className="headerContainer">
        <div className="logo">
          <span><a href="/">Eagle</a></span>
        </div>
        <div className="headNav">
          <div className="navList">
            {
              listData.map(val => {
                const { href, text } = val;
                return <span key={text}><a href={href}>{text}</a></span>;
              })
            }
          </div>
          <div className="sideBar" onClick={switchSideMenu}>
            <svg className="svgIcon" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2 15.5v2h20v-2H2zm0-5v2h20v-2H2zm0-5v2h20v-2H2z"></path>
            </svg>
          </div>
          <div className={isShowSideMenu ? "sideMenuShow" : "sideMenuHide"}>
            <ul>
              {
                listData.map(val => {
                  const { href, text } = val;
                  return <li key={text}><a href={href}>{text}</a></li>;
                })
              }
            </ul>
          </div>      
        </div>
      </div>
    </div>
  );
}