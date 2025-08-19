const express = require('express');
const router = express.Router();

// Budget Management API Endpoints
// Base URL: /api/budgets

/**
 * GET /api/budgets/current
 * Get current month budgets for user
 */
router.get('/current', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        // Get budget summary for current month
        const { data: budgets, error } = await req.supabase
            .from('budget_summary')
            .select('*')
            .eq('user_id', userId)
            .eq('month', month)
            .eq('year', year)
            .order('category_name');

        if (error) {
            console.error('Error fetching budgets:', error);
            return res.status(500).json({ error: 'Failed to fetch budgets' });
        }

        // Calculate totals
        const totals = budgets.reduce((acc, budget) => ({
            totalBudget: acc.totalBudget + parseFloat(budget.budget_amount || 0),
            totalSpent: acc.totalSpent + parseFloat(budget.spent_amount || 0),
            categoriesOverBudget: acc.categoriesOverBudget + (budget.status === 'over_budget' ? 1 : 0)
        }), { totalBudget: 0, totalSpent: 0, categoriesOverBudget: 0 });

        const daysInMonth = new Date(year, month, 0).getDate();
        const currentDay = currentDate.getDate();
        const daysLeft = daysInMonth - currentDay;

        const response = {
            budgets,
            summary: {
                ...totals,
                remainingBudget: totals.totalBudget - totals.totalSpent,
                percentageUsed: totals.totalBudget > 0 ? (totals.totalSpent / totals.totalBudget * 100) : 0,
                daysLeft,
                daysInMonth,
                averageDailySpending: currentDay > 0 ? totals.totalSpent / currentDay : 0,
                projectedMonthlySpending: currentDay > 0 ? (totals.totalSpent / currentDay) * daysInMonth : 0,
                savingsRate: totals.totalBudget > 0 ? ((totals.totalBudget - totals.totalSpent) / totals.totalBudget * 100) : 0
            },
            month,
            year
        };

        res.json(response);
    } catch (error) {
        console.error('Error in GET /current:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/budgets/alerts
 * Get unread budget alerts for user
 */
router.get('/alerts', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { data: alerts, error } = await req.supabase
            .from('budget_alerts')
            .select(`
                *,
                budgets!inner(
                    budget_amount,
                    categories!inner(name, icon)
                )
            `)
            .eq('user_id', userId)
            .eq('is_read', false)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Error fetching alerts:', error);
            return res.status(500).json({ error: 'Failed to fetch alerts' });
        }

        res.json({ alerts });
    } catch (error) {
        console.error('Error in GET /alerts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/budgets/setup
 * Setup budgets for a specific month/year
 */
router.post('/setup', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { budgets, month, year } = req.body;

        if (!budgets || !Array.isArray(budgets) || !month || !year) {
            return res.status(400).json({ error: 'Invalid budget data' });
        }

        // Validate month and year
        if (month < 1 || month > 12 || year < 2020 || year > 2030) {
            return res.status(400).json({ error: 'Invalid month or year' });
        }

        // Prepare budget data for upsert
        const budgetData = budgets.map(budget => ({
            user_id: userId,
            category_id: budget.category_id,
            budget_amount: parseFloat(budget.budget_amount) || 0,
            alert_threshold: parseFloat(budget.alert_threshold) || 80,
            month: parseInt(month),
            year: parseInt(year),
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));

        // Use upsert to handle existing budgets
        const { data, error } = await req.supabase
            .from('budgets')
            .upsert(budgetData, {
                onConflict: 'user_id,category_id,month,year'
            })
            .select();

        if (error) {
            console.error('Error setting up budgets:', error);
            return res.status(500).json({ error: 'Failed to setup budgets' });
        }

        res.json({ 
            message: 'Budgets setup successfully',
            budgets: data 
        });
    } catch (error) {
        console.error('Error in POST /setup:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * PUT /api/budgets/:id
 * Update a specific budget
 */
router.put('/:id', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { id } = req.params;
        const { budget_amount, alert_threshold } = req.body;

        if (!budget_amount || budget_amount <= 0) {
            return res.status(400).json({ error: 'Invalid budget amount' });
        }

        const { data, error } = await req.supabase
            .from('budgets')
            .update({
                budget_amount: parseFloat(budget_amount),
                alert_threshold: parseFloat(alert_threshold) || 80,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating budget:', error);
            return res.status(500).json({ error: 'Failed to update budget' });
        }

        if (!data) {
            return res.status(404).json({ error: 'Budget not found' });
        }

        res.json({ 
            message: 'Budget updated successfully',
            budget: data 
        });
    } catch (error) {
        console.error('Error in PUT /:id:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/budgets/copy-from-previous
 * Copy budgets from previous month
 */
router.post('/copy-from-previous', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { month, year } = req.body;

        if (!month || !year) {
            return res.status(400).json({ error: 'Month and year are required' });
        }

        // Calculate previous month
        let prevMonth = month - 1;
        let prevYear = year;
        if (prevMonth < 1) {
            prevMonth = 12;
            prevYear = year - 1;
        }

        // Get previous month budgets
        const { data: previousBudgets, error: fetchError } = await req.supabase
            .from('budgets')
            .select('category_id, budget_amount, alert_threshold')
            .eq('user_id', userId)
            .eq('month', prevMonth)
            .eq('year', prevYear)
            .eq('is_active', true);

        if (fetchError) {
            console.error('Error fetching previous budgets:', fetchError);
            return res.status(500).json({ error: 'Failed to fetch previous budgets' });
        }

        if (!previousBudgets || previousBudgets.length === 0) {
            return res.status(404).json({ error: 'No previous budgets found to copy' });
        }

        // Prepare new budget data
        const newBudgets = previousBudgets.map(budget => ({
            user_id: userId,
            category_id: budget.category_id,
            budget_amount: budget.budget_amount,
            alert_threshold: budget.alert_threshold,
            month: parseInt(month),
            year: parseInt(year),
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));

        // Insert new budgets
        const { data, error } = await req.supabase
            .from('budgets')
            .upsert(newBudgets, {
                onConflict: 'user_id,category_id,month,year'
            })
            .select();

        if (error) {
            console.error('Error copying budgets:', error);
            return res.status(500).json({ error: 'Failed to copy budgets' });
        }

        res.json({ 
            message: `Successfully copied ${data.length} budgets from ${prevMonth}/${prevYear}`,
            budgets: data 
        });
    } catch (error) {
        console.error('Error in POST /copy-from-previous:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/budgets/alerts/:id/mark-read
 * Mark an alert as read
 */
router.post('/alerts/:id/mark-read', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { id } = req.params;

        const { data, error } = await req.supabase
            .from('budget_alerts')
            .update({ is_read: true })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error marking alert as read:', error);
            return res.status(500).json({ error: 'Failed to update alert' });
        }

        if (!data) {
            return res.status(404).json({ error: 'Alert not found' });
        }

        res.json({ 
            message: 'Alert marked as read',
            alert: data 
        });
    } catch (error) {
        console.error('Error in POST /alerts/:id/mark-read:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/budgets/analytics
 * Get budget analytics for user
 */
router.get('/analytics', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { months = 6 } = req.query;
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        // Generate array of months to analyze
        const monthsToAnalyze = [];
        for (let i = parseInt(months) - 1; i >= 0; i--) {
            let month = currentMonth - i;
            let year = currentYear;
            while (month <= 0) {
                month += 12;
                year -= 1;
            }
            monthsToAnalyze.push({ month, year });
        }

        // Get budget data for these months
        const analyticsPromises = monthsToAnalyze.map(async ({ month, year }) => {
            const { data: budgets, error } = await req.supabase
                .from('budget_summary')
                .select('*')
                .eq('user_id', userId)
                .eq('month', month)
                .eq('year', year);

            if (error) {
                console.error(`Error fetching budgets for ${month}/${year}:`, error);
                return null;
            }

            const totals = budgets.reduce((acc, budget) => ({
                totalBudget: acc.totalBudget + parseFloat(budget.budget_amount || 0),
                totalSpent: acc.totalSpent + parseFloat(budget.spent_amount || 0),
                categoriesCount: acc.categoriesCount + 1,
                overBudgetCount: acc.overBudgetCount + (budget.status === 'over_budget' ? 1 : 0)
            }), { totalBudget: 0, totalSpent: 0, categoriesCount: 0, overBudgetCount: 0 });

            return {
                month,
                year,
                period: `${year}-${month.toString().padStart(2, '0')}`,
                ...totals,
                savingsAmount: totals.totalBudget - totals.totalSpent,
                savingsRate: totals.totalBudget > 0 ? ((totals.totalBudget - totals.totalSpent) / totals.totalBudget * 100) : 0,
                budgetAccuracy: totals.categoriesCount > 0 ? ((totals.categoriesCount - totals.overBudgetCount) / totals.categoriesCount * 100) : 0
            };
        });

        const analyticsData = await Promise.all(analyticsPromises);
        const validAnalytics = analyticsData.filter(data => data !== null);

        // Calculate trends
        const trends = {
            spendingTrend: validAnalytics.length > 1 ? 
                validAnalytics[validAnalytics.length - 1].totalSpent - validAnalytics[validAnalytics.length - 2].totalSpent : 0,
            savingsRateTrend: validAnalytics.length > 1 ? 
                validAnalytics[validAnalytics.length - 1].savingsRate - validAnalytics[validAnalytics.length - 2].savingsRate : 0,
            budgetAccuracyTrend: validAnalytics.length > 1 ? 
                validAnalytics[validAnalytics.length - 1].budgetAccuracy - validAnalytics[validAnalytics.length - 2].budgetAccuracy : 0
        };

        res.json({
            analytics: validAnalytics,
            trends,
            summary: {
                averageSavingsRate: validAnalytics.length > 0 ? 
                    validAnalytics.reduce((sum, data) => sum + data.savingsRate, 0) / validAnalytics.length : 0,
                averageBudgetAccuracy: validAnalytics.length > 0 ? 
                    validAnalytics.reduce((sum, data) => sum + data.budgetAccuracy, 0) / validAnalytics.length : 0,
                totalSavings: validAnalytics.reduce((sum, data) => sum + data.savingsAmount, 0)
            }
        });
    } catch (error) {
        console.error('Error in GET /analytics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * DELETE /api/budgets/:id
 * Deactivate a budget (soft delete)
 */
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { id } = req.params;

        const { data, error } = await req.supabase
            .from('budgets')
            .update({ 
                is_active: false,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error deactivating budget:', error);
            return res.status(500).json({ error: 'Failed to deactivate budget' });
        }

        if (!data) {
            return res.status(404).json({ error: 'Budget not found' });
        }

        res.json({ message: 'Budget deactivated successfully' });
    } catch (error) {
        console.error('Error in DELETE /:id:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
