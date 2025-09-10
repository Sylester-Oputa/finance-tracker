import moment from "moment";

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const getInitials = (name) => {
  if (!name) return "";

  const words = name.trim().split(" ");
  let initials = "";

  for (let i = 0; i < Math.min(words.length, 2); i++) {
    initials += words[i][0];
  }

  return initials.toUpperCase();
};

export const addThousandsSeparator = (num) => {
  if (num == null || isNaN(num)) return "";

  const [integerPart, fractionalPart] = num.toString().split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return fractionalPart
    ? `${formattedInteger}.${fractionalPart}`
    : formattedInteger;
};

export const formatCurrency = (amount, currency = 'USD') => {
  if (amount == null || isNaN(amount)) return `${getCurrencySymbol(currency)}0.00`;
  
  const formattedAmount = addThousandsSeparator(Number(amount).toFixed(2));
  return `${getCurrencySymbol(currency)}${formattedAmount}`;
};

export const getCurrencySymbol = (currency = 'USD') => {
  const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'NGN': '₦',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'CHF ',
    'CNY': '¥',
    'INR': '₹',
    'RUB': "₽", // Russian Ruble
    'ZAR': "R", // South African Rand
    'BRL': "R$", // Brazilian Real
    'MXN': "Mex$", // Mexican Peso
    'SGD': "S$", // Singapore Dollar
    'HKD': "HK$", // Hong Kong Dollar
    'KRW': "₩", // South Korean Won
    'SEK': "kr", // Swedish Krona
    'NOK': "kr", // Norwegian Krone
    'DKK': "kr", // Danish Krone
    'TRY': "₺", // Turkish Lira
    'AED': "د.إ", // UAE Dirham
    'SAR': "﷼", // Saudi Riyal
    'KES': "KSh", // Kenyan Shilling
    'GHS': "₵", // Ghanaian Cedi
    'PKR': "₨", // Pakistani Rupee
    'THB': "฿", // Thai Baht
    'IDR': "Rp", // Indonesian Rupiah
    'MYR': "RM", // Malaysian Ringgit
    'ARS': "ARS$", // Argentine Peso
  };
  
  return currencySymbols[currency] || `${currency} `;
};

export const prepareExpenseBarChartData = (data = []) => {
    const chartData = data.map((item) => ({
        category: item?.category,
        amount: item?.amount,
    }));

    return chartData;
}

export const prepareIncomeBarChartData = (data = []) => {
  const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

  const chartData = sortedData.map((item) => ({
    month: moment(item.date).format("Do MMM"),
    amount: item.amount,
    source: item.source,
  }));

  return chartData;
};
