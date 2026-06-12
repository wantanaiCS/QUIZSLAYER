import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const hasUrl = !!supabaseUrl && supabaseUrl !== 'https://mock.supabase.co'
const hasKey = !!supabaseKey
  && supabaseKey !== 'mock-key'
  && !supabaseKey.startsWith('PASTE_YOUR')
  && !supabaseKey.startsWith('your-anon-key')

export const isMockMode = !hasUrl || !hasKey

if (isMockMode) {
  console.warn('[Supabase] Running in Mock Mode — ตรวจสอบ VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY ใน .env')
  if (!hasUrl) console.warn('  ❌ VITE_SUPABASE_URL ไม่ถูกกำหนด')
  if (!hasKey) console.warn('  ❌ VITE_SUPABASE_ANON_KEY ไม่ถูกกำหนด หรือยังเป็นค่า placeholder')
} else {
  console.info('[Supabase] Connected to:', supabaseUrl)
}

export const supabase = createClient(
  hasUrl ? supabaseUrl : 'https://mock.supabase.co',
  hasKey ? supabaseKey : 'mock-key'
)

export default supabase
