import React from "react";
import Hero from "../components/Hero";
import PromoBanner from "../components/PromoBanner";
import LatestCollection from "../components/LatestCollection";
import BestSeller from "../components/BestSeller";
import RecentlyViewed from "../components/RecentlyViewed";
import OurPolicy from "../components/OurPolicy";
import NewsletterBox from "../components/NewsletterBox";

const Home = () => {
	return (
		<div className="space-y-10 sm:space-y-14">
			<Hero />
			<PromoBanner />
			<LatestCollection />
			<BestSeller />
			<RecentlyViewed />
			<OurPolicy />
			<NewsletterBox />
		</div>
	);
};

export default Home;
