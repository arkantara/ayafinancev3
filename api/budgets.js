const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://jjieqhvfadoqkahpqdvl.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqaWVxaHZmYWRvcWthaHBxZHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NjExODEsImV4cCI6MjA2ODEzNzE4MX0.8rwAFQew3HbzdBgoseq_DX-R6YwJB2Fk5OMgm4KrmBM';
const supabase = createClient(supabaseUrl, supabaseKey);

// Get current month budget
router.get('/current', async (req, res) => {
  try {
    const userId = req.query.user_id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();

    console.log(`[Budget API] Getting budget for user ${userId}, month ${currentMonth}/${currentYear}`);

    // Get budget for current month
    const { data: budgets, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month', currentMonth)
      .eq('year', currentYear);

    if (error) {
      console.error('[Budget API] Error fetching budgets:', error);
      return res.status(500).json({ error: error.message });
    }

    // Get actual spending for current month
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0);

    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('category, amount')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', startOfMonth.toISOString().split('T')[0])
      .lte('date', endOfMonth.toISOString().split('T')[0]);

    if (transError) {
      console.error('[Budget API] Error fetching transactions:', transError);
      return res.status(500).json({ error: transError.message });
    }

    // Calculate actual spending per category
    const actualSpending = {};
    transactions?.forEach(trans => {
      if (!actualSpending[trans.category]) {
        actualSpending[trans.category] = 0;
      }
      actualSpending[trans.category] += parseFloat(trans.amount) || 0;
    });

    // Combine budget with actual spending
    const budgetData = budgets?.map(budget => ({
      ...budget,
      actual_amount: actualSpending[budget.category] || 0,
      percentage_used: budget.amount > 0 ? Math.round(((actualSpending[budget.category] || 0) / budget.amount) * 100) : 0,
      remaining: budget.amount - (actualSpending[budget.category] || 0)
    })) || [];

    console.log(`[Budget API] Found ${budgetData.length} budget entries`);

    res.json({
      success: true,
      data: budgetData,
      month: currentMonth,
      year: currentYear,
      summary: {
        total_budget: budgetData.reduce((sum, b) => sum + (b.amount || 0), 0),
        total_spent: budgetData.reduce((sum, b) => sum + (b.actual_amount || 0), 0),
        categories_count: budgetData.length
      }
    });

  } catch (error) {
    console.error('[Budget API] Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update budget
router.post('/set', async (req, res) => {
  try {
    const { user_id, budgets } = req.body;
    
    if (!user_id || !budgets || !Array.isArray(budgets)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    console.log(`[Budget API] Setting budgets for user ${user_id}, month ${currentMonth}/${currentYear}`);

    const results = [];

    for (const budget of budgets) {
      const { category, amount } = budget;
      
      if (!category || amount === undefined) {
        continue;
      }

      // Check if budget already exists
      const { data: existing } = await supabase
        .from('budgets')
        .select('id')
        .eq('user_id', user_id)
        .eq('category', category)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .single();

      if (existing) {
        // Update existing budget
        const { data, error } = await supabase
          .from('budgets')
          .update({ amount: parseFloat(amount) })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          console.error(`[Budget API] Error updating budget for ${category}:`, error);
        } else {
          results.push({ ...data, action: 'updated' });
        }
      } else {
        // Create new budget
        const { data, error } = await supabase
          .from('budgets')
          .insert({
            user_id,
            category,
            amount: parseFloat(amount),
            month: currentMonth,
            year: currentYear
          })
          .select()
          .single();

        if (error) {
          console.error(`[Budget API] Error creating budget for ${category}:`, error);
        } else {
          results.push({ ...data, action: 'created' });
        }
      }
    }

    console.log(`[Budget API] Successfully processed ${results.length} budgets`);

    res.json({
      success: true,
      data: results,
      message: `Successfully saved ${results.length} budget entries`
    });

  } catch (error) {
    console.error('[Budget API] Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get budget categories
router.get('/categories', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('name')
      .eq('type', 'expense')
      .order('name');

    if (error) {
      console.error('[Budget API] Error fetching categories:', error);
      return res.status(500).json({ error: error.message });
    }

    const categoryList = categories?.map(cat => cat.name) || [
      'Makanan & Minuman',
      'Transportasi', 
      'Hiburan',
      'Belanja',
      'Tagihan',
      'Kesehatan',
      'Pendidikan',
      'Lainnya'
    ];

    res.json({
      success: true,
      data: categoryList
    });

  } catch (error) {
    console.error('[Budget API] Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
