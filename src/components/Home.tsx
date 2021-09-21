import Intro from "./Intro";
import ProfileImage from "./ProfileImage";

export default function Home() {
  return (
    <div className="home">
      <div className="intro">
        <Intro />
        <ProfileImage />
      </div>
    </div>
  );
}