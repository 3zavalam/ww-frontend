// Local backend analytics - stores data on Flask server instead of Supabase
// This replaces Supabase functionality when VITE_BACKEND_URL points to localhost

export interface AnalysisData {
  email: string
  stroke_type?: string
  handedness?: string
  experience?: string
  ai_analysis?: string
  ai_drills?: string
  swing_score?: number
  session_id?: string
}

export interface FeedbackData {
  email: string
  rating?: number
  helpful?: boolean
  comments?: string
  recommend?: boolean
  stroke_type?: string
  session_id?: string
  improvement_areas?: string
}

const getBackendUrl = () => {
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:5050'
}

export async function saveAnalysisData(data: AnalysisData) {
  try {
    const backendUrl = getBackendUrl()
    
    console.log('💾 Saving analysis data to local backend:', {
      email: data.email,
      stroke_type: data.stroke_type,
      experience: data.experience,
      session_id: data.session_id
    })

    const response = await fetch(`${backendUrl}/save-analysis-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        created_at: new Date().toISOString()
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ Analysis data saved successfully:', result)
    return result

  } catch (error) {
    console.error('❌ Failed to save analysis data to local backend:', error)
    // Don't throw error - let app continue even if logging fails
    return null
  }
}

export async function saveFeedback(feedback: FeedbackData) {
  try {
    const backendUrl = getBackendUrl()
    
    console.log('💾 Saving feedback to local backend:', {
      email: feedback.email,
      rating: feedback.rating,
      helpful: feedback.helpful,
      session_id: feedback.session_id
    })

    const response = await fetch(`${backendUrl}/save-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...feedback,
        created_at: new Date().toISOString()
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ Feedback saved successfully:', result)
    return result

  } catch (error) {
    console.error('❌ Failed to save feedback to local backend:', error)
    // Don't throw error - let app continue even if logging fails
    return null
  }
}

// Helper function to determine if we should use local storage
export const useLocalStorage = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || ''
  return backendUrl.includes('localhost') || import.meta.env.DEV
}