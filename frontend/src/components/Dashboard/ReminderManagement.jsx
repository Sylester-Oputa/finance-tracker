import React, { useState, useEffect, useContext } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { UserContext } from "../../context/UserContext";
import { formatCurrency } from "../../utils/helper";
import Modal from "../Modal";
import Input from "../Inputs/Input";
import ConfirmationModal from "../ConfirmationModal";

const ReminderCard = ({ reminder, onEdit, onDelete, onMarkPaid, userCurrency = 'USD' }) => {
  const dueDate = new Date(reminder.dueDate);
  const now = new Date();
  const diffTime = dueDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const isOverdue = diffDays < 0;
  const isDueToday = diffDays === 0;
  const isDueSoon = diffDays > 0 && diffDays <= 3;

  const getStatusColor = () => {
    if (reminder.paid) return "bg-green-100 border-green-500";
    if (isOverdue) return "bg-red-100 border-red-500";
    if (isDueToday) return "bg-orange-100 border-orange-500";
    if (isDueSoon) return "bg-yellow-100 border-yellow-500";
    return "bg-blue-100 border-blue-500";
  };

  const getStatusText = () => {
    if (reminder.paid) return "Paid";
    if (isOverdue) return `Overdue by ${Math.abs(diffDays)} days`;
    if (isDueToday) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return `Due in ${diffDays} days`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`rounded-lg shadow p-6 border-l-4 ${getStatusColor()}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{reminder.title}</h3>
          <p className="text-sm text-gray-500">Due: {formatDate(reminder.dueDate)}</p>
          {reminder.amount && (
            <p className="text-sm font-medium text-gray-700">Amount: {formatCurrency(reminder.amount, userCurrency)}</p>
          )}
        </div>
        <div className="flex space-x-2">
          {!reminder.paid && (
            <button
              onClick={() => onMarkPaid(reminder.id)}
              className="text-green-600 hover:text-green-800 text-sm"
            >
              Mark Paid
            </button>
          )}
          <button
            onClick={() => onEdit(reminder)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(reminder.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          reminder.paid 
            ? "bg-green-200 text-green-800"
            : isOverdue 
              ? "bg-red-200 text-red-800"
              : isDueToday
                ? "bg-orange-200 text-orange-800"
                : isDueSoon
                  ? "bg-yellow-200 text-yellow-800"
                  : "bg-blue-200 text-blue-800"
        }`}>
          {getStatusText()}
        </span>
        
        {!reminder.paid && (isOverdue || isDueToday) && (
          <span className="text-red-600 text-sm font-medium">⚠️ Urgent</span>
        )}
      </div>
    </div>
  );
};

const ReminderForm = ({ reminder, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: reminder?.title || "",
    dueDate: reminder?.dueDate ? new Date(reminder.dueDate).toISOString().split('T')[0] : "",
    amount: reminder?.amount || "",
    paid: reminder?.paid || false,
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.dueDate) newErrors.dueDate = "Due date is required";
    if (formData.amount && formData.amount < 0) newErrors.amount = "Amount cannot be negative";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        dueDate: new Date(formData.dueDate),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="e.g., Pay electricity bill"
        error={errors.title}
      />

      <Input
        label="Due Date"
        type="date"
        value={formData.dueDate}
        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
        error={errors.dueDate}
      />

      <Input
        label="Amount (Optional)"
        type="number"
        step="0.01"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        placeholder="0.00"
        error={errors.amount}
      />

      <div className="flex items-center">
        <input
          type="checkbox"
          id="paid"
          checked={formData.paid}
          onChange={(e) => setFormData({ ...formData, paid: e.target.checked })}
          className="mr-2"
        />
        <label htmlFor="paid" className="text-sm text-gray-700">
          Mark as paid
        </label>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          {reminder ? "Update Reminder" : "Create Reminder"}
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

const ReminderManagement = () => {
  const { reminders, fetchReminders, createReminder, updateReminder, deleteReminder, loading } = useDashboard();
  const { user } = useContext(UserContext);
  const userCurrency = user?.defaultCurrency || 'USD';
  
  const [showModal, setShowModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [filter, setFilter] = useState("all"); // all, pending, paid, overdue
  const [confirmDelete, setConfirmDelete] = useState({ show: false, reminderId: null });

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleCreateReminder = async (reminderData) => {
    try {
      await createReminder(reminderData);
      setShowModal(false);
    } catch (error) {
      console.error("Error creating reminder:", error);
    }
  };

  const handleUpdateReminder = async (reminderData) => {
    try {
      await updateReminder(editingReminder.id, reminderData);
      setShowModal(false);
      setEditingReminder(null);
    } catch (error) {
      console.error("Error updating reminder:", error);
    }
  };

  const handleDeleteReminder = async (id) => {
    setConfirmDelete({ show: true, reminderId: id });
  };

  const confirmDeleteReminder = async () => {
    try {
      await deleteReminder(confirmDelete.reminderId);
      setConfirmDelete({ show: false, reminderId: null });
    } catch (error) {
      console.error("Error deleting reminder:", error);
    }
  };

  const handleMarkPaid = async (id) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      try {
        await updateReminder(id, { ...reminder, paid: true });
      } catch (error) {
        console.error("Error marking reminder as paid:", error);
      }
    }
  };

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    setShowModal(true);
  };

  const filteredReminders = reminders.filter(reminder => {
    if (filter === "all") return true;
    if (filter === "paid") return reminder.paid;
    if (filter === "pending") return !reminder.paid;
    if (filter === "overdue") {
      const dueDate = new Date(reminder.dueDate);
      const now = new Date();
      return !reminder.paid && dueDate < now;
    }
    return true;
  });

  const getFilterCounts = () => {
    const all = reminders.length;
    const paid = reminders.filter(r => r.paid).length;
    const pending = reminders.filter(r => !r.paid).length;
    const overdue = reminders.filter(r => {
      const dueDate = new Date(r.dueDate);
      const now = new Date();
      return !r.paid && dueDate < now;
    }).length;

    return { all, paid, pending, overdue };
  };

  const counts = getFilterCounts();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Payment Reminders</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Reminder
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: "all", label: `All (${counts.all})` },
          { key: "pending", label: `Pending (${counts.pending})` },
          { key: "overdue", label: `Overdue (${counts.overdue})` },
          { key: "paid", label: `Paid (${counts.paid})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === key
                ? "bg-white text-blue-600 shadow"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8">Loading reminders...</div>
      ) : filteredReminders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {filter === "all" 
            ? "No reminders yet. Create your first reminder to get started!"
            : `No ${filter} reminders.`
          }
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onEdit={handleEdit}
              onDelete={handleDeleteReminder}
              onMarkPaid={handleMarkPaid}
              userCurrency={userCurrency}
            />
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingReminder(null); }}>
        <h3 className="text-lg font-semibold mb-4">
          {editingReminder ? "Edit Reminder" : "Create New Reminder"}
        </h3>
        <ReminderForm
          reminder={editingReminder}
          onSubmit={editingReminder ? handleUpdateReminder : handleCreateReminder}
          onCancel={() => { setShowModal(false); setEditingReminder(null); }}
        />
      </Modal>

      <ConfirmationModal
        isOpen={confirmDelete.show}
        onClose={() => setConfirmDelete({ show: false, reminderId: null })}
        onConfirm={confirmDeleteReminder}
        title="Delete Reminder"
        message="Are you sure you want to delete this reminder? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ReminderManagement;
