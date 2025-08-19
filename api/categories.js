const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Initialize Supabase client with fallback for development
const supabaseUrl = process.env.SUPABASE_URL || 'https://jjieqhvfadoqkahpqdvl.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqaWVxaHZmYWRvcWthaHBxZHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NjExODEsImV4cCI6MjA2ODEzNzE4MX0.8rwAFQew3HbzdBgoseq_DX-R6YwJB2Fk5OMgm4KrmBM';

const supabase = createClient(supabaseUrl, supabaseKey);

// GET all categories
router.get('/', async (req, res) => {
    try {
        console.log('[Categories API] GET / called');
        
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');

        if (error) {
            console.error('[Categories API] Error fetching categories:', error);
            // Return fallback categories
            return res.json([
                { id: '1', name: 'Makanan & Minuman', icon: 'fas fa-utensils', type: 'expense', color: '#EF4444' },
                { id: '2', name: 'Transportasi', icon: 'fas fa-car', type: 'expense', color: '#3B82F6' },
                { id: '3', name: 'Hiburan', icon: 'fas fa-gamepad', type: 'expense', color: '#8B5CF6' },
                { id: '4', name: 'Belanja', icon: 'fas fa-shopping-bag', type: 'expense', color: '#F59E0B' },
                { id: '5', name: 'Tagihan', icon: 'fas fa-receipt', type: 'expense', color: '#EF4444' },
                { id: '6', name: 'Kesehatan', icon: 'fas fa-heartbeat', type: 'expense', color: '#10B981' },
                { id: '7', name: 'Pendidikan', icon: 'fas fa-graduation-cap', type: 'expense', color: '#6366F1' },
                { id: '8', name: 'Lainnya', icon: 'fas fa-ellipsis-h', type: 'expense', color: '#6B7280' },
                { id: '9', name: 'Gaji', icon: 'fas fa-money-bill', type: 'income', color: '#10B981' },
                { id: '10', name: 'Bonus', icon: 'fas fa-gift', type: 'income', color: '#F59E0B' },
                { id: '11', name: 'Investasi', icon: 'fas fa-chart-line', type: 'income', color: '#3B82F6' }
            ]);
        }

        console.log('[Categories API] Categories loaded from database:', categories?.length || 0);
        res.json(categories || []);
        
    } catch (error) {
        console.error('[Categories API] Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET categories by type (expense/income)
router.get('/type/:type', async (req, res) => {
    try {
        const { type } = req.params;
        console.log(`[Categories API] GET /type/${type} called`);
        
        if (!['expense', 'income'].includes(type)) {
            return res.status(400).json({ error: 'Invalid type. Must be "expense" or "income"' });
        }

        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .eq('type', type)
            .order('name');

        if (error) {
            console.error('[Categories API] Error fetching categories by type:', error);
            // Return fallback categories based on type
            const fallbackCategories = type === 'expense' 
                ? [
                    { id: '1', name: 'Makanan & Minuman', icon: 'fas fa-utensils', type: 'expense', color: '#EF4444' },
                    { id: '2', name: 'Transportasi', icon: 'fas fa-car', type: 'expense', color: '#3B82F6' },
                    { id: '3', name: 'Hiburan', icon: 'fas fa-gamepad', type: 'expense', color: '#8B5CF6' },
                    { id: '4', name: 'Belanja', icon: 'fas fa-shopping-bag', type: 'expense', color: '#F59E0B' },
                    { id: '5', name: 'Tagihan', icon: 'fas fa-receipt', type: 'expense', color: '#EF4444' },
                    { id: '6', name: 'Kesehatan', icon: 'fas fa-heartbeat', type: 'expense', color: '#10B981' },
                    { id: '7', name: 'Pendidikan', icon: 'fas fa-graduation-cap', type: 'expense', color: '#6366F1' },
                    { id: '8', name: 'Lainnya', icon: 'fas fa-ellipsis-h', type: 'expense', color: '#6B7280' }
                ]
                : [
                    { id: '9', name: 'Gaji', icon: 'fas fa-money-bill', type: 'income', color: '#10B981' },
                    { id: '10', name: 'Bonus', icon: 'fas fa-gift', type: 'income', color: '#F59E0B' },
                    { id: '11', name: 'Investasi', icon: 'fas fa-chart-line', type: 'income', color: '#3B82F6' }
                ];
            
            return res.json(fallbackCategories);
        }

        console.log(`[Categories API] Categories (${type}) loaded from database:`, categories?.length || 0);
        res.json(categories || []);
        
    } catch (error) {
        console.error('[Categories API] Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST - Create new category
router.post('/', async (req, res) => {
    try {
        console.log('[Categories API] POST / called with:', req.body);
        
        const { name, icon, type, color } = req.body;
        
        if (!name || !type) {
            return res.status(400).json({ error: 'Name and type are required' });
        }

        if (!['expense', 'income'].includes(type)) {
            return res.status(400).json({ error: 'Type must be "expense" or "income"' });
        }

        const { data, error } = await supabase
            .from('categories')
            .insert([{
                name,
                icon: icon || 'fas fa-folder',
                type,
                color: color || '#6B7280'
            }])
            .select();

        if (error) {
            console.error('[Categories API] Error creating category:', error);
            return res.status(500).json({ error: 'Failed to create category' });
        }

        console.log('[Categories API] Category created:', data[0]);
        res.status(201).json(data[0]);
        
    } catch (error) {
        console.error('[Categories API] Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
