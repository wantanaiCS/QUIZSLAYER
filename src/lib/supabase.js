import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL || 'https://mock.supabase.co'
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-key'

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn('[Supabase] Missing VITE_SUPABASE_URL in .env - Running in Mock Mode')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
export const isMockMode = !import.meta.env.VITE_SUPABASE_URL

export default supabase
