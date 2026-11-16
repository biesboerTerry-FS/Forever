import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsletterBox from "../components/NewsletterBox";

const Contact = () => {
	const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

	useEffect(() => {
		document.title = "Contact Us | Forever";
	}, []);

	const onChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const onSubmit = (e) => {
		e.preventDefault();
		const subject = encodeURIComponent(form.subject || "Forever support request");
		const body = encodeURIComponent(
			`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
		);
		window.location.href = `mailto:contact@forever.com?subject=${subject}&body=${body}`;
		toast.success("Opening your email app to send the message.");
		setForm({ name: "", email: "", subject: "", message: "" });
	};

	return (
		<div>
			<div className="pt-10 text-2xl text-center border-t">
				<Title text1={"CONTACT"} text2={"US"} />
			</div>

			<div className="flex flex-col justify-center gap-10 my-10 md:flex-row mb-16">
				<img
					className="w-full md:max-w-[480px] object-cover"
					src={assets.contact_img}
					alt="Forever store interior"
				/>
				<div className="flex flex-col items-start justify-center gap-6">
					<div>
						<p className="text-xl font-semibold text-gray-700 dark:text-gray-200">Customer Support</p>
						<p className="mt-2 text-gray-500 dark:text-gray-400">
							Have a question about an order, product, or your account? We’re here to help.
						</p>
					</div>
					<div className="text-gray-600 dark:text-gray-300">
						<p className="font-medium text-gray-800 dark:text-gray-100">Store Address</p>
						<p>54709 Williams Station<br />Suite 350, Washington, USA</p>
					</div>
					<div className="text-gray-600 dark:text-gray-300">
						<p className="font-medium text-gray-800 dark:text-gray-100">Contact</p>
						<p>
							Phone: <a href="tel:+13147231421" className="underline">+1 314 723 1421</a><br />
							Email: <a href="mailto:contact@forever.com" className="underline">contact@forever.com</a><br />
							Returns: <a href="mailto:returns@forever.com" className="underline">returns@forever.com</a>
						</p>
					</div>
					<div className="text-gray-600 dark:text-gray-300">
						<p className="font-medium text-gray-800 dark:text-gray-100">Hours</p>
						<p>Mon–Fri, 9:00 AM – 6:00 PM (local time)</p>
						<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">We typically respond within 1 business day.</p>
					</div>
					<div>
						<p className="font-semibold text-gray-700 dark:text-gray-200">Careers at Forever</p>
						<p className="text-gray-500 dark:text-gray-400 mt-1 mb-3">
							Interested in joining our team? Reach out and tell us what you’d love to work on.
						</p>
						<a
							href="mailto:careers@forever.com?subject=Careers%20at%20Forever"
							className="inline-block px-8 py-3 text-sm transition-all duration-300 border border-black dark:border-gray-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-gray-900"
						>
							Explore Jobs
						</a>
					</div>
				</div>
			</div>

			<div className="grid gap-8 mb-20 lg:grid-cols-[1.2fr_1fr]">
				<form onSubmit={onSubmit} className="p-6 border sm:p-8">
					<h2 className="text-xl font-medium text-gray-800 dark:text-gray-100">Send us a message</h2>
					<p className="mt-2 mb-6 text-sm text-gray-600 dark:text-gray-300">
						Fill out the form and we’ll open your email client with your message ready to send.
					</p>
					<div className="grid gap-4 sm:grid-cols-2">
						<input name="name" value={form.name} onChange={onChange} placeholder="Full name" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700" />
						<input name="email" type="email" value={form.email} onChange={onChange} placeholder="Email address" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700" />
					</div>
					<input name="subject" value={form.subject} onChange={onChange} placeholder="Subject" className="w-full px-3 py-2 mt-4 border border-gray-300 dark:border-gray-700" />
					<textarea name="message" value={form.message} onChange={onChange} placeholder="How can we help?" rows={6} required className="w-full px-3 py-2 mt-4 border border-gray-300 dark:border-gray-700" />
					<button type="submit" className="px-8 py-3 mt-5 text-sm text-white bg-black dark:bg-white dark:text-gray-900">Send Message</button>
				</form>

				<div className="space-y-4">
					<div className="p-6 border">
						<h3 className="font-medium text-gray-800 dark:text-gray-100">Order support</h3>
						<p className="mt-2 text-sm text-gray-600 dark:text-gray-300">For order status, delivery updates, or changes, include your order number so we can assist faster.</p>
					</div>
					<div className="p-6 border">
						<h3 className="font-medium text-gray-800 dark:text-gray-100">Returns & exchanges</h3>
						<p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Need help with a return? Visit our Returns & Exchanges page or email <a href="mailto:returns@forever.com" className="underline">returns@forever.com</a>.</p>
					</div>
					<div className="p-6 border">
						<h3 className="font-medium text-gray-800 dark:text-gray-100">Business inquiries</h3>
						<p className="mt-2 text-sm text-gray-600 dark:text-gray-300">For partnerships or wholesale inquiries, contact <a href="mailto:contact@forever.com" className="underline">contact@forever.com</a> with details.</p>
					</div>
				</div>
			</div>

			<NewsletterBox />
		</div>
	);
};

export default Contact;
