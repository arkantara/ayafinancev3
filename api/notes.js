const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://jjieqhvfadoqkahpqdvl.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Get all notes for user
router.get('/', async (req, res) => {
    try {
        console.log('[Notes API] GET /notes called');
        
        // In real app, filter by user_id from JWT token
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[Notes API] Error fetching notes:', error);
            return res.status(500).json({ error: 'Failed to fetch notes' });
        }

        res.json(data || []);
        
    } catch (error) {
        console.error('[Notes API] Fetch notes error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single note by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('[Notes API] GET /notes/:id called for ID:', id);
        
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('[Notes API] Error fetching note:', error);
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json(data);
        
    } catch (error) {
        console.error('[Notes API] Fetch note error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new note
router.post('/', async (req, res) => {
    try {
        console.log('[Notes API] POST /notes called with:', req.body);
        
        const { title, category, type, content } = req.body;
        
        if (!title || !category || !type || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const noteData = {
            title,
            category,
            type,
            content,
            user_id: 1, // In real app, get from JWT token
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('notes')
            .insert([noteData])
            .select()
            .single();

        if (error) {
            console.error('[Notes API] Error creating note:', error);
            return res.status(500).json({ error: 'Failed to create note' });
        }

        res.status(201).json(data);
        
    } catch (error) {
        console.error('[Notes API] Create note error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update note
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('[Notes API] PUT /notes/:id called for ID:', id);
        
        const { title, category, type, content } = req.body;
        
        if (!title || !category || !type || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const updateData = {
            title,
            category,
            type,
            content,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('notes')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('[Notes API] Error updating note:', error);
            return res.status(500).json({ error: 'Failed to update note' });
        }

        res.json(data);
        
    } catch (error) {
        console.error('[Notes API] Update note error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete note
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('[Notes API] DELETE /notes/:id called for ID:', id);
        
        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('[Notes API] Error deleting note:', error);
            return res.status(500).json({ error: 'Failed to delete note' });
        }

        res.json({ success: true, message: 'Note deleted successfully' });
        
    } catch (error) {
        console.error('[Notes API] Delete note error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Search notes
router.get('/search/:query', async (req, res) => {
    try {
        const { query } = req.params;
        console.log('[Notes API] GET /notes/search called with query:', query);
        
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[Notes API] Error searching notes:', error);
            return res.status(500).json({ error: 'Failed to search notes' });
        }

        res.json(data || []);
        
    } catch (error) {
        console.error('[Notes API] Search notes error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get notes by category
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        console.log('[Notes API] GET /notes/category called for category:', category);
        
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('category', category)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[Notes API] Error fetching notes by category:', error);
            return res.status(500).json({ error: 'Failed to fetch notes by category' });
        }

        res.json(data || []);
        
    } catch (error) {
        console.error('[Notes API] Fetch notes by category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
