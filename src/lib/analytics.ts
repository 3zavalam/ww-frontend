import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export interface AnalysisData {
  email: string
  stroke_type?: string
  handedness?: string
  ai_analysis?: string
  ai_drills?: string
  swing_score?: number
  feedback_rating?: number
  feedback_helpful?: boolean
  feedback_comments?: string
  would_recommend?: boolean
  improvement_areas?: string
  session_id?: string
}

export async function saveAnalysisData(data: AnalysisData) {
  try {
    console.log('🔍 Attempting to save analysis data:', data)
    
    // Verificar si ya existe un registro con este session_id
    if (data.session_id) {
      const { data: existing } = await supabase
        .from('user_analysis_data')
        .select('id')
        .eq('session_id', data.session_id)
        .eq('email', data.email)
        .single()

      if (existing) {
        console.log('⚠️ Record already exists for this session, skipping insert')
        return existing
      }
    }
    
    const { data: result, error } = await supabase
      .from('user_analysis_data')
      .insert({
        ...data,
        created_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('❌ Supabase error:', error)
      throw error
    }
    
    console.log('✅ Successfully saved to Supabase:', result)
    return result
  } catch (error) {
    console.error('❌ Failed to save analysis data:', error)
    throw error
  }
}

export async function saveFeedback(feedback: {
  email: string
  rating?: number
  helpful?: boolean
  comments?: string
  recommend?: boolean
  stroke_type?: string
  session_id?: string
}) {
  try {
    console.log('🔍 Attempting to save feedback:', feedback)
    
    // Si tenemos session_id, intentar actualizar el registro existente
    if (feedback.session_id) {
      const { data: updateResult, error: updateError } = await supabase
        .from('user_analysis_data')
        .update({
          feedback_rating: feedback.rating,
          feedback_helpful: feedback.helpful,
          feedback_comments: feedback.comments,
          would_recommend: feedback.recommend,
        })
        .eq('session_id', feedback.session_id)
        .eq('email', feedback.email)
        .select()

      if (updateError) {
        console.error('❌ Error updating existing record:', updateError)
        throw updateError
      }

      if (updateResult && updateResult.length > 0) {
        console.log('✅ Successfully updated feedback in existing record:', updateResult)
        return updateResult
      }
    }
    
    // Si no se pudo actualizar, crear un nuevo registro
    const { data: result, error } = await supabase
      .from('user_analysis_data')
      .insert({
        email: feedback.email,
        stroke_type: feedback.stroke_type || 'unknown',
        feedback_rating: feedback.rating,
        feedback_helpful: feedback.helpful,
        feedback_comments: feedback.comments,
        would_recommend: feedback.recommend,
        session_id: feedback.session_id || crypto.randomUUID(),
        created_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('❌ Supabase error saving feedback:', error)
      throw error
    }
    
    console.log('✅ Successfully saved feedback to Supabase:', result)
    return result
  } catch (error) {
    console.error('❌ Failed to save feedback:', error)
    throw error
  }
}