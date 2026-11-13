import React from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsletterBox from "../components/NewsletterBox";

const Contact = () => {
	return (
		<div>
			<div className="pt-10 text-2xl text-center border-t">
				<Title text1={"CONTACT"} text2={"US"} />
			</div>

			<div className="flex flex-col justify-center gap-10 my-10 md:flex-row mb-28">
				<img
					className="w-full md:max-w-[480px]"
					src={assets.contact_img}
					alt="Forever store interior"
				/>
				<div className="flex flex-col items-start justify-center gap-6">
					<p className="text-xl font-semibold text-gray-600 dark:text-gray-300">Our Store</p>
					<p className="text-gray-500 dark:text-gray-400">
						54709 Williams Station <br /> Suite 350, Washington, USA
					</p>
					<p className="text-gray-500 dark:text-gray-400">
						Tel:{" "}
						<a href="tel:+14155550132" className="underline">
							(415) 555-0132
						</a>{" "}
						<br /> Email:{" "}
						<a href="mailto:contact@forever.com" className="underline">
							contact@forever.com
						</a>
					</p>
					<p className="font-semibold text-gray-600 dark:text-gray-300">Careers at Forever</p>
					<p className="text-gray-500 dark:text-gray-400">
						Learn more about our teams and job openings.
					</p>
					<a
						href="mailto:careers@forever.com?subject=Careers%20at%20Forever"
						className="px-8 py-4 text-sm transition-all duration-500 border border-black dark:border-gray-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-gray-900"
					>
						Explore Jobs
					</a>
				</div>
			</div>
			<NewsletterBox />
		</div>
	);
};

export default Contact;
