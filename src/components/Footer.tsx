export default function Footer() {
  return (
    <div className="footer">
      <div className="footContent">
        <span className="copyrightText">京ICP备18043750号</span>
        <div className="socialLinks">
          <span>Follow me</span>
          <a href="https://juejin.cn/user/2875978150314408/posts" target="_blank" rel="noreferrer">
            <img src="./assets/svg/juejin.svg" alt="掘金" />
          </a>
          <a href="https://github.com/EagleClark" target="_blank" rel="noreferrer">
            <img src="./assets/svg/github.svg" alt="Github" />
          </a>
          <a href="https://codesandbox.io/u/EagleClark" target="_blank" rel="noreferrer">
            <img src="./assets/svg/codesandbox.svg" alt="CodeSandbox" />
          </a>
          <a href="mailto:eagleclark@163.com" target="_blank" rel="noreferrer">
            <img src="./assets/svg/email.svg" alt="E-mail" />
          </a>
        </div>
      </div>
    </div>
  );
}