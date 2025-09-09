import React from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import DashboardProvider from "../../context/DashboardContext";
import CategoriesBreakdown from "../../components/Dashboard/CategoriesBreakdown";

const Categories = () => {
  useUserAuth();

  return (
    <DashboardProvider>
      <DashboardLayout activeMenu="Categories">
        <div className="my-5 mx-auto">
          <CategoriesBreakdown />
        </div>
      </DashboardLayout>
    </DashboardProvider>
  );
};

export default Categories;
