const supabaseUrl = 'https://fhmrxmpyynrkldtydjjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZobXJ4bXB5eW5ya2xkdHlkampmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NTU2MzIsImV4cCI6MjA5NTMzMTYzMn0.phDUxh986QaXFM2mCRIbIwvg-ox4ab8Wy5n4LBuRb1s';
if (window.supabase && typeof window.supabase.createClient === 'function') {
  window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
} else {
  window.supabaseClient = null;
  console.warn('Supabase SDK is not available; board CRUD will use localStorage fallback.');
}
