import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, AlertCircle, CheckCircle, Award, Zap, Video, Play, ChevronDown } from 'lucide-react';
import { saveAnalysisData } from '@/lib/analytics';
import { getBackendUrl } from '@/lib/backendDetection';

interface AnalysisResultsProps {
  videoFile: File;
  userEmail: string;
  strokeType: string;
  analysisData: any;
  sessionId?: string;
  handedness?: string;
  experience?: string;
}

const AnalysisResults = ({ videoFile, userEmail, strokeType, analysisData, sessionId: propSessionId, handedness, experience }: AnalysisResultsProps) => {
  // Debug video URL only if missing
  if (!analysisData?.video_url) {
    console.log('⚠️ Missing video_url in analysisData');
  }
  
  // Referencias para sincronizar videos
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const referenceVideoRef = useRef<HTMLVideoElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  
  const strokeLabels: { [key: string]: string } = {
    forehand: 'Forehand',
    backhand: 'Backhand', 
    serve: 'Serve',
    volley: 'Volley'
  };

  // Procesar datos del backend
  const processAnalysisData = () => {
    if (!analysisData) {
      return {
        overallScore: 0,
        feedback: [],
        drills: [],
        keyframes: {},
        video_url: '',
        reference_url: ''
      };
    }

    // Get backend URL for completing relative URLs
    const [backendUrl, setBackendUrl] = useState<string>('');
    
    // Initialize backend URL
    useEffect(() => {
      getBackendUrl().then(setBackendUrl);
    }, []);

    // Helper function to make URLs absolute if they're relative
    const makeAbsoluteUrl = (url: string) => {
      if (!url || !backendUrl) return '';
      if (url.startsWith('http')) return url; // Already absolute
      if (url.startsWith('/')) return `${backendUrl}${url}`; // Relative to backend
      return url;
    };

    // Asegurar que feedback sea siempre un array
    let feedback = analysisData.feedback || [];
    if (typeof feedback === 'string') {
      feedback = [feedback];
    }
    if (!Array.isArray(feedback)) {
      feedback = [];
    }

    // Asegurar que drills sea siempre un array
    let drills = analysisData.drills || [];
    if (!Array.isArray(drills)) {
      drills = [];
    }

    // Process keyframes to make URLs absolute
    const keyframes: { [key: string]: string } = {};
    const rawKeyframes = analysisData.keyframes || {};
    for (const [phase, url] of Object.entries(rawKeyframes)) {
      keyframes[phase] = makeAbsoluteUrl(url as string);
    }

    return {
      overallScore: analysisData.swing_score || 0,
      feedback,
      drills,
      keyframes,
      video_url: makeAbsoluteUrl(analysisData.video_url || ''),
      reference_url: makeAbsoluteUrl(analysisData.reference_url || '')
    };
  };

  const results = processAnalysisData();

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600 bg-green-50";
    if (score >= 6) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 8) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (score >= 6) return <TrendingUp className="w-4 h-4 text-yellow-600" />;
    return <AlertCircle className="w-4 h-4 text-red-600" />;
  };

  const getScorePercentage = (score: number) => {
    return Math.round((score / 10) * 100);
  };

  // Removed level classification - just showing percentage

  // Sincronizar reproducción de videos
  const syncVideoPlay = (sourceVideo: HTMLVideoElement, targetVideo: HTMLVideoElement | null) => {
    if (targetVideo) {
      targetVideo.currentTime = sourceVideo.currentTime;
      targetVideo.play();
    }
  };

  const syncVideoPause = (targetVideo: HTMLVideoElement | null) => {
    if (targetVideo) {
      targetVideo.pause();
    }
  };

  // Manejar scroll para ocultar indicador
  const handleScroll = () => {
    if (window.scrollY > 100) {
      setShowScrollIndicator(false);
    }
  };

  // Usar el sessionId pasado como prop o generar uno nuevo
  const [sessionId] = useState(() => propSessionId || crypto.randomUUID());

  // Guardar datos en Supabase cuando se muestra el análisis - solo una vez
  useEffect(() => {
    const saveToDatabase = async () => {
      try {
        const analysisToSave = {
          email: userEmail,
          stroke_type: strokeType,
          handedness: handedness,
          experience: experience,
          ai_analysis: JSON.stringify(results.feedback),
          ai_drills: JSON.stringify(results.drills),
          swing_score: results.overallScore,
          session_id: sessionId
        };

        await saveAnalysisData(analysisToSave);
      } catch (error) {
        console.error('❌ Error saving analysis data:', error);
      }
    };

    // Solo guardar una vez cuando tenemos analysisData válido
    if (userEmail && analysisData && (analysisData.feedback || analysisData.drills)) {
      saveToDatabase();
    }
  }, [analysisData]); // Solo depende de analysisData, no de results que cambia

  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Expert Badge */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Award className="w-5 h-5" />
            <span className="font-semibold">AI + Computer Vision Analysis</span>
          </div>
          <p className="text-sm opacity-90">Advanced biomechanical analysis technology • Professional comparison</p>
        </CardContent>
      </Card>

      {/* Header */}
      <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Target className="w-6 h-6 text-tennis-green" />
            Complete Analysis - {strokeLabels[strokeType]}
          </CardTitle>
          <p className="text-gray-600">Video: {videoFile.name} • Player: {userEmail}</p>
        </CardHeader>
      </Card>

      {/* Overall Score */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-tennis-green to-green-600 text-white">
        <CardContent className="p-6 text-center">
          <div className="text-4xl font-bold mb-2">{getScorePercentage(results.overallScore)}%</div>
          <p className="text-lg opacity-90">Overall Technical Score</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Zap className="w-4 h-4" />
            <span className="text-sm opacity-80">Technique Match</span>
          </div>
        </CardContent>
      </Card>

      {/* Videos Section Lado a Lado */}
      <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Video className="w-6 h-6 text-tennis-green" />
            Video Comparison
          </CardTitle>
          <p className="text-gray-600">Your technique vs. Professional technique</p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* User Video */}
            <div>
              <div className="mb-3 text-center">
                <Badge className="bg-tennis-green text-white mb-2">Your Video</Badge>
                <p className="text-sm text-gray-600">With pose analysis</p>
              </div>
              {results.video_url ? (
                <video 
                  ref={userVideoRef}
                  controls 
                  className="w-full rounded-lg"
                  onPlay={() => syncVideoPlay(userVideoRef.current!, referenceVideoRef.current)}
                  onPause={() => syncVideoPause(referenceVideoRef.current)}
                >
                  <source src={results.video_url} type="video/mp4" />
                  Your browser does not support videos.
                </video>
              ) : (
                <div className="bg-gray-100 rounded-lg p-6 text-center aspect-video flex items-center justify-center">
                  <div>
                    <Play className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">Video processing...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Reference Video */}
            <div>
              <div className="mb-3 text-center">
                <Badge className="bg-yellow-600 text-white mb-2">Professional Video</Badge>
                <p className="text-sm text-gray-600">Reference technique</p>
              </div>
              {results.reference_url ? (
                <video 
                  ref={referenceVideoRef}
                  controls 
                  className="w-full rounded-lg"
                  onPlay={() => syncVideoPlay(referenceVideoRef.current!, userVideoRef.current)}
                  onPause={() => syncVideoPause(userVideoRef.current)}
                >
                  <source src={results.reference_url} type="video/mp4" />
                  Your browser does not support videos.
                </video>
              ) : (
                <div className="bg-gray-100 rounded-lg p-6 text-center aspect-video flex items-center justify-center">
                  <div>
                    <Award className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">Reference video not available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              💡 <strong>Tip:</strong> Videos sync automatically for better comparison
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Scroll Indicator */}
      {showScrollIndicator && (
        <div className="fixed bottom-8 right-8 z-50 animate-bounce">
          <div className="bg-tennis-green text-white p-3 rounded-full shadow-lg">
            <ChevronDown className="w-6 h-6" />
          </div>
          <p className="text-xs text-center mt-2 text-gray-600 font-medium">
            Scroll to<br/>see more
          </p>
        </div>
      )}

      {/* AI Feedback Analysis */}
      {results.feedback.length > 0 && (
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              Detailed Technical Analysis - {strokeLabels[strokeType]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.feedback.map((feedbackItem: any, index: number) => {
              // Asegurar que el feedback es una string
              const feedbackText = typeof feedbackItem === 'string' ? 
                feedbackItem : 
                (feedbackItem?.text || feedbackItem?.feedback || JSON.stringify(feedbackItem));
              
              return (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-tennis-green mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">{feedbackText}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Drills & Exercises */}
      {results.drills.length > 0 && (
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-tennis-green flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recommended Improvement Exercises
            </CardTitle>
            <p className="text-gray-600 text-sm mt-2">
              Specific exercises based on your technical analysis
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {results.drills.map((drill: any, index: number) => {
                
                // Manejar diferentes formatos de drill (string u objeto)
                let drillTitle = `Ejercicio ${index + 1}`;
                let drillContent = '';
                let drillClipUrl = null;

                if (typeof drill === 'string') {
                  // Si es string simple
                  drillContent = drill;
                } else if (typeof drill === 'object' && drill !== null) {
                  // Estructura específica de OpenAI: {title, drill, steps}
                  drillTitle = drill.title || `Ejercicio ${index + 1}`;
                  
                  let content = '';
                  if (drill.drill) {
                    content += `${drill.drill}\n\n`;
                  }
                  
                  if (drill.steps && Array.isArray(drill.steps)) {
                    content += "Pasos a seguir:\n";
                    drill.steps.forEach((step, stepIndex) => {
                      content += `${stepIndex + 1}. ${step}\n`;
                    });
                  } else if (drill.steps && typeof drill.steps === 'string') {
                    content += `Instrucciones: ${drill.steps}`;
                  }
                  
                  drillContent = content || drill.instructions || drill.description || JSON.stringify(drill, null, 2);
                  drillClipUrl = drill.clip_url || drill.video_url || drill.video;
                }

                return (
                  <div key={index} className="border-l-4 border-tennis-green bg-green-50 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-tennis-green text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-3 text-lg">{drillTitle}</h4>
                        
                        {/* Renderizar drill name/description */}
                        {drill.drill && (
                          <div className="mb-4">
                            <h5 className="font-semibold text-tennis-green mb-2">🎯 Exercise Description:</h5>
                            <div className="text-gray-700 bg-white p-4 rounded-lg border-l-4 border-tennis-green leading-relaxed">
                              {drill.drill.split('. ').map((sentence: string, sentIndex: number) => (
                                sentence.trim() && (
                                  <p key={sentIndex} className="mb-2">
                                    {sentence.trim()}{sentIndex < drill.drill.split('. ').length - 1 ? '.' : ''}
                                  </p>
                                )
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Renderizar steps si existen */}
                        {drill.steps && Array.isArray(drill.steps) && drill.steps.length > 0 && (
                          <div className="mb-4">
                            <h5 className="font-semibold text-tennis-green mb-3">📋 Step-by-Step Instructions:</h5>
                            <div className="space-y-3">
                              {drill.steps.map((step: string, stepIndex: number) => (
                                <div key={stepIndex} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                                  <span className="flex-shrink-0 w-7 h-7 bg-tennis-green text-white rounded-full flex items-center justify-center text-sm font-bold">
                                    {stepIndex + 1}
                                  </span>
                                  <div className="flex-1">
                                    <p className="text-gray-700 leading-relaxed">{step}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Fallback para otros tipos de contenido */}
                        {!drill.drill && !drill.steps && drillContent && (
                          <div className="text-gray-700 leading-relaxed">
                            {drillContent.split('\n').map((line: string, lineIndex: number) => (
                              line.trim() && (
                                <p key={lineIndex} className="mb-2">
                                  {line.trim()}
                                </p>
                              )
                            ))}
                          </div>
                        )}
                        
                        {drillClipUrl && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-600 mb-2">📹 Demonstration video:</p>
                            <video controls className="w-full max-w-md rounded-lg shadow-sm">
                              <source src={drillClipUrl} type="video/mp4" />
                              Your browser does not support videos.
                            </video>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="text-blue-600">💡</div>
                <div>
                  <h5 className="font-semibold text-blue-900 mb-1">Coach's Tip</h5>
                  <p className="text-blue-800 text-sm">
                    Practice these exercises 3-4 times per week, 15-20 minutes per session. 
                    Consistency is key to improving your {strokeLabels[strokeType].toLowerCase()} technique.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}


      {/* CTA for more analysis */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Want to improve faster?</h3>
          <p className="text-sm opacity-90 mb-4">Join our personalized coaching program</p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div>✅ Personalized videos</div>
            <div>✅ 1-on-1 sessions</div>
            <div>✅ Training plan</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisResults;