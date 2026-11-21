import React, { useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { toast } from "react-toastify";
import Title from "../components/Title";
import { ShopContext } from "../context/ShopContext";
import {
	loadAddresses,
	loadDemoCards,
	loadProfile,
	saveAddresses,
	saveDemoCards,
	saveProfile,
} from "../utils/profileStore";
import {
	createAddress,
	createDemoCard,
	fetchAddresses,
	fetchDemoCards,
	fetchProfile,
	makeDefaultAddress,
	pushProfile,
	removeAddress,
	removeDemoCard,
	updateAddress,
} from "../utils/profileApi";

const inputClass =
	"w-full px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500";
const labelClass =
	"block mb-1 text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400";
const primaryButton =
	"px-5 py-2.5 text-sm font-semibold text-white dark:text-gray-900 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors";
const secondaryButton =
	"px-5 py-2.5 text-sm font-medium border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors";

const emptyAddress = () => ({
	label: "",
	firstName: "",
	lastName: "",
	email: "",
	street: "",
	city: "",
	state: "",
	zipcode: "",
	country: "",
	phone: "",
	isDefault: false,
});

const emptyCard = () => ({ brand: "Visa", label: "", last4: "", expiry: "" });

const newId = (prefix) =>
	typeof crypto !== "undefined" && crypto.randomUUID
		? crypto.randomUUID()
		: `${prefix}-${Date.now()}`;

const Field = ({
	id,
	label,
	value,
	onChange,
	type = "text",
	name,
	wrapperClassName = "",
	...rest
}) => (
	<div className={wrapperClassName}>
		<label htmlFor={id} className={labelClass}>
			{label}
		</label>
		<input
			id={id}
			name={name || id}
			type={type}
			value={value ?? ""}
			onChange={onChange}
			className={inputClass}
			{...rest}
		/>
	</div>
);

const Profile = () => {
	const { user, setUser, token, backendUrl, navigate } = useContext(ShopContext);
	const { isSignedIn } = useAuth();
	const ctx = { backendUrl, token };

	const seedFromUser = () => ({
		name: user?.name || "",
		email: user?.email || "",
		phone: user?.phone || "",
	});

	const [profile, setProfile] = useState(() => loadProfile() || seedFromUser());
	const [profileDraft, setProfileDraft] = useState(profile);
	const [editingProfile, setEditingProfile] = useState(false);

	const [addresses, setAddresses] = useState(loadAddresses);
	const [addressDraft, setAddressDraft] = useState(emptyAddress);
	const [editingAddressId, setEditingAddressId] = useState(null);
	const [showAddressForm, setShowAddressForm] = useState(false);

	const [cards, setCards] = useState(loadDemoCards);
	const [cardDraft, setCardDraft] = useState(emptyCard);
	const [showCardForm, setShowCardForm] = useState(false);

	// First-time visitors get their account details pre-filled, but an edited
	// local profile is never overwritten by a later Clerk sync.
	useEffect(() => {
		if (loadProfile() || !user || (!user.name && !user.email)) return;
		const seeded = seedFromUser();
		setProfile(seeded);
		saveProfile(seeded);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.id, user?.name, user?.email]);

	useEffect(() => saveAddresses(addresses), [addresses]);
	useEffect(() => saveDemoCards(cards), [cards]);

	// Signed-in shoppers read from the backend; localStorage covers demo /
	// signed-out sessions and any transient API failure.
	useEffect(() => {
		let active = true;
		const loadRemote = async () => {
			if (!token || !backendUrl) return;
			const context = { backendUrl, token };
			const [remoteProfile, remoteAddresses, remoteCards] = await Promise.all([
				fetchProfile(context),
				fetchAddresses(context),
				fetchDemoCards(context),
			]);
			if (!active) return;
			setProfile(remoteProfile);
			setProfileDraft(remoteProfile);
			setAddresses(remoteAddresses);
			setCards(remoteCards);
		};
		loadRemote();
		return () => {
			active = false;
		};
	}, [token, backendUrl]);

	const reportSync = (synced, message) => {
		if (synced) return toast.success(message);
		if (token) return toast.info(`${message} Saved on this device only.`);
		return toast.success(message);
	};

	const saveProfileChanges = async (event) => {
		event.preventDefault();
		const name = String(profileDraft.name || "").trim();
		const email = String(profileDraft.email || "").trim().toLowerCase();
		const phone = String(profileDraft.phone || "").trim();

		if (!name) return toast.error("Please enter your name.");
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return toast.error("Please enter a valid email address.");
		}

		const next = { name, email, phone };
		setProfile(next);
		saveProfile(next);
		setUser((previous) => ({ ...(previous || {}), ...next }));
		try {
			localStorage.setItem("user", JSON.stringify({ ...(user || {}), ...next }));
		} catch {
			// Local storage may be unavailable; in-memory state is still updated.
		}
		setEditingProfile(false);
		const result = await pushProfile(ctx, next);
		if (result.synced && result.profile) setProfile(result.profile);
		reportSync(result.synced, "Profile saved.");
	};

	const openAddressForm = (address = null) => {
		setEditingAddressId(address?.id || null);
		setAddressDraft(address ? { ...address } : emptyAddress());
		setShowAddressForm(true);
	};

	const closeAddressForm = () => {
		setEditingAddressId(null);
		setAddressDraft(emptyAddress());
		setShowAddressForm(false);
	};

	const addressChange = (event) => {
		const { name, value } = event.target;
		setAddressDraft((current) => ({ ...current, [name]: value }));
	};

	const submitAddress = async (event) => {
		event.preventDefault();
		const required = ["firstName", "lastName", "street", "city", "zipcode", "country"];
		if (required.some((field) => !String(addressDraft[field] || "").trim())) {
			return toast.error("Please complete the required address fields.");
		}
		const normalized = Object.fromEntries(
			Object.entries(addressDraft).map(([key, value]) => [
				key,
				typeof value === "string" ? value.trim() : value,
			])
		);

		const isEdit = Boolean(editingAddressId);
		const next = isEdit
			? addresses.map((address) =>
					address.id === editingAddressId
						? { ...normalized, id: editingAddressId, isDefault: address.isDefault }
						: address
			  )
			: [
					...addresses,
					{ ...normalized, id: newId("address"), isDefault: addresses.length === 0 },
			  ];
		setAddresses(next);
		closeAddressForm();

		const result = isEdit
			? await updateAddress(ctx, editingAddressId, normalized)
			: await createAddress(ctx, normalized);
		if (result.synced) setAddresses(result.addresses);
		reportSync(result.synced, isEdit ? "Address updated." : "Address added.");
	};

	const setDefaultAddress = async (id) => {
		const next = addresses.map((address) => ({
			...address,
			isDefault: address.id === id,
		}));
		setAddresses(next);
		const result = await makeDefaultAddress(ctx, id);
		if (result.synced) setAddresses(result.addresses);
		reportSync(result.synced, "Default shipping address updated.");
	};

	const deleteAddress = async (id) => {
		const remaining = addresses.filter((address) => address.id !== id);
		if (remaining.length && !remaining.some((address) => address.isDefault)) {
			remaining[0] = { ...remaining[0], isDefault: true };
		}
		setAddresses(remaining);
		if (editingAddressId === id) closeAddressForm();
		const result = await removeAddress(ctx, id);
		if (result.synced) setAddresses(result.addresses);
		reportSync(result.synced, "Address removed.");
	};

	const submitDemoCard = async (event) => {
		event.preventDefault();
		const last4 = String(cardDraft.last4 || "").replace(/\D/g, "");
		if (!/^\d{4}$/.test(last4)) {
			return toast.error("Enter only the last 4 digits of the demo card.");
		}
		const card = {
			id: newId("demo-card"),
			brand: cardDraft.brand,
			label: String(cardDraft.label || "").trim() || `${cardDraft.brand} demo card`,
			last4,
			expiry: String(cardDraft.expiry || "").trim(),
		};
		setCards((current) => [...current, card]);
		setCardDraft(emptyCard());
		setShowCardForm(false);

		const result = await createDemoCard(ctx, card);
		if (result.synced) setCards(result.cards);
		reportSync(result.synced, "Demo card added.");
	};

	const deleteDemoCard = async (card) => {
		setCards((current) => current.filter((item) => item.id !== card.id));
		const result = await removeDemoCard(ctx, card.id);
		if (result.synced) setCards(result.cards);
		reportSync(result.synced, "Demo card removed.");
	};

	const cardShortName = { Visa: "VISA", Mastercard: "MC", Amex: "AMEX", Discover: "DISC" };

	return (
		<div className="pt-10 border-t">
			<div className="text-2xl">
				<Title text1={"MY"} text2={"PROFILE"} />
			</div>

			{!token && !isSignedIn && (
				<div className="flex flex-col gap-3 mt-6 px-4 py-3 text-sm border border-gray-200 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-gray-600 dark:text-gray-400">
						You&apos;re editing a local demo profile. Sign in to pre-fill it from your account.
					</p>
					<button
						type="button"
						onClick={() => navigate("/login?redirect=/profile")}
						className="self-start text-sm font-semibold underline underline-offset-4"
					>
						SIGN IN
					</button>
				</div>
			)}

			<div className="grid gap-6 mt-8 lg:grid-cols-2">
				{/* ------------- Personal information ---------------- */}
				<section
					aria-labelledby="personal-info-heading"
					className="p-5 border border-gray-200 dark:border-gray-800 sm:p-6"
				>
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div>
							<h2 id="personal-info-heading" className="text-lg font-semibold">
								Personal information
							</h2>
							<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
								Your contact details for orders and delivery updates.
							</p>
						</div>
						{!editingProfile && (
							<button
								type="button"
								onClick={() => {
									setProfileDraft(profile);
									setEditingProfile(true);
								}}
								className={secondaryButton}
							>
								Edit
							</button>
						)}
					</div>

					{editingProfile ? (
						<form onSubmit={saveProfileChanges} className="grid gap-4 mt-6 sm:grid-cols-2">
							<Field
								id="profile-name"
								label="Full name"
								value={profileDraft.name}
								onChange={(event) =>
									setProfileDraft((current) => ({
										...current,
										name: event.target.value,
									}))
								}
								required
								autoComplete="name"
							/>
							<Field
								id="profile-email"
								label="Email"
								type="email"
								value={profileDraft.email}
								onChange={(event) =>
									setProfileDraft((current) => ({
										...current,
										email: event.target.value,
									}))
								}
								required
								autoComplete="email"
							/>
							<Field
								id="profile-phone"
								label="Phone"
								type="tel"
								value={profileDraft.phone}
								onChange={(event) =>
									setProfileDraft((current) => ({
										...current,
										phone: event.target.value,
									}))
								}
								autoComplete="tel"
							/>
							<div className="flex flex-wrap gap-3 sm:col-span-2">
								<button type="submit" className={primaryButton}>
									Save changes
								</button>
								<button
									type="button"
									onClick={() => setEditingProfile(false)}
									className={secondaryButton}
								>
									Cancel
								</button>
							</div>
						</form>
					) : (
						<dl className="grid gap-5 mt-6 sm:grid-cols-3">
							{[
								["Full name", profile.name],
								["Email", profile.email],
								["Phone", profile.phone || "Not set"],
							].map(([label, value]) => (
								<div key={label}>
									<dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
										{label}
									</dt>
									<dd className="mt-1 text-sm break-words text-gray-800 dark:text-gray-100">
										{value || "Not set"}
									</dd>
								</div>
							))}
						</dl>
					)}
				</section>

				{/* ------------- Demo payment methods ---------------- */}
				<section
					aria-labelledby="payment-methods-heading"
					className="p-5 border border-gray-200 dark:border-gray-800 sm:p-6"
				>
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div>
							<h2 id="payment-methods-heading" className="text-lg font-semibold">
								Demo payment methods
							</h2>
							<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
								Placeholder cards for the storefront demo only.
							</p>
						</div>
						<span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wide bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200">
							Test mode
						</span>
					</div>

					<p
						role="note"
						className="mt-4 px-3 py-2 text-sm border border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200"
					>
						Test mode — no real payments. Only masked demo labels are saved in this browser.
						Never enter real card details here.
					</p>

					<div className="mt-5 divide-y divide-gray-200 dark:divide-gray-800">
						{cards.length === 0 ? (
							<p className="py-4 text-sm text-gray-500 dark:text-gray-400">
								No demo cards saved.
							</p>
						) : (
							cards.map((card) => (
								<div
									key={card.id}
									className="flex items-center justify-between gap-4 py-3"
								>
									<div className="flex items-center gap-3">
										<span
											aria-hidden="true"
											className="inline-flex w-12 h-8 items-center justify-center text-xs font-bold tracking-wide text-white bg-gray-900 dark:bg-gray-200 dark:text-gray-900"
										>
											{cardShortName[card.brand] || "CARD"}
										</span>
										<div>
											<p className="text-sm font-medium">{card.label}</p>
											<p className="text-sm text-gray-500 dark:text-gray-400">
												•••• {card.last4}
												{card.expiry ? ` · Exp ${card.expiry}` : ""}
											</p>
										</div>
									</div>
									<button
										type="button"
										onClick={() => deleteDemoCard(card)}
										aria-label={`Remove ${card.label} ending in ${card.last4}`}
										className="text-sm text-gray-600 underline underline-offset-4 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
									>
										Remove
									</button>
								</div>
							))
						)}
					</div>

					{showCardForm ? (
						<form onSubmit={submitDemoCard} className="grid gap-4 mt-5 sm:grid-cols-2">
							<div>
								<label htmlFor="demo-card-brand" className={labelClass}>
									Card type
								</label>
								<select
									id="demo-card-brand"
									name="brand"
									value={cardDraft.brand}
									onChange={(event) =>
										setCardDraft((current) => ({
											...current,
											brand: event.target.value,
										}))
									}
									className={inputClass}
								>
									{["Visa", "Mastercard", "Amex", "Discover"].map((brand) => (
										<option key={brand} value={brand}>
											{brand}
										</option>
									))}
								</select>
							</div>
							<Field
								id="demo-card-label"
								label="Label (optional)"
								placeholder="e.g. Test card"
								value={cardDraft.label}
								onChange={(event) =>
									setCardDraft((current) => ({
										...current,
										label: event.target.value,
									}))
								}
							/>
							<Field
								id="demo-card-last4"
								label="Last 4 digits only"
								inputMode="numeric"
								autoComplete="off"
								placeholder="4242"
								maxLength={4}
								pattern="[0-9]{4}"
								value={cardDraft.last4}
								onChange={(event) =>
									setCardDraft((current) => ({
										...current,
										last4: event.target.value.replace(/\D/g, "").slice(0, 4),
									}))
								}
								required
							/>
							<Field
								id="demo-card-expiry"
								label="Expiry (optional)"
								placeholder="MM/YY"
								autoComplete="off"
								value={cardDraft.expiry}
								onChange={(event) =>
									setCardDraft((current) => ({
										...current,
										expiry: event.target.value,
									}))
								}
							/>
							<div className="flex flex-wrap gap-3 sm:col-span-2">
								<button type="submit" className={primaryButton}>
									Add demo card
								</button>
								<button
									type="button"
									onClick={() => {
										setCardDraft(emptyCard());
										setShowCardForm(false);
									}}
									className={secondaryButton}
								>
									Cancel
								</button>
							</div>
						</form>
					) : (
						<button
							type="button"
							onClick={() => setShowCardForm(true)}
							className={`mt-5 ${secondaryButton}`}
						>
							+ Add demo card
						</button>
					)}
				</section>

				{/* ------------- Addresses ---------------- */}
				<section
					aria-labelledby="addresses-heading"
					className="p-5 border border-gray-200 dark:border-gray-800 sm:p-6 lg:col-span-2"
				>
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div>
							<h2 id="addresses-heading" className="text-lg font-semibold">
								Saved addresses
							</h2>
							<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
								Your default address is used first at checkout.
							</p>
						</div>
						<button
							type="button"
							onClick={() => (showAddressForm ? closeAddressForm() : openAddressForm())}
							className={secondaryButton}
						>
							{showAddressForm ? "Cancel" : "+ Add address"}
						</button>
					</div>

					{showAddressForm && (
						<form
							onSubmit={submitAddress}
							className="grid gap-4 mt-6 p-4 border border-gray-200 dark:border-gray-800 sm:grid-cols-2"
						>
							<Field
								id="address-label"
								name="label"
								label="Label"
								placeholder="Home, Work…"
								value={addressDraft.label}
								onChange={addressChange}
							/>
							<Field
								id="address-phone"
								name="phone"
								label="Phone"
								type="tel"
								value={addressDraft.phone}
								onChange={addressChange}
							/>
							<Field
								id="address-first-name"
								name="firstName"
								label="First name"
								value={addressDraft.firstName}
								onChange={addressChange}
								required
							/>
							<Field
								id="address-last-name"
								name="lastName"
								label="Last name"
								value={addressDraft.lastName}
								onChange={addressChange}
								required
							/>
							<Field
								id="address-email"
								name="email"
								label="Email"
								type="email"
								wrapperClassName="sm:col-span-2"
								value={addressDraft.email}
								onChange={addressChange}
							/>
							<Field
								id="address-street"
								name="street"
								label="Street"
								wrapperClassName="sm:col-span-2"
								value={addressDraft.street}
								onChange={addressChange}
								required
							/>
							<Field
								id="address-city"
								name="city"
								label="City"
								value={addressDraft.city}
								onChange={addressChange}
								required
							/>
							<Field
								id="address-state"
								name="state"
								label="State"
								value={addressDraft.state}
								onChange={addressChange}
							/>
							<Field
								id="address-zipcode"
								name="zipcode"
								label="Zip / postal code"
								value={addressDraft.zipcode}
								onChange={addressChange}
								required
							/>
							<Field
								id="address-country"
								name="country"
								label="Country"
								value={addressDraft.country}
								onChange={addressChange}
								required
							/>
							<div className="flex flex-wrap gap-3 sm:col-span-2">
								<button type="submit" className={primaryButton}>
									{editingAddressId ? "Save address" : "Add address"}
								</button>
								<button type="button" onClick={closeAddressForm} className={secondaryButton}>
									Cancel
								</button>
							</div>
						</form>
					)}

					<div className="grid gap-4 mt-6 md:grid-cols-2">
						{addresses.length === 0 ? (
							<p className="text-sm text-gray-500 dark:text-gray-400 md:col-span-2">
								No saved addresses yet. Add one to speed up checkout.
							</p>
						) : (
							addresses.map((address) => (
								<article
									key={address.id}
									className={`p-4 border ${
										address.isDefault
											? "border-gray-900 dark:border-gray-300"
											: "border-gray-200 dark:border-gray-800"
									}`}
								>
									<div className="flex items-center justify-between gap-3">
										<p className="font-medium">
											{address.label || `${address.firstName} ${address.lastName}`}
										</p>
										{address.isDefault && (
											<span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wide bg-gray-900 text-white dark:bg-gray-200 dark:text-gray-900">
												Default
											</span>
										)}
									</div>
									<p className="mt-2 text-sm text-gray-800 dark:text-gray-100">
										{address.firstName} {address.lastName}
									</p>
									<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
										{[address.street, address.city, address.state, address.zipcode, address.country]
											.filter(Boolean)
											.join(", ")}
									</p>
									<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
										{[address.email, address.phone].filter(Boolean).join(" · ")}
									</p>
									<div className="flex flex-wrap gap-4 mt-4 text-sm">
										{!address.isDefault && (
											<button
												type="button"
												onClick={() => setDefaultAddress(address.id)}
												className="underline underline-offset-4 hover:text-gray-900 dark:hover:text-white"
											>
												Set as default
											</button>
										)}
										<button
											type="button"
											onClick={() => openAddressForm(address)}
											className="underline underline-offset-4 hover:text-gray-900 dark:hover:text-white"
										>
											Edit
										</button>
										<button
											type="button"
											onClick={() => deleteAddress(address.id)}
											className="underline underline-offset-4 hover:text-gray-900 dark:hover:text-white"
										>
											Delete
										</button>
									</div>
								</article>
							))
						)}
					</div>
				</section>
			</div>
		</div>
	);
};

export default Profile;
