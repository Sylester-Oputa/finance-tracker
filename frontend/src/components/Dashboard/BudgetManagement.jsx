import React, { useState, useEffect, useContext } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { UserContext } from "../../context/UserContext";
import { formatCurrency } from "../../utils/helper";
import Modal from "../Modal";
import Input from "../Inputs/Input";
import ConfirmationModal from "../ConfirmationModal";

const BudgetCard = ({ budget, onEdit, onDelete, userCurrency = 'USD' }) => {
  // Use real spending data from backend
  const spent = budget.spent || 0;
  const percentage = budget.percentage || 0;
  const remaining = budget.remaining || 0;
  const status = budget.status || 'good';
  
  const getStatusColor = () => {
    switch (status) {
      case 'over': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'over': return 'Over Budget';
      case 'warning': return 'Near Limit';
      default: return 'On Track';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${
      status === 'over' ? 'border-red-500' : 
      status === 'warning' ? 'border-yellow-500' : 'border-green-500'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{budget.category}</h3>
          <p className="text-sm text-gray-500 capitalize">{budget.period} Budget</p>
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
            status === 'over' ? 'bg-red-100 text-red-800' :
            status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {getStatusText()}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(budget)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(budget.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Spent: {formatCurrency(spent, userCurrency)}</span>
          <span>Budget: {formatCurrency(budget.amount, userCurrency)}</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getStatusColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs">
          <span className={status === 'over' ? "text-red-600" : "text-gray-600"}>
            {percentage.toFixed(1)}% used
          </span>
          <span className={remaining < 0 ? "text-red-600" : "text-gray-600"}>
            {remaining >= 0 ? formatCurrency(remaining, userCurrency) : formatCurrency(Math.abs(remaining), userCurrency)} 
            {remaining >= 0 ? ' remaining' : ' over budget'}
          </span>
        </div>
        
        {status === 'over' && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            ⚠️ You've exceeded this budget by {formatCurrency(Math.abs(remaining), userCurrency)}
          </div>
        )}
        
        {status === 'warning' && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
            ⚠️ You're approaching your budget limit
          </div>
        )}
      </div>
    </div>
  );
};

const BudgetForm = ({ budget, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    category: budget?.category || "",
    amount: budget?.amount || "",
    period: budget?.period || "monthly",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!formData.amount || formData.amount <= 0) newErrors.amount = "Amount must be greater than 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Category"
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        placeholder="e.g., Food, Transportation"
        error={errors.category}
      />

      <Input
        label="Budget Amount"
        type="number"
        step="0.01"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        placeholder="0.00"
        error={errors.amount}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Period
        </label>
        <select
          value={formData.period}
          onChange={(e) => setFormData({ ...formData, period: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          {budget ? "Update Budget" : "Create Budget"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const BudgetManagement = () => {
  const { budgets, fetchBudgets, createBudget, updateBudget, deleteBudget, loading } = useDashboard();
  const { user } = useContext(UserContext);
  const userCurrency = user?.defaultCurrency || 'USD';
  
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, budgetId: null });

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleCreateBudget = async (budgetData) => {
    try {
      await createBudget(budgetData);
      setShowModal(false);
    } catch (error) {
      console.error("Error creating budget:", error);
    }
  };

  const handleUpdateBudget = async (budgetData) => {
    try {
      await updateBudget(editingBudget.id, budgetData);
      setShowModal(false);
      setEditingBudget(null);
    } catch (error) {
      console.error("Error updating budget:", error);
    }
  };

  const handleDeleteBudget = async (id) => {
    setConfirmDelete({ show: true, budgetId: id });
  };

  const confirmDeleteBudget = async () => {
    try {
      await deleteBudget(confirmDelete.budgetId);
      setConfirmDelete({ show: false, budgetId: null });
    } catch (error) {
      console.error("Error deleting budget:", error);
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Budget Management</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Budget
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading budgets...</div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No budgets yet. Create your first budget to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={handleEdit}
              onDelete={handleDeleteBudget}
              userCurrency={userCurrency}
            />
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingBudget(null); }}>
        <h3 className="text-lg font-semibold mb-4">
          {editingBudget ? "Edit Budget" : "Create New Budget"}
        </h3>
        <BudgetForm
          budget={editingBudget}
          onSubmit={editingBudget ? handleUpdateBudget : handleCreateBudget}
          onCancel={() => { setShowModal(false); setEditingBudget(null); }}
        />
      </Modal>

      <ConfirmationModal
        isOpen={confirmDelete.show}
        onClose={() => setConfirmDelete({ show: false, budgetId: null })}
        onConfirm={confirmDeleteBudget}
        title="Delete Budget"
        message="Are you sure you want to delete this budget? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default BudgetManagement;
