"use client";
import LoopCarousel from "../../components/screens/home/LoopCarousel";
import Stats from "../../components/screens/home/Stats";
import Feature from "../../components/screens/home/Feature";
import FeedbackCarousel from "../../components/screens/home/FeedbackCarousel";


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
