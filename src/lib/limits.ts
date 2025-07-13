import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Only create Supabase client if env vars are provided
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export interface UserLimitCheck {
  canAnalyze: boolean
  daysUntilNext?: number
  totalAnalyses: number
  remainingFreeAnalyses: number
}

export async function checkUserLimits(email: string): Promise<UserLimitCheck> {
  try {
    console.log('🔍 Checking limits for:', email)
    
    // If Supabase is not configured, return default values
    if (!supabase) {
      console.warn('Supabase not configured - using default limits')
      return {
        canAnalyze: true,
        totalAnalyses: 0,
        remainingFreeAnalyses: 100
      }
    }
    
    // Obtener el análisis más reciente del usuario
    const { data: recentAnalysis, error: recentError } = await supabase
      .from('user_analysis_data')
      .select('created_at')
      .eq('email', email)
      .not('ai_analysis', 'is', null) // Solo contar análisis completados
      .order('created_at', { ascending: false })
      .limit(1)

    if (recentError) {
      console.error('Error checking recent analysis:', recentError)
    }

    // Calcular si puede hacer análisis (una semana desde el último)
    let canAnalyze = true
    let daysUntilNext: number | undefined

    if (recentAnalysis && recentAnalysis.length > 0) {
      const lastAnalysisDate = new Date(recentAnalysis[0].created_at)
      const now = new Date()
      const daysSinceLastAnalysis = Math.floor((now.getTime() - lastAnalysisDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysSinceLastAnalysis < 7) {
        canAnalyze = false
        daysUntilNext = 7 - daysSinceLastAnalysis
      }
    }

    // Contar total de análisis completados
    const { count: totalAnalyses, error: countError } = await supabase
      .from('user_analysis_data')
      .select('*', { count: 'exact', head: true })
      .not('ai_analysis', 'is', null)

    if (countError) {
      console.error('Error counting total analyses:', countError)
    }

    const total = totalAnalyses || 0
    const maxFreeAnalyses = 100
    const remaining = Math.max(0, maxFreeAnalyses - total)

    return {
      canAnalyze,
      daysUntilNext,
      totalAnalyses: total,
      remainingFreeAnalyses: remaining
    }
  } catch (error) {
    console.error('Failed to check user limits:', error)
    // En caso de error, permitir el análisis
    return {
      canAnalyze: true,
      totalAnalyses: 0,
      remainingFreeAnalyses: 100
    }
  }
}

export function calculateProgressPercentage(totalAnalyses: number, maxFree: number = 100): number {
  return Math.min(100, Math.round((totalAnalyses / maxFree) * 100))
}