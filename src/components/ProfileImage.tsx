import '../style/ProfileImage.scss';

export default function ProfileImage() {

  return (
    <div className="profileImage">
      <img className="introImage" src="./assets/eagle.jpg" alt="profile" />
      <div className="innerCircle">
        <img className="planetCircle" src="./assets/png/js.png" alt="" />
        <img className="planetCircle" src="./assets/png/sql.png" alt="" />
      </div>
      <div className="outerCircle">
        <img className="planetCircle" src="./assets/png/rust.png" alt="" />
        <img className="planetCircle" src="./assets/png/angular.png" alt="" />
        <img className="planetCircle" src="./assets/png/react.png" alt="" />
        <img className="planetCircle" src="./assets/png/nodejs.png" alt="" />
        <img className="planetCircle" src="./assets/png/typescript.png" alt="" />
        <img className="planetCircle" src="./assets/png/electron.png" alt="" />
      </div>
    </div>
  );
}