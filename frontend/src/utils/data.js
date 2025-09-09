import {
  LuLayoutDashboard,
  LuHandCoins,
  LuWalletMinimal,
  LuTarget,
  LuCreditCard,
  LuBell,
  LuChartBar,
  LuList,
  LuUser,
  LuShield,
  LuLogOut,
} from "react-icons/lu";

export const SIDE_MENU_DATA = [
  {
    id: "01",
    label: "Dashboard",
    icon: LuLayoutDashboard,
    path: "/dashboard",
  },
  {
    id: "02",
    label: "Income",
    icon: LuWalletMinimal,
    path: "/income",
  },
  {
    id: "03",
    label: "Expense",
    icon: LuHandCoins,
    path: "/expense",
  },
  {
    id: "04",
    label: "Transactions",
    icon: LuList,
    path: "/dashboard/transactions",
  },
  {
    id: "05",
    label: "Budgets",
    icon: LuCreditCard,
    path: "/dashboard/budgets",
  },
  {
    id: "06",
    label: "Goals",
    icon: LuTarget,
    path: "/dashboard/goals",
  },
  {
    id: "07",
    label: "Reminders",
    icon: LuBell,
    path: "/dashboard/reminders",
  },
  {
    id: "08",
    label: "Categories",
    icon: LuChartBar,
    path: "/dashboard/categories",
  },
  {
    id: "09",
    label: "Profile",
    icon: LuUser,
    path: "/profile",
  },
  {
    id: "10",
    label: "Security",
    icon: LuShield,
    path: "/profile/security",
  },
  {
    id: "11",
    label: "Logout",
    icon: LuLogOut,
    path: "logout",
  },
];
