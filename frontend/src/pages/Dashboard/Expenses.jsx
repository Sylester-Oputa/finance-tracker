import React, { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { handleApiError, handleApiSuccess, withErrorHandling } from "../../utils/errorHandler";
import ExpenseOverview from "../../components/Expense/ExpenseOverview";
import Modal from "../../components/Modal";
import ExpenseList from "../../components/Expense/ExpenseList";
import AddExpenseForm from "../../components/Expense/AddExpenseForm";
import axiosInstance from "../../utils/axiosInstance";
import DeleteAlert from "../../components/DeleteAlert";
import Loader from "../../components/Loader";
import ErrorBoundary from "../../components/ErrorBoundary";
import { PageErrorFallback } from "../../components/ErrorFallbacks";

const Expenses = () => {
  useUserAuth();

  const [expenseData, setExpenseData] = useState([]); // Replace with actual expense data fetching logic
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });
  const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);

  // Get all expense Details
  const fetchExpenseData = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (loading) return;
    
    const result = await withErrorHandling(
      async () => {
        setLoading(true);
        const response = await axiosInstance.get(API_PATHS.EXPENSE.GET_ALL_EXPENSE);
        return response.data;
      },
      'Fetch Expenses'
    );
    
    if (result.success) {
      setExpenseData(result.data || []);
    }
    setLoading(false);
    setIsInitialLoad(false);
  }, []); // Remove loading dependency to prevent infinite loop

  // Handle add expense
  const handleAddExpense = async (expense) => {
    const { category, amount, date, icon } = expense;

    // Validation checks
    if (!category.trim()) {
      toast.error("Category is required.");
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
      await axiosInstance.post(`${API_PATHS.EXPENSE.ADD_EXPENSE}`, {
        category,
        amount,
        date,
        icon,
      });

      setOpenAddExpenseModal(false);
      toast.success("Expense added successfully.");
      fetchExpenseData(); // Refresh the expense data
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Failed to add expense.");
    }
  };

  // Delete Expense
  const deleteExpense = async (expenseId) => {
    try {
      await axiosInstance.delete(
        `${API_PATHS.EXPENSE.DELETE_EXPENSE(expenseId)}`
      );
      setOpenDeleteAlert({ show: false, data: null });
      toast.success("Expense deleted successfully.");
      fetchExpenseData(); // Refresh the expense data
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense.");
    }
  };

  // Download Expense Details
  const handleDownloadExpenseDetails = async () => {
    try {
      const res = await axiosInstance.get(
        `${API_PATHS.EXPENSE.DOWNLOAD_EXPENSE}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `expense_details.xlsx`); // Set the file name
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Expense details downloaded successfully.");
    } catch (error) {
      console.error("Error downloading expense details:", error);
      toast.error("Failed to download expense details.");
    }
  };

  useEffect(() => {
    fetchExpenseData();
  }, [fetchExpenseData]);

  return (
    <ErrorBoundary fallback={PageErrorFallback}>
      <DashboardLayout activeMenu="Expense">
        {(loading && isInitialLoad) ? (
          <Loader text="Loading Expenses..." />
        ) : (
          <div className="my-5 mx-auto">
            <div className="grid grid-cols-1 gap-6">
              <div className="">
                <ExpenseOverview
                  transactions={expenseData}
                  onAddExpense={() => setOpenAddExpenseModal(true)}
                />
              </div>

              <ExpenseList
                transactions={expenseData}
                onDelete={(id) => {
                  setOpenDeleteAlert({ show: true, data: id });
                }}
                onDownload={handleDownloadExpenseDetails}
              />
            </div>

            <Modal
              isOpen={openAddExpenseModal}
              onClose={() => setOpenAddExpenseModal(false)}
              title="Add Expense"
            >
              <AddExpenseForm onAddExpense={handleAddExpense} />
            </Modal>

            <Modal
              isOpen={openDeleteAlert.show}
              onClose={() => setOpenDeleteAlert({ show: false, data: null })}
              title="Delete Expense"
            >
              <DeleteAlert
                content="Are you sure you want to delete this expense?"
                onDelete={() => deleteExpense(openDeleteAlert.data)}
              />
            </Modal>
          </div>
        )}
      </DashboardLayout>
    </ErrorBoundary>
  );
};

export default Expenses;
