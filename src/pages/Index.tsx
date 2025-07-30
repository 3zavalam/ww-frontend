
import React, { useState } from 'react';
import EmailCapture from '@/components/EmailCapture';
import VideoUpload from '@/components/VideoUpload';
import VideoGuideSection from '@/components/VideoGuideSection';
import AnalysisResults from '@/components/AnalysisResults';
import TypeformSurvey from '@/components/TypeformSurvey';
import { LimitReached } from '@/components/LimitReached';

type AppStep = 'email' | 'guide' | 'upload' | 'analysis' | 'survey' | 'limit-reached';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('email');
  const [userEmail, setUserEmail] = useState('');
  const [strokeType, setStrokeType] = useState('');
  const [handedness, setHandedness] = useState('');
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [returnedFromSurvey, setReturnedFromSurvey] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [daysUntilNext, setDaysUntilNext] = useState(0);

  const handleEmailSubmit = (email: string, stroke: string, hand: string) => {
    setUserEmail(email);
    setStrokeType(stroke);
    setHandedness(hand);
    setCurrentStep('guide');
  };

  const handleSkipGuide = () => {
    setCurrentStep('upload');
  };

  const handleViewGuide = () => {
    setCurrentStep('guide');
  };

  const handleVideoUpload = (file: File, analysis?: any) => {
    setUploadedVideo(file);
    setAnalysisData(analysis);
    setCurrentStep('analysis');
  };

  const handleViewSurvey = () => {
    setCurrentStep('survey');
  };

  const handleLimitReached = (days: number) => {
    setDaysUntilNext(days);
    setCurrentStep('limit-reached');
  };

  const handleBackToEmail = () => {
    setCurrentStep('email');
  };

  const handleBackToAnalysis = () => {
    setCurrentStep('analysis');
    setReturnedFromSurvey(true);
    // Quitar el banner después de 5 segundos
    setTimeout(() => setReturnedFromSurvey(false), 5000);
  };

  // Si estamos en la encuesta, mostrar solo el componente de encuesta
  if (currentStep === 'survey') {
    return <TypeformSurvey 
      userEmail={userEmail} 
      onBackToAnalysis={handleBackToAnalysis}
      strokeType={strokeType}
      sessionId={sessionId}
    />;
  }

  // Si el límite fue alcanzado, mostrar componente de límite
  if (currentStep === 'limit-reached') {
    return <LimitReached 
      daysUntilNext={daysUntilNext}
      onGoBack={handleBackToEmail}
    />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - More compact */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center">
            <h1 className="text-xl font-bold text-gray-900">
              <span className="text-green-600">Winner</span> Way
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content - Reduced padding */}
      <main className="container mx-auto px-4 py-2">
        <div className="max-w-6xl mx-auto">
          {/* Simplified Progress Steps - Only show when not on email step */}
          {currentStep !== 'email' && (
            <div className="flex justify-center mb-4">
              <div className="flex items-center space-x-3">
                {['Email', 'Guide', 'Upload', 'Analysis', 'Survey'].map((step, index) => {
                  const stepKeys: AppStep[] = ['email', 'guide', 'upload', 'analysis', 'survey'];
                  const isActive = stepKeys[index] === currentStep;
                  const isPassed = stepKeys.indexOf(currentStep) > index;
                  
                  return (
                    <div key={step} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                          isActive
                            ? 'bg-black text-green-500 border border-green-500/30'
                            : isPassed
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className={`ml-1 text-xs font-medium ${
                        isActive ? 'text-green-600' : isPassed ? 'text-gray-600' : 'text-gray-500'
                      }`}>
                        {step}
                      </span>
                      {index < 4 && (
                        <div className={`w-6 h-0.5 mx-2 ${
                          isPassed ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step Content */}
          <div className="animate-fade-in">
            {currentStep === 'email' && (
              <EmailCapture 
                onEmailSubmit={handleEmailSubmit} 
                onLimitReached={handleLimitReached}
              />
            )}

            {currentStep === 'guide' && (
              <div className="space-y-6">
                <VideoGuideSection />
                <div className="text-center space-y-4">
                  <button
                    onClick={handleSkipGuide}
                    className="bg-black hover:bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 border border-green-500/30 hover:border-green-500/50"
                  >
                    I'm Ready to Upload! 🎾
                  </button>
                  <p className="text-sm text-gray-500">
                    Skip this guide if you already know how to record
                  </p>
                </div>
              </div>
            )}

            {currentStep === 'upload' && (
              <div className="space-y-6">
                <div className="text-center">
                  <button
                    onClick={handleViewGuide}
                    className="text-green-600 hover:text-green-700 text-sm underline mb-4"
                  >
                    📹 Need help recording? View guide
                  </button>
                </div>
                <VideoUpload onVideoUpload={handleVideoUpload} userEmail={userEmail} strokeType={strokeType} handedness={handedness} />
              </div>
            )}

            {currentStep === 'analysis' && uploadedVideo && (
              <div className="space-y-8">
                {/* Banner de bienvenida de vuelta */}
                {returnedFromSurvey && (
                  <div className="bg-black text-white p-4 rounded-lg shadow-lg animate-fade-in border border-green-500/30">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg">🎾</span>
                      <p className="font-semibold">Thanks for your feedback! Here's your analysis to review whenever you want.</p>
                    </div>
                  </div>
                )}
                
                {analysisData ? (
                  <AnalysisResults 
                    videoFile={uploadedVideo} 
                    userEmail={userEmail} 
                    strokeType={strokeType}
                    analysisData={analysisData}
                    sessionId={sessionId}
                    handedness={handedness}
                  />
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Processing analysis...</p>
                  </div>
                )}
                {analysisData && (
                  <div className="text-center space-y-4">
                    <button
                      onClick={handleViewSurvey}
                      className="bg-black hover:bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 border border-green-500/30 hover:border-green-500/50"
                    >
                      Complete Feedback Survey 📝
                    </button>
                    
                    <div className="text-sm text-gray-500">
                      <p>💡 Your analysis will be saved so you can review it after the survey</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer - More compact */}
      <footer className="bg-gray-900 text-white py-4 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Winner Way - Professional Tennis Analysis Platform
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
