import React from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import DashboardProvider from "../../context/DashboardContext";
import GoalManagement from "../../components/Dashboard/GoalManagement";

const Goals = () => {
  useUserAuth();

  return (
    <DashboardProvider>
      <DashboardLayout activeMenu="Goals">
        <div className="my-5 mx-auto">
          <GoalManagement />
        </div>
      </DashboardLayout>
    </DashboardProvider>
  );
};

export default Goals;
