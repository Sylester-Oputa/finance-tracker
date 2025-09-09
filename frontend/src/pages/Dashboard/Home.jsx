import React, { useEffect } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardProvider, { useDashboard } from "../../context/DashboardContext";
import DashboardOverview from "../../components/Dashboard/DashboardOverview";

const HomeContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshAllData } = useDashboard();

  // Refresh data when coming back to dashboard
  useEffect(() => {
    // Refresh data when the location state indicates data was updated
    if (location.state?.refreshDashboard) {
      refreshAllData();
      // Clear the state to prevent unnecessary refreshes
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, refreshAllData, navigate, location.pathname]);

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="my-5 mx-auto">
        <DashboardOverview onNavigate={navigate} />
      </div>
    </DashboardLayout>
  );
};

const Home = () => {
  useUserAuth();

  return (
    <DashboardProvider>
      <HomeContent />
    </DashboardProvider>
  );
};

export default Home;
