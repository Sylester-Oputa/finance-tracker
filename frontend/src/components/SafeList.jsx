import React from 'react';

/**
 * Reusable SafeList component that ensures proper key props
 * and handles common list rendering patterns safely
 */
export const SafeList = ({ 
  items = [], 
  renderItem, 
  keyExtractor = (item, index) => item?.id || item?._id || index,
  emptyState = null,
  className = '',
  listClassName = '',
  itemClassName = '',
  limit = null
}) => {
  // Ensure items is an array
  const safeItems = Array.isArray(items) ? items : [];
  
  // Apply limit if specified
  const displayItems = limit ? safeItems.slice(0, limit) : safeItems;

  // Show empty state if no items
  if (displayItems.length === 0) {
    return emptyState || (
      <div className={`flex flex-col items-center justify-center py-8 text-gray-400 ${className}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-16 h-16 mb-4 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 17v-1a3 3 0 013-3h0a3 3 0 013 3v1m-3-3v1m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
          />
        </svg>
        <p className="text-sm font-medium">No items to display</p>
        <p className="text-xs text-gray-300 mt-1">Items will appear here when available</p>
      </div>
    );
  }

  return (
    <div className={listClassName}>
      {displayItems.map((item, index) => {
        const key = keyExtractor(item, index);
        
        return (
          <div key={key} className={itemClassName}>
            {renderItem(item, index)}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Specialized component for transaction lists
 */
export const TransactionList = ({ 
  transactions = [], 
  renderTransaction,
  limit = null,
  emptyMessage = "No transactions to show yet",
  emptySubMessage = "Your transactions will appear here",
  className = ''
}) => {
  return (
    <SafeList
      items={transactions}
      renderItem={renderTransaction}
      keyExtractor={(transaction, index) => 
        transaction?.id || 
        transaction?._id || 
        `transaction-${index}-${transaction?.amount}-${transaction?.date}`
      }
      limit={limit}
      className={className}
      emptyState={
        <div className="flex flex-col items-center justify-center h-full w-full py-8 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-16 h-16 mb-4 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17v-1a3 3 0 013-3h0a3 3 0 013 3v1m-3-3v1m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
            />
          </svg>
          <p className="text-sm font-medium">{emptyMessage}</p>
          <p className="text-xs text-gray-300 mt-1">{emptySubMessage}</p>
        </div>
      }
    />
  );
};

/**
 * Grid-based transaction list
 */
export const TransactionGrid = ({ 
  transactions = [], 
  renderTransaction,
  columns = 'grid-cols-1 md:grid-cols-2',
  limit = null,
  emptyMessage = "No transactions to show yet",
  className = ''
}) => {
  return (
    <TransactionList
      transactions={transactions}
      limit={limit}
      emptyMessage={emptyMessage}
      className={className}
      renderTransaction={(transaction, index) => (
        <div className={`grid ${columns}`}>
          {renderTransaction(transaction, index)}
        </div>
      )}
    />
  );
};

/**
 * Hook for safely handling list operations
 */
export const useSafeList = (items = []) => {
  const safeItems = Array.isArray(items) ? items : [];
  
  const getItemKey = (item, index, prefix = 'item') => {
    return item?.id || item?._id || `${prefix}-${index}`;
  };
  
  const mapWithKeys = (renderFn, prefix = 'item') => {
    return safeItems.map((item, index) => {
      const key = getItemKey(item, index, prefix);
      return React.cloneElement(renderFn(item, index), { key });
    });
  };
  
  return {
    items: safeItems,
    isEmpty: safeItems.length === 0,
    count: safeItems.length,
    getItemKey,
    mapWithKeys,
  };
};

export default SafeList;
