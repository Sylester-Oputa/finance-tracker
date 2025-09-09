import React, { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import IncomeOverview from "../../components/Income/IncomeOverview";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import Modal from "../../components/Modal";
import AddIncomeForm from "../../components/Income/AddIncomeForm";
import { toast } from "react-hot-toast";
import IncomeList from "../../components/Income/IncomeList";
import DeleteAlert from "../../components/DeleteAlert";
import { useUserAuth } from "../../hooks/useUserAuth";
import Loader from "../../components/Loader";
import ErrorBoundary from "../../components/ErrorBoundary";
import { PageErrorFallback } from "../../components/ErrorFallbacks";

const Income = () => {
  useUserAuth();

  const [incomeData, setIncomeData] = useState([]); // Replace with actual income data fetching logic
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });
  const [openAddIncomeModal, setOpenAddIncomeModal] = useState(false);
  
  // Get all income Details
  const fetchIncomeData = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (loading) return;
    
    setLoading(true);
    try {
      //API call to fetch income data
      const response = await axiosInstance.get(
        `${API_PATHS.INCOME.GET_ALL_INCOME}`
      );

      if (response.data) {
        setIncomeData(response.data);
      }
    } catch (error) {
      console.error("Error fetching income data:", error);
      toast.error("Failed to fetch income data");
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, []); // Remove loading dependency to prevent infinite loop

  // Handle add income
  const handleAddIncome = async (income) => {
    const { source, amount, date, icon } = income;

    // Validation checks
    if (!source.trim()) {
      toast.error("Source is required.");
      return;
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Valid amount is required.");
      return;
    }

    if (!date) {
      toast.error("Date is required.");
      return;
    }

    try {
      await axiosInstance.post(`${API_PATHS.INCOME.ADD_INCOME}`, {
        source,
        amount,
        date,
        icon,
      });

      setOpenAddIncomeModal(false);
      toast.success("Income added successfully.");
      fetchIncomeData(); // Refresh income data
    } catch (error) {
      console.error("Error adding income:", error);
      toast.error("Failed to add income. Please try again.");
    }
  };

  // Delete income
  const deleteIncome = async (id) => {
    try {
      await axiosInstance.delete(`${API_PATHS.INCOME.DELETE_INCOME(id)}`);
      setOpenDeleteAlert({ show: false, data: null });
      toast.success("Income deleted successfully.");
      fetchIncomeData(); // Refresh income data
    } catch (error) {
      console.error("Error deleting income:", error);
      toast.error("Failed to delete income. Please try again.");
    }
  };

  // handle download income details
  const handleDownloadIncomeDetails = async () => {
    try {
      const res = await axiosInstance.get(
        `${API_PATHS.INCOME.DOWNLOAD_INCOME}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `income_details.xlsx`); // Set the file name
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Income details downloaded successfully.");
    } catch (error) {
      console.error("Error downloading income details:", error);
      toast.error("Failed to download income details.");
    }
  };

  useEffect(() => {
    fetchIncomeData();
  }, [fetchIncomeData]);

  return (
    <ErrorBoundary fallback={PageErrorFallback}>
      <DashboardLayout activeMenu="Income">
        {loading ? (
          <Loader text="Loading Income Data..." />
        ) : (
          <div className="my-5 mx-auto">
            <div className="grid grid-cols-1 gap-6">
              <div className="">
                <IncomeOverview
                  transactions={incomeData}
                  onAddIncome={() => setOpenAddIncomeModal(true)}
                />
              </div>

              <IncomeList
                transactions={incomeData}
                onDelete={(id) => {
                  setOpenDeleteAlert({ show: true, data: id });
                }}
                onDownload={handleDownloadIncomeDetails}
              />
            </div>

            <Modal
              isOpen={openAddIncomeModal}
              onClose={() => setOpenAddIncomeModal(false)}
              title="Add Income"
            >
              <AddIncomeForm onAddIncome={handleAddIncome} />
            </Modal>

            <Modal
              isOpen={openDeleteAlert.show}
              onClose={() => setOpenDeleteAlert({ show: false, data: null })}
              title="Delete Income"
            >
              <DeleteAlert
                content="Are you sure you want to delete this income?"
                onDelete={() => deleteIncome(openDeleteAlert.data)}
              />
            </Modal>
          </div>
        )}
      </DashboardLayout>
    </ErrorBoundary>
  );
};

export default Income;
