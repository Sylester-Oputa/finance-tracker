import React, { useEffect, useMemo, useState } from "react";
import CARD_2 from "../../assets/images/card2.jpg";
import { LuTrendingUpDown } from "react-icons/lu";
import ThemeToggle from "../ThemeToggle";

const AuthLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <div
        className="w-full md:w-[60vw] px-12 pt-8 pb-12 transition-colors relative z-10"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2
            className="text-lg font-medium transition-colors"
            style={{ color: "var(--color-textPrimary)" }}
          >
            <span
              className="font-black"
              style={{ color: "var(--color-primary)" }}
            >
              Luka
            </span>
            Tech
          </h2>
          <ThemeToggle />
        </div>
        {children}
      </div>

      <div
        className="hidden md:block w-[40vw] h-screen bg-cover bg-no-repeat bg-center overflow-hidden p-8 relative transition-colors"
        style={{
          backgroundColor: "var(--color-sidebarBackground)",
          backgroundImage: "var(--auth-bg-pattern, none)",
        }}
      >
        {/* Decorative elements with theme-aware colors */}
        <div
          className="w-48 h-48 rounded-[40px] absolute -top-7 -left-5 transition-colors opacity-20"
          style={{ backgroundColor: "var(--color-primary)" }}
        />
        <div
          className="w-48 h-56 rounded-[40px] border-[20px] absolute top-[30%] -right-10 transition-colors opacity-30"
          style={{ borderColor: "var(--color-info)" }}
        />
        <div
          className="w-48 h-48 rounded-[40px] absolute -bottom-7 -left-5 transition-colors opacity-20"
          style={{ backgroundColor: "var(--color-success)" }}
        />

        <div className="grid grid-cols-1 z-20 relative">
          <StatsInfoCard
            icon={<LuTrendingUpDown />}
            label="Track Your Income & Expenses"
            value="430,000"
          />
        </div>

        <img
          src={CARD_2}
          alt="card"
          className="w-64 rounded-[30px] lg:w-[90%] absolute bottom-10 shadow-lg transition-opacity opacity-80"
          style={{ filter: "var(--img-filter, none)" }}
        />
      </div>
    </div>
  );
};

export default AuthLayout;

// Currency symbols to cycle through
const CURRENCY_SYMBOLS = [
  "$", // USD
  "€", // EUR
  "£", // GBP
  "¥", // JPY
  "₦", // NGN
  "C$", // CAD
  "A$", // AUD
  "CHF", // CHF
  "¥", // CNY
  "₹", // INR
  "₽", // RUB
  "R", // ZAR
  "R$", // BRL
  "Mex$", // MXN
  "S$", // SGD
  "HK$", // HKD
  "₩", // KRW
  "kr", // SEK
  "kr", // NOK
  "kr", // DKK
  "₺", // TRY
  "د.إ", // AED
  "﷼", // SAR
  "KSh", // KES
  "₵", // GHS
  "₨", // PKR
  "฿", // THB
  "Rp", // IDR
  "RM", // MYR
  "ARS$", // ARS
];

const StatsInfoCard = ({ icon, label, value }) => {
  const [idx, setIdx] = useState(0);
  const total = useMemo(() => CURRENCY_SYMBOLS.length, []);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % total);
    }, 1600);
    return () => clearInterval(t);
  }, [total]);

  return (
    <div
      className="flex gap-6 p-4 rounded-xl shadow-md border z-10 transition-colors"
      style={{
        backgroundColor: "var(--color-cardBackground)",
        borderColor: "var(--color-borderCard)",
        boxShadow: "0 4px 6px -1px var(--color-shadow)",
      }}
    >
      <div
        className="w-12 h-12 flex items-center justify-center text-[26px] rounded-full drop-shadow-xl transition-colors"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-textWhite)",
        }}
      >
        {icon}
      </div>
      <div>
        <h6
          className="text-xs mb-1 transition-colors"
          style={{ color: "var(--color-textSecondary)" }}
        >
          {label}
        </h6>
        {/* Ticker: symbol and value together with a single space, scrolling as one unit */}
        <div className="overflow-hidden h-6" aria-hidden="true">
          <div
            className="transition-transform duration-500 ease-out"
            style={{ transform: `translateY(-${idx * 24}px)` }}
          >
            {CURRENCY_SYMBOLS.map((sym, i) => (
              <div
                key={`${sym}-${i}`}
                className="h-6 leading-6 text-[20px] font-semibold transition-colors whitespace-nowrap"
                style={{ color: "var(--color-textPrimary)" }}
              >
                {sym}{value}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
