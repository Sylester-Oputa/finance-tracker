import React from 'react';

// Specialized error boundaries for different parts of the app

// Dashboard Error Boundary
export const DashboardErrorFallback = ({ error, retry }) => (
  <div className="min-h-[400px] flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
    <div className="text-center p-6">
      <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Error</h3>
      <p className="text-gray-600 mb-4">Unable to load dashboard data. Please try again.</p>
      <button
        onClick={retry}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Retry Dashboard
      </button>
    </div>
  </div>
);

// Form Error Boundary
export const FormErrorFallback = ({ error, retry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="ml-3 flex-1">
        <h3 className="text-sm font-medium text-red-800">Form Error</h3>
        <p className="mt-1 text-sm text-red-700">
          There was an error processing your form. Please refresh and try again.
        </p>
        <div className="mt-3">
          <button
            onClick={retry}
            className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Chart Error Boundary
export const ChartErrorFallback = ({ error, retry }) => (
  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border">
    <div className="text-center">
      <div className="w-12 h-12 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h4 className="text-sm font-medium text-gray-900 mb-1">Chart Error</h4>
      <p className="text-xs text-gray-600 mb-3">Unable to render chart</p>
      <button
        onClick={retry}
        className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
      >
        Reload Chart
      </button>
    </div>
  </div>
);

// Navigation Error Boundary
export const NavigationErrorFallback = ({ error, retry }) => (
  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm text-yellow-700">
          Navigation error occurred. Some menu items may not work properly.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-1 text-xs underline text-yellow-800 hover:text-yellow-900"
        >
          Refresh page
        </button>
      </div>
    </div>
  </div>
);

// Generic Page Error Boundary
export const PageErrorFallback = ({ error, retry }) => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="text-center">
      <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Error</h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        This page encountered an error and cannot be displayed. Please try refreshing or navigate to a different page.
      </p>
      <div className="space-x-4">
        <button
          onClick={retry}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => window.history.back()}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  </div>
);
