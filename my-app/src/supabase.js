import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// 서브도메인에서 세계관 slug 감지
export function getWorldSlug() {
  const hostname = window.location.hostname
  // roylia.xxx.vercel.app → 'roylia'
  const parts = hostname.split('.')
  if (parts.length >= 3) return parts[0]
  // localhost 개발환경 → URL 파라미터로 지정 가능
  const params = new URLSearchParams(window.location.search)
  return params.get('world') || 'roylia'
}
