const xlsx = require("xlsx");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Add Expense Source
exports.addExpense = async (req, res) => {
  const userId = req.user.id;

  try {
    const { icon, category, amount, date } = req.body;

    // Validation: Check for missing fields
    if (!category || !amount || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Enhanced amount parsing and validation
    let parsedAmount;
    if (typeof amount === 'string') {
      // Remove any formatting (commas, currency symbols, etc.)
      const cleanAmount = amount.replace(/[^0-9.-]/g, '');
      parsedAmount = parseFloat(cleanAmount);
    } else {
      parsedAmount = parseFloat(amount);
    }
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    const newExpense = await prisma.expense.create({
      data: {
        userId,
        icon: icon || '💸',
        category,
        amount: parsedAmount,
        currency: req.user.currency || 'USD',
        date: new Date(date)
      }
    });

    res.status(200).json(newExpense);
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get All Expense Source
exports.getAllExpense = async (req, res) => {
  const userId = req.user.id;

  try {
    const expense = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });
    res.json(expense);
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete Expense Source
exports.deleteExpense = async (req, res) => {
  try {
    await prisma.expense.delete({
      where: { id: req.params.id }
    });
    res.json({ message: "Expense deleted successfully." });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Download Expense Source
exports.downloadExpenseExcel = async (req, res) => {
  const userId = req.user.id;
  try {
    const expense = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });

    // Prepare data for Excel
    const data = expense.map((item) => ({
      Category: item.category,
      Amount: item.amount,
      Currency: item.currency,
      Date: item.date,
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "Expense");
    xlsx.writeFile(wb, "Expense_details.xlsx");
    res.download("Expense_details.xlsx");
  } catch (err) {
    console.error('Error downloading expense excel:', err);
    res.status(500).json({ message: "Server Error" });
  }
};
