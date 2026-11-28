import { NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Database,
  Sparkles,
  Megaphone,
  ClipboardCheck,
  Share2,
  CalendarDays,
  ChartNoAxesColumn,
  Settings,
  LogOut,
} from "lucide-react";

const navigation = [
  {
    section: "OVERVIEW",
    items: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    section: "CORE WORKFLOW",
    items: [
      {
        name: "Company Data",
        path: "/dashboard/company-data",
        icon: Database,
        badge: "Verified",
        badgeColor: "green",
      },
      {
        name: "AI Content Studio",
        path: "/dashboard/content-studio",
        icon: Sparkles,
        badge: "Gemini",
        badgeColor: "purple",
      },
      {
        name: "Campaigns",
        path: "/dashboard/campaigns",
        icon: Megaphone,
      },
      {
        name: "Content Approval",
        path: "/dashboard/approvals",
        icon: ClipboardCheck,
        badge: "3 Pending",
        badgeColor: "yellow",
      },
    ],
  },
  {
    section: "PUBLISHING & INSIGHTS",
    items: [
      {
        name: "Social Accounts",
        path: "/dashboard/social-accounts",
        icon: Share2,
      },
      {
        name: "Content Calendar",
        path: "/dashboard/calendar",
        icon: CalendarDays,
      },
      {
        name: "Analytics",
        path: "/dashboard/analytics",
        icon: ChartNoAxesColumn,
      },
    ],
  },
  {
    section: "MANAGEMENT",
    items: [
      {
        name: "Settings",
        path: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];

const badgeStyles = {
  green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  purple: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  yellow: "border-amber-500/30 bg-amber-500/10 text-amber-400",
};

export default function Sidebar() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Temporary navigation until backend authentication is integrated.
    navigate("/login");
  };

  return (
    <aside className="flex h-screen w-[270px] shrink-0 flex-col border-r border-[#252B3A] bg-[#0C0F17] text-white">

      {/* Brand */}
      <div className="flex h-[82px] shrink-0 items-center justify-between border-b border-[#252B3A] px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl font-extrabold text-black">
            M
          </div>

          <div>
            <h1 className="text-base font-bold tracking-tight">
              MarketFlow <span className="text-blue-400">AI</span>
            </h1>

            {/* <p className="mt-0.5 text-xs tracking-wide text-[#8290A8]">
              The Next Minds
            </p> */}
          </div>
        </div>

        {/* <span className="rounded-md border border-[#343B4D] px-2 py-1 text-[10px] font-semibold text-[#A8B5CA]">
          Team B
        </span> */}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        {navigation.map((group) => (
          <div key={group.section}>

            <p className="mb-2 px-2 text-[12px] font-semibold tracking-[0.12em] text-[#71809A]">
              {group.section}
            </p>

            <div className="space-y-1">

              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/dashboard"}
                    className={({ isActive }) =>
                      `group flex min-h-[42px] items-center justify-between rounded-lg px-3 py-2.5 transition-all duration-200 ${
                        isActive
                          ? "bg-[#202635] text-white"
                          : "text-[#A2AEC2] hover:bg-[#171D29] hover:text-white"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">

                          <Icon
                            size={17}
                            strokeWidth={1.8}
                            className={
                              isActive
                                ? "text-white"
                                : "text-[#8491A8] group-hover:text-white"
                            }
                          />

                          <span className="text-[14px] font-medium">
                            {item.name}
                          </span>
                        </div>

                        {/* {item.badge && (
                          <span
                            className={`rounded-md border px-2 py-1 text-[10px] font-semibold ${
                              badgeStyles[item.badgeColor]
                            }`}
                          >
                            {item.badge}
                          </span>
                        )} */}
                      </>
                    )}
                  </NavLink>
                );
              })}

            </div>
          </div>
        ))}

      </nav>

      {/* User Profile */}
      <div className="shrink-0 border-t border-[#252B3A] p-4">

        <div className="flex items-center gap-3 rounded-xl border border-[#252B3A] bg-[#111722] p-2.5">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#47536B] bg-white text-xs font-bold text-black">
            RK
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-white">
              Roshani Khan
            </p>

            {/* <p className="mt-0.5 text-[11px] text-[#8491A8]">
              Frontend Lead · Team B
            </p> */}
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard/settings")}
            title="Settings"
            className="text-[#8491A8] transition hover:text-white"
          >
            <Settings size={16} />
          </button>

        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-1 text-xs font-medium text-[#9AA6BA] transition hover:bg-[#171D29] hover:text-white"
        >
          <LogOut size={15} />
          Sign out
        </button>

      </div>
    </aside>
  );
}
