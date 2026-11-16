import React from "react";

const Title = ({ text1, text2 }) => {
	return (
		<div className="inline-flex items-center gap-3 mb-3">
			<p className="tracking-[0.08em] text-gray-500 dark:text-gray-400">
				{text1}{" "}
				<span className="font-semibold text-gray-800 dark:text-gray-100">{text2}</span>
			</p>
			<span className="w-8 sm:w-12 h-[1.5px] sm:h-[2px] bg-gray-700 dark:bg-gray-300" />
		</div>
	);
};

export default Title;
