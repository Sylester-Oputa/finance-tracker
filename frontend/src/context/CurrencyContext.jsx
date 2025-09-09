import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserContext } from './UserContext';

export const CurrencyContext = createContext();

const CurrencyProvider = ({ children }) => {
  const { user } = useContext(UserContext);
  const [currentCurrency, setCurrentCurrency] = useState('USD');

  // Update currency when user changes or user's defaultCurrency changes
  useEffect(() => {
    if (user?.defaultCurrency) {
      setCurrentCurrency(user.defaultCurrency);
    }
  }, [user?.defaultCurrency]);

  // Function to update currency across the app
  const updateCurrency = (newCurrency) => {
    setCurrentCurrency(newCurrency);
  };

  // Currency formatting function
  const formatCurrency = (amount, currency = currentCurrency) => {
    const currencySymbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      NGN: '₦',
      CAD: 'C$',
      AUD: 'A$',
      CHF: 'CHF',
      CNY: '¥',
      INR: '₹'
    };

    const symbol = currencySymbols[currency] || currency;
    
    // Format the number with appropriate decimal places
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    }).format(amount);

    return `${symbol}${formattedAmount}`;
  };

  // Get currency symbol
  const getCurrencySymbol = (currency = currentCurrency) => {
    const currencySymbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      NGN: '₦',
      CAD: 'C$',
      AUD: 'A$',
      CHF: 'CHF',
      CNY: '¥',
      INR: '₹'
    };

    return currencySymbols[currency] || currency;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currentCurrency,
        updateCurrency,
        formatCurrency,
        getCurrencySymbol
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyProvider;
