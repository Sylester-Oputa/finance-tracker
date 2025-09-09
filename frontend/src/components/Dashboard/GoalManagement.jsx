import React, { useState, useEffect, useContext } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { UserContext } from "../../context/UserContext";
import { formatCurrency } from "../../utils/helper";
import Modal from "../Modal";
import Input from "../Inputs/Input";
import ConfirmationModal from "../ConfirmationModal";

const GoalCard = ({ goal, onEdit, onDelete, onAddProgress, onRemoveProgress, onMarkComplete, userCurrency = 'USD' }) => {
  const [progressAmount, setProgressAmount] = useState("");
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [actionType, setActionType] = useState("add"); // "add" or "remove"

  const percentage = goal.target > 0 ? (goal.progress / goal.target) * 100 : 0;
  const isCompleted = percentage >= 100;
  const isNearDeadline = goal.deadline && new Date(goal.deadline) - new Date() < 7 * 24 * 60 * 60 * 1000; // 7 days

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(progressAmount);
    if (amount > 0) {
      try {
        if (actionType === "add") {
          await onAddProgress(goal.id, amount);
        } else {
          await onRemoveProgress(goal.id, amount);
        }
        setProgressAmount("");
        setShowProgressModal(false);
      } catch (error) {
        console.error("Error updating progress:", error);
      }
    }
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return "No deadline";
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return `${diffDays} days left`;
  };

  return (
    <>
      <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${
        isCompleted ? "border-green-500" : isNearDeadline ? "border-red-500" : "border-blue-500"
      }`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
            <p className="text-sm text-gray-500">{formatDeadline(goal.deadline)}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(goal)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(goal.id)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Progress: {formatCurrency(goal.progress, userCurrency)}</span>
            <span>Target: {formatCurrency(goal.target, userCurrency)}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                isCompleted ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">{percentage.toFixed(1)}% complete</span>
            <span className="text-gray-600">
              {formatCurrency(goal.target - goal.progress, userCurrency)} remaining
            </span>
          </div>

          {isCompleted && (
            <div className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full text-center">
              🎉 Goal Completed!
            </div>
          )}
        </div>

        {!isCompleted && (
          <div className="flex space-x-2 mt-4">
            <button
              onClick={() => {
                setActionType("add");
                setShowProgressModal(true);
              }}
              className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors"
            >
              Add Progress
            </button>
            <button
              onClick={() => {
                setActionType("remove");
                setShowProgressModal(true);
              }}
              className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition-colors"
            >
              Remove Progress
            </button>
            {percentage >= 80 && (
              <button
                onClick={() => onMarkComplete && onMarkComplete(goal.id)}
                className="bg-purple-600 text-white py-2 px-3 rounded text-sm hover:bg-purple-700 transition-colors"
              >
                Mark Complete
              </button>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={showProgressModal} onClose={() => setShowProgressModal(false)}>
        <h3 className="text-lg font-semibold mb-4">
          {actionType === "add" ? "Add Progress" : "Remove Progress"} - {goal.name}
        </h3>
        <form onSubmit={handleProgressSubmit} className="space-y-4">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            value={progressAmount}
            onChange={(e) => setProgressAmount(e.target.value)}
            placeholder="0.00"
            required
          />
          <div className="flex space-x-3">
            <button
              type="submit"
              className={`flex-1 py-2 px-4 rounded-md text-white transition-colors ${
                actionType === "add" 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {actionType === "add" ? "Add" : "Remove"} Progress
            </button>
            <button
              type="button"
              onClick={() => setShowProgressModal(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

const GoalForm = ({ goal, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: goal?.name || "",
    target: goal?.target || "",
    deadline: goal?.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Goal name is required";
    if (!formData.target || formData.target <= 0) newErrors.target = "Target must be greater than 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        target: parseFloat(formData.target),
        deadline: formData.deadline ? new Date(formData.deadline) : null,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Goal Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="e.g., Emergency Fund, Vacation"
        error={errors.name}
      />

      <Input
        label="Target Amount"
        type="number"
        step="0.01"
        value={formData.target}
        onChange={(e) => setFormData({ ...formData, target: e.target.value })}
        placeholder="0.00"
        error={errors.target}
      />

      <Input
        label="Deadline (Optional)"
        type="date"
        value={formData.deadline}
        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
      />

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          {goal ? "Update Goal" : "Create Goal"}
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

const GoalManagement = () => {
  const { 
    goals, 
    fetchGoals, 
    createGoal, 
    updateGoal, 
    deleteGoal, 
    addGoalProgress, 
    removeGoalProgress,
    markGoalComplete,
    loading 
  } = useDashboard();
  
  const { user } = useContext(UserContext);
  const userCurrency = user?.defaultCurrency || 'USD';
  
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, goalId: null });

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (goalData) => {
    try {
      await createGoal(goalData);
      setShowModal(false);
    } catch (error) {
      console.error("Error creating goal:", error);
    }
  };

  const handleUpdateGoal = async (goalData) => {
    try {
      await updateGoal(editingGoal.id, goalData);
      setShowModal(false);
      setEditingGoal(null);
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  const handleDeleteGoal = async (id) => {
    setConfirmDelete({ show: true, goalId: id });
  };

  const confirmDeleteGoal = async () => {
    try {
      await deleteGoal(confirmDelete.goalId);
      setConfirmDelete({ show: false, goalId: null });
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Financial Goals</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Goal
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No goals yet. Set your first financial goal to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEdit}
              onDelete={handleDeleteGoal}
              onAddProgress={addGoalProgress}
              onRemoveProgress={removeGoalProgress}
              onMarkComplete={markGoalComplete}
              userCurrency={userCurrency}
            />
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingGoal(null); }}>
        <h3 className="text-lg font-semibold mb-4">
          {editingGoal ? "Edit Goal" : "Create New Goal"}
        </h3>
        <GoalForm
          goal={editingGoal}
          onSubmit={editingGoal ? handleUpdateGoal : handleCreateGoal}
          onCancel={() => { setShowModal(false); setEditingGoal(null); }}
        />
      </Modal>

      <ConfirmationModal
        isOpen={confirmDelete.show}
        onClose={() => setConfirmDelete({ show: false, goalId: null })}
        onConfirm={confirmDeleteGoal}
        title="Delete Goal"
        message="Are you sure you want to delete this goal? All progress will be lost and this action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default GoalManagement;
