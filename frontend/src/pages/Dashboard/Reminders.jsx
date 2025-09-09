import React from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import DashboardProvider from "../../context/DashboardContext";
import ReminderManagement from "../../components/Dashboard/ReminderManagement";

const Reminders = () => {
  useUserAuth();

  return (
    <DashboardProvider>
      <DashboardLayout activeMenu="Reminders">
        <div className="my-5 mx-auto">
          <ReminderManagement />
        </div>
      </DashboardLayout>
    </DashboardProvider>
  );
};

export default Reminders;
