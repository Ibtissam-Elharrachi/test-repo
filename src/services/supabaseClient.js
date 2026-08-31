import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(
  'https://ustctfjugugczvzdejiu.supabase.co',
  'sb_publishable_CmowiJ2qOgAaOde2lWQ4dQ_lUmKKmXr'
)
