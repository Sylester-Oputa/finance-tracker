import React, { useState, useContext } from "react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import ThemeContext from "../../context/ThemeContext";

const currencyList = [
  { 
    code: 'NGN', 
    name: 'Nigerian Naira', 
    symbol: '₦',
    flag: '🇳🇬'
  },
  { 
    code: 'USD', 
    name: 'US Dollar', 
    symbol: '$',
    flag: '🇺🇸'
  },
  { 
    code: 'EUR', 
    name: 'Euro', 
    symbol: '€',
    flag: '🇪🇺'
  },
  { 
    code: 'GBP', 
    name: 'British Pound', 
    symbol: '£',
    flag: '🇬🇧'
  },
  { 
    code: 'JPY', 
    name: 'Japanese Yen', 
    symbol: '¥',
    flag: '🇯🇵'
  },
  { 
    code: 'CAD', 
    name: 'Canadian Dollar', 
    symbol: 'C$',
    flag: '🇨🇦'
  },
  { 
    code: 'AUD', 
    name: 'Australian Dollar', 
    symbol: 'A$',
    flag: '🇦🇺'
  },
  { 
    code: 'CHF', 
    name: 'Swiss Franc', 
    symbol: 'CHF',
    flag: '🇨🇭'
  },
];

const CurrencySelector = ({ value, onChange, label = "Preferred Currency" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const themeContext = useContext(ThemeContext);
  
  // Add fallback in case context is undefined
  const isDarkMode = themeContext?.isDarkMode || false;
  
  const selectedCurrency = currencyList.find(c => c.code === value) || currencyList[0];

  const handleSelect = (currency) => {
    onChange(currency.code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className={`block text-sm font-medium mb-2 ${
        isDarkMode ? 'text-gray-200' : 'text-gray-700'
      }`}>
        {label}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#935F4C] focus:ring-opacity-20 focus:border-[#935F4C] transition-all duration-200 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-600 hover:border-gray-500 text-white' 
              : 'bg-white border-gray-200 hover:border-gray-300 text-gray-900'
          }`}
        >
          <div className="flex items-center space-x-3">
            <span className="text-xl">{selectedCurrency.flag}</span>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">
                {selectedCurrency.code}
              </span>
              <span className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {selectedCurrency.name}
              </span>
            </div>
            <span className="text-lg font-semibold text-[#935F4C]">
              {selectedCurrency.symbol}
            </span>
          </div>
          
          {isOpen ? (
            <LuChevronUp className={isDarkMode ? 'text-gray-400' : 'text-gray-400'} />
          ) : (
            <LuChevronDown className={isDarkMode ? 'text-gray-400' : 'text-gray-400'} />
          )}
        </button>

        {isOpen && (
          <div className={`absolute z-50 w-full mt-1 border rounded-lg shadow-lg max-h-60 overflow-y-auto ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-white border-gray-200'
          }`}>
            {currencyList.map((currency) => {
              const isSelected = currency.code === selectedCurrency.code;
              return (
                <button
                  key={currency.code}
                  type="button"
                  onClick={() => handleSelect(currency)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-md transition-colors duration-150 ${
                    isSelected
                      ? (isDarkMode
                          ? 'bg-[#40332E] text-[#FBECE8] border-l-4 border-[#935F4C]'
                          : 'bg-[#F6EDEA] text-[#6E4C41] border-l-4 border-[#935F4C]')
                      : (isDarkMode
                          ? 'text-gray-200 hover:bg-[#3F322D]'
                          : 'text-gray-900 hover:bg-[#F6EDEA]')
                  }`}
                >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{currency.flag}</span>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">
                      {currency.code}
                    </span>
                    <span className={`text-xs ${
                      isSelected
                        ? (isDarkMode ? 'text-[#FBECE8] opacity-80' : 'text-[#6E4C41] opacity-80')
                        : (isDarkMode ? 'text-gray-400' : 'text-gray-500')
                    }`}>
                      {currency.name}
                    </span>
                  </div>
                </div>
                
                <span className={`text-lg font-semibold ${isSelected ? (isDarkMode ? 'text-[#FBECE8]' : 'text-[#935F4C]') : 'text-[#935F4C]'}`}>
                  {currency.symbol}
                </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default CurrencySelector;
