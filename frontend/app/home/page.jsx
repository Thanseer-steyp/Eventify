"use client";
import LoopCarousel from "../../components/screens/LoopCarousel";
import Stats from "../../components/screens/Stats";
import Feature from "../../components/screens/Feature";
import FeedbackCarousel from "../../components/screens/FeedbackCarousel";


function Home() {
  return (
    <>
      <LoopCarousel />
      <Stats />
      <Feature />
      <FeedbackCarousel />
    </>
  );
}

export default Home;
