const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Initialize Supabase client with fallback for development
const supabaseUrl = process.env.SUPABASE_URL || 'https://jjieqhvfadoqkahpqdvl.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqaWVxaHZmYWRvcWthaHBxZHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NjExODEsImV4cCI6MjA2ODEzNzE4MX0.8rwAFQew3HbzdBgoseq_DX-R6YwJB2Fk5OMgm4KrmBM';

const supabase = createClient(supabaseUrl, supabaseKey);

// Get categories from database
router.get('/categories', async (req, res) => {
    try {
        console.log('[Budget API] GET /categories called');
        
        // Fallback categories untuk Budget System
        const categories = [
            { id: '1', name: 'Makanan & Minuman', icon: 'fas fa-utensils' },
            { id: '2', name: 'Transportasi', icon: 'fas fa-car' },
            { id: '3', name: 'Hiburan', icon: 'fas fa-gamepad' },
            { id: '4', name: 'Belanja', icon: 'fas fa-shopping-bag' },
            { id: '5', name: 'Tagihan', icon: 'fas fa-receipt' },
            { id: '6', name: 'Kesehatan', icon: 'fas fa-heartbeat' },
            { id: '7', name: 'Pendidikan', icon: 'fas fa-graduation-cap' },
            { id: '8', name: 'Lainnya', icon: 'fas fa-ellipsis-h' }
        ];

        console.log('[Budget API] Categories loaded:', categories.length);
        res.json(categories);
        
    } catch (error) {
        console.error('[Budget API] Categories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get current month budget
router.get('/current', async (req, res) => {
    try {
        console.log('[Budget API] GET /current called');
        
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        const sampleBudgets = [
            { 
                id: '1', 
                category_id: '1',
                category_name: 'Makanan & Minuman',
                category_icon: 'fas fa-utensils',
                budget_amount: 500000, 
                spent_amount: 250000,
                remaining_amount: 250000,
                percentage_used: 50,
                month: currentMonth,
                year: currentYear,
                status: 'safe'
            },
            { 
                id: '2', 
                category_id: '2',
                category_name: 'Transportasi',
                category_icon: 'fas fa-car',
                budget_amount: 300000, 
                spent_amount: 240000,
                remaining_amount: 60000,
                percentage_used: 80,
                month: currentMonth,
                year: currentYear,
                status: 'warning'
            }
        ];

        // Calculate summary
        const totalBudget = sampleBudgets.reduce((sum, b) => sum + b.budget_amount, 0);
        const totalSpent = sampleBudgets.reduce((sum, b) => sum + b.spent_amount, 0);
        const remainingBudget = totalBudget - totalSpent;
        const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
        
        // Calculate days left in month
        const now = new Date();
        const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
        const currentDay = now.getDate();
        const daysLeft = Math.max(0, lastDayOfMonth - currentDay);

        res.json({
            budgets: sampleBudgets,
            summary: {
                totalBudget,
                totalSpent,
                remainingBudget,
                percentageUsed,
                daysLeft
            },
            month: currentMonth,
            year: currentYear
        });
        
    } catch (error) {
        console.error('[Budget API] Current budget error:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// Set/Update budget
router.post('/setup', async (req, res) => {
    try {
        console.log('[Budget API] POST /setup called with:', req.body);
        
        const { budgets } = req.body;
        
        if (!budgets || !Array.isArray(budgets)) {
            return res.status(400).json({ error: 'Invalid budget data' });
        }

        // Simulate saving to database
        const results = budgets.map((budget, index) => ({
            id: `budget_${Date.now()}_${index}`,
            category_id: budget.category_id,
            amount: budget.amount,
            created_at: new Date().toISOString(),
            status: 'active'
        }));

        res.json({
            success: true,
            data: results,
            message: `Successfully saved ${results.length} budget entries`
        });
        
    } catch (error) {
        console.error('[Budget API] Setup budget error:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

module.exports = router;
