import IntroCard from "./IntroCards";
import ProfileImage from "./ProfileImage";

export default function Home() {
  return (
    <div className="home">
      <div className="intro">
        <IntroCard />
        <ProfileImage />
      </div>
    </div>
  );
}