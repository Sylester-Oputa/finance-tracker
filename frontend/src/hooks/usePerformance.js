import { useMemo, useCallback, useRef, useEffect, useState } from 'react';

// Debounce hook for input fields and search
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for scroll events and resize
export const useThrottle = (callback, delay) => {
  const lastRan = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRan.current >= delay) {
      callback(...args);
      lastRan.current = Date.now();
    }
  }, [callback, delay]);
};

// Memoized currency formatter
export const useCurrencyFormatter = (currency = 'USD') => {
  return useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [currency]);
};

// Memoized date formatter
export const useDateFormatter = (locale = 'en-US') => {
  return useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, [locale]);
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (options = {}) => {
  const elementRef = useRef();
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      options
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options]);

  return [elementRef, isIntersecting];
};

// Virtual scrolling hook for large lists
export const useVirtualScroll = (items, containerHeight, itemHeight) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [items, scrollTop, containerHeight, itemHeight]);

  const onScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return { visibleItems, onScroll };
};

// Memoized calculations hook
export const useMemoizedCalculations = (expenses, income, budgets, goals) => {
  return useMemo(() => {
    const totalExpenses = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
    const totalIncome = income?.reduce((sum, inc) => sum + inc.amount, 0) || 0;
    const netWorth = totalIncome - totalExpenses;
    
    const totalBudget = budgets?.reduce((sum, budget) => sum + budget.amount, 0) || 0;
    const budgetUsed = expenses?.reduce((sum, expense) => {
      const budget = budgets?.find(b => b.categoryId === expense.categoryId);
      return budget ? sum + expense.amount : sum;
    }, 0) || 0;
    
    const totalGoals = goals?.reduce((sum, goal) => sum + goal.targetAmount, 0) || 0;
    const goalsAchieved = goals?.filter(goal => goal.isCompleted)?.length || 0;
    
    return {
      totalExpenses,
      totalIncome,
      netWorth,
      totalBudget,
      budgetUsed,
      budgetRemaining: totalBudget - budgetUsed,
      budgetPercentage: totalBudget > 0 ? (budgetUsed / totalBudget) * 100 : 0,
      totalGoals,
      goalsAchieved,
      goalsProgress: goals?.length > 0 ? (goalsAchieved / goals.length) * 100 : 0,
    };
  }, [expenses, income, budgets, goals]);
};

// Optimized search/filter hook
export const useOptimizedFilter = (items, searchTerm, filterFn) => {
  return useMemo(() => {
    if (!items) return [];
    
    let filtered = items;
    
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      filtered = items.filter(item => 
        filterFn ? filterFn(item, lowercaseSearch) : 
        item.name?.toLowerCase().includes(lowercaseSearch) ||
        item.description?.toLowerCase().includes(lowercaseSearch)
      );
    }
    
    return filtered;
  }, [items, searchTerm, filterFn]);
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;

    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} rendered ${renderCount.current} times. Last render took ${renderTime.toFixed(2)}ms`);
    }

    startTime.current = performance.now();
  });

  return renderCount.current;
};

// Lazy loading component wrapper
export const LazyWrapper = ({ children, fallback = null }) => {
  const [elementRef, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  });

  return (
    <div ref={elementRef}>
      {isIntersecting ? children : fallback}
    </div>
  );
};
