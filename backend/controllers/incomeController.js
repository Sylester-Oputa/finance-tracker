const xlsx = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Add Income Source
exports.addIncome = async (req, res) => {
    const userId = req.user.id;

    try {
        const { icon, source, amount, date } = req.body;

        // Validation: Check for missing fields
        if (!source || !amount || !date) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newIncome = await prisma.income.create({
            data: {
                userId,
                icon: icon || '💰',
                source,
                amount: parseFloat(amount),
                currency: req.user.currency || 'USD',
                date: new Date(date)
            }
        });

        res.status(200).json(newIncome);
    } catch (error) {
        console.error('Error adding income:', error);
        res.status(500).json({ message: "Server Error" });
    }
}

// Get All income source
exports.getAllIncome = async (req, res) => {
    const userId = req.user.id;

    try {
        const income = await prisma.income.findMany({
            where: { userId },
            orderBy: { date: 'desc' }
        });
        res.json(income);
    } catch (err) {
        console.error('Error fetching income:', err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Delete Income Source
exports.deleteIncome = async (req, res) => {
    try {
        await prisma.income.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ message: "Income deleted successfully." });
    } catch (err) {
        console.error('Error deleting income:', err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Download Income Source
exports.downloadIncomeExcel = async (req, res) => {
    const userId = req.user.id;
    try {
        const income = await prisma.income.findMany({
            where: { userId },
            orderBy: { date: 'desc' }
        });

        // Prepare data for Excel
        const data = income.map((item) => ({
            Source: item.source,
            Amount: item.amount,
            Currency: item.currency,
            Date: item.date,
        }));

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, "Income");
        xlsx.writeFile(wb, 'income_details.xlsx');
        res.download('income_details.xlsx');
    } catch (err) {
        console.error('Error downloading income excel:', err);
        res.status(500).json({ message: "Server Error" });
    }
};
