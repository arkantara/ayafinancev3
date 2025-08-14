// Configuration for Supabase
// Gunakan environment variables dari Railway atau fallback ke development keys

const config = {
    supabase: {
        url: window.SUPABASE_URL || process.env.SUPABASE_URL || 'https://hhqhzryyfkmxbqkxqnif.supabase.co',
        key: window.SUPABASE_KEY || process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhocWh6cnl5ZmtteGJxa3hxbmlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1MjM2MjQsImV4cCI6MjA0ODA5OTYyNH0.UPEFj6_dPOFMBD5JlzPQ_PiSy4q9KkI5oBm5Cp8Eez0'
    }
};

// Function to initialize Supabase client
function createSupabaseClient() {
    if (typeof supabase === 'undefined') {
        console.error('Supabase library not loaded');
        return null;
    }
    
    return supabase.createClient(config.supabase.url, config.supabase.key);
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.createSupabaseClient = createSupabaseClient;
    window.supabaseConfig = config;
}
