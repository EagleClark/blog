import '../style/layout.scss';

export default function Header() {
  return (
    <div className="header">
      <div className="headerContainer">
        <div className="logo">
          <span><a href="/">Eagle</a></span>
        </div>
        <div className="headNav">
          <div className="navList">
            <span><a href="">主页</a></span>
            <span><a href="">技术文章</a></span>
            <span><a href="">Github</a></span>
            <span><a href="">关于我</a></span>
          </div>
          <div className="sideBar">
            <svg className="svgIcon" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2 15.5v2h20v-2H2zm0-5v2h20v-2H2zm0-5v2h20v-2H2z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}