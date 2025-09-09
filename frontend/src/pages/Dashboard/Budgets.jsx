import React from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import DashboardProvider from "../../context/DashboardContext";
import BudgetManagement from "../../components/Dashboard/BudgetManagement";

const Budgets = () => {
  useUserAuth();

  return (
    <DashboardProvider>
      <DashboardLayout activeMenu="Budgets">
        <div className="my-5 mx-auto">
          <BudgetManagement />
        </div>
      </DashboardLayout>
    </DashboardProvider>
  );
};

export default Budgets;
