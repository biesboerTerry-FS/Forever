import React, { useState } from "react";
import { NavLink } from "react-router-dom";

// All sidebar icons use currentColor so they stay crisp and high-contrast in
// both light and dark mode without relying on image inversion filters.
const iconProps = {
	xmlns: "http://www.w3.org/2000/svg",
	fill: "none",
	viewBox: "0 0 24 24",
	strokeWidth: 1.7,
	stroke: "currentColor",
	className: "h-5 w-5 shrink-0",
	"aria-hidden": true,
};

const Icon = ({ children }) => <svg {...iconProps}>{children}</svg>;

const DashboardIcon = () => (
	<Icon>
		<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
	</Icon>
);
const AddIcon = () => (
	<Icon>
		<path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
	</Icon>
);
const ListIcon = () => (
	<Icon>
		<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008H3.75V6.75zm0 5.25h.007v.008H3.75V12zm0 5.25h.007v.008H3.75v-.008z" />
	</Icon>
);
const OrdersIcon = () => (
	<Icon>
		<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-3.026a2.25 2.25 0 00-.659-1.591l-3.099-3.099A2.25 2.25 0 0015.526 9H14.25V5.625c0-.621-.504-1.125-1.125-1.125h-9A1.125 1.125 0 003 5.625v7.5M14.25 9h1.276a.75.75 0 01.53.22l2.724 2.724a.75.75 0 01.22.53v1.776" />
	</Icon>
);
const AnnouncementIcon = () => (
	<Icon>
		<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
		<path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
	</Icon>
);
const MessageIcon = () => (
	<Icon>
		<path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
	</Icon>
);
const UsersIcon = () => (
	<Icon>
		<path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
	</Icon>
);
const UserPlusIcon = () => (
	<Icon>
		<path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-9.75 3.75a4.5 4.5 0 019 0m-9 0v.75c0 1.24 1.006 2.25 2.25 2.25h4.5c1.244 0 2.25-1.01 2.25-2.25v-.75m-4.5-12a2.625 2.625 0 110 5.25 2.625 2.625 0 010-5.25z" />
	</Icon>
);
const BuildingIcon = () => (
	<Icon>
		<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
	</Icon>
);
const MoneyIcon = () => (
	<Icon>
		<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
	</Icon>
);
const CalendarIcon = () => (
	<Icon>
		<path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6.75h.008v.008H12V10.5zm0 3.75h.008v.008H12V14.25zm0 3.75h.008v.008H12V18zm3.75-7.5h.008v.008h-.008V10.5zm0 3.75h.008v.008h-.008V14.25z" />
	</Icon>
);
const NoteIcon = () => (
	<Icon>
		<path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
	</Icon>
);
const ManagerIcon = () => (
	<Icon>
		<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632zM18 8.25v3m0 0v3m0-3h3m-3 0h-3" />
	</Icon>
);
const ScheduleIcon = () => (
	<Icon>
		<path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-3.75h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
	</Icon>
);
const LearningIcon = () => (
	<Icon>
		<path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
	</Icon>
);
const ReportIcon = () => (
	<Icon>
		<path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
	</Icon>
);

const linkClass = ({ isActive }) =>
	`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] transition-colors ${
		isActive
			? "bg-pink-50 font-medium text-gray-900 dark:bg-pink-500/15 dark:text-pink-100"
			: "text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
	}`;

const LinkRow = ({ to, label, children, testId, end }) => (
	<NavLink className={linkClass} to={to} end={end} data-testid={testId}>
		{children}
		<p className="hidden md:block">{label}</p>
	</NavLink>
);

// Categories start collapsed on every load. The chevron rotates to reveal the
// section; no heavy borders or separators between groups.
const SidebarGroup = ({ id, label, children }) => {
	const [open, setOpen] = useState(false);
	return (
		<div className="mt-2" data-testid={`sidebar-group-${id}`}>
			<button
				type="button"
				data-testid={`sidebar-toggle-${id}`}
				aria-expanded={open}
				aria-controls={`sidebar-group-items-${id}`}
				onClick={() => setOpen((value) => !value)}
				className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
			>
				<span className="hidden md:block">{label}</span>
				<span className="md:hidden">•••</span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth="2"
					stroke="currentColor"
					className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
					aria-hidden="true"
				>
					<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
				</svg>
			</button>
			{open && (
				<div id={`sidebar-group-items-${id}`} className="mt-0.5 flex flex-col gap-0.5">
					{children}
				</div>
			)}
		</div>
	);
};

const Sidebar = () => {
	return (
		<aside
			data-testid="admin-sidebar"
			className="sticky top-0 h-[calc(100vh-4rem)] w-[18%] min-w-[64px] shrink-0 overflow-y-auto overscroll-contain px-3 pb-8 pt-4 md:min-w-[212px] md:px-4"
		>
			<div className="flex flex-col gap-0.5">
				<LinkRow to="/" label="Dashboard" end>
					<DashboardIcon />
				</LinkRow>
				<LinkRow to="/add" label="Add Items">
					<AddIcon />
				</LinkRow>
				<LinkRow to="/list" label="List Items">
					<ListIcon />
				</LinkRow>
				<LinkRow to="/orders" label="Orders">
					<OrdersIcon />
				</LinkRow>

				<SidebarGroup id="communication" label="Communication">
					<LinkRow to="/announcements" label="Announcements">
						<AnnouncementIcon />
					</LinkRow>
					<LinkRow to="/messages" label="Messages">
						<MessageIcon />
					</LinkRow>
				</SidebarGroup>

				<SidebarGroup id="hr" label="Human Resources">
					<div data-testid="hr-nav" className="flex flex-col gap-0.5">
						<LinkRow to="/hr/directory" label="HR Directory">
							<UsersIcon />
						</LinkRow>
						<LinkRow to="/hr/employees" label="Manage Employees">
							<UserPlusIcon />
						</LinkRow>
						<LinkRow to="/hr/organization" label="Roles &amp; Departments">
							<BuildingIcon />
						</LinkRow>
						<LinkRow to="/hr/payroll" label="Payroll">
							<MoneyIcon />
						</LinkRow>
						<LinkRow to="/hr/timeoff" label="Time-off approvals">
							<CalendarIcon />
						</LinkRow>
						<LinkRow to="/hr/performance" label="Performance notes">
							<NoteIcon />
						</LinkRow>
					</div>
				</SidebarGroup>

				<SidebarGroup id="management" label="Management">
					<LinkRow to="/employees" label="Employees">
						<UsersIcon />
					</LinkRow>
					<LinkRow to="/managers" label="Managers">
						<ManagerIcon />
					</LinkRow>
					<LinkRow to="/schedule" label="Schedule">
						<ScheduleIcon />
					</LinkRow>
					<LinkRow to="/learning" label="Learning (Demo)">
						<LearningIcon />
					</LinkRow>
					<LinkRow to="/payroll" label="Payroll">
						<MoneyIcon />
					</LinkRow>
					<LinkRow to="/reports" label="Reports">
						<ReportIcon />
					</LinkRow>
				</SidebarGroup>
			</div>
		</aside>
	);
};

export default Sidebar;
