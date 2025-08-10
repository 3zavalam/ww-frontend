
import React, { useState } from 'react';
import SurveyQuestion, { Question } from './SurveyQuestion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, BarChart3 } from 'lucide-react';
import { saveFeedback } from '@/lib/analytics';

interface TypeformSurveyProps {
  userEmail: string;
  onBackToAnalysis?: () => void;
  strokeType?: string;
  sessionId?: string;
}

const TypeformSurvey = ({ userEmail, onBackToAnalysis, strokeType, sessionId }: TypeformSurveyProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const questions: Question[] = [
    {
      id: 'satisfaction',
      type: 'rating',
      question: 'How satisfied are you with the analysis of your tennis technique?',
      required: true
    },
    {
      id: 'most_helpful',
      type: 'multiple-choice',
      question: 'Which aspect of the analysis was most helpful to you?',
      options: [
        'Stroke technique analysis',
        'Positioning and movement',
        'Improvement suggestions',
        'Video with annotations',
        'Comparison with professionals'
      ],
      required: true
    },
    {
      id: 'experience_level',
      type: 'multiple-choice',
      question: 'What is your current tennis level?',
      options: [
        'Beginner (less than 1 year)',
        'Intermediate (1-3 years)',
        'Advanced (3-5 years)',
        'Expert (more than 5 years)',
        'Competitive/Professional'
      ],
      required: true
    },
    {
      id: 'improvements',
      type: 'checkbox',
      question: 'What features would you like us to add?',
      options: [
        'Real-time analysis',
        'Comparison with other players',
        'Personalized exercises',
        'Progress tracking',
        'Full match analysis',
        'Mental training tips'
      ]
    },
    {
      id: 'recommendation',
      type: 'rating',
      question: 'How likely are you to recommend our platform?',
      required: true
    },
    {
      id: 'feedback',
      type: 'textarea',
      question: 'Is there anything else you would like to tell us?',
      required: false
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const canGoNext = () => {
    const answer = answers[currentQuestion.id];
    if (currentQuestion.required) {
      if (currentQuestion.type === 'checkbox') {
        return answer && answer.length > 0;
      }
      return answer !== undefined && answer !== null && answer !== '';
    }
    return true;
  };

  const canGoPrevious = () => {
    return currentQuestionIndex > 0;
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      // Submit survey
      
      try {
        // Guardar respuestas en Supabase
        await saveFeedback({
          email: userEmail,
          rating: answers.satisfaction,
          helpful: answers.most_helpful ? true : undefined,
          comments: answers.feedback || `Most helpful: ${answers.most_helpful}, Level: ${answers.experience_level}, Improvements: ${answers.improvements?.join(', ') || 'None'}`,
          recommend: answers.recommendation >= 4 ? true : answers.recommendation <= 3 ? false : undefined,
          stroke_type: strokeType || 'unknown',
          session_id: sessionId
        });
        
      } catch (error) {
        console.error('❌ Error saving survey responses:', error);
      }
      
      setIsCompleted(true);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious()) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAnswerChange = (value: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-tennis-green/5 flex items-center justify-center p-6">
        <Card className="w-full max-w-lg mx-auto shadow-lg border-0 bg-gradient-to-r from-green-50 to-tennis-green/10 animate-fade-in">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-20 h-20 mx-auto text-green-600 mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Thank you for your feedback!</h3>
            <p className="text-gray-600 mb-6">
              Your responses help us improve our tennis analysis platform.
            </p>
            
            <div className="bg-white/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">
                We'll send updates about new features to {userEmail}
              </p>
            </div>

            {/* Opciones de navegación */}
            {onBackToAnalysis && (
              <div className="space-y-3">
                <Button 
                  onClick={onBackToAnalysis}
                  className="w-full bg-tennis-green hover:bg-tennis-green/90 text-white flex items-center justify-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Review my Technical Analysis
                </Button>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                💡 <strong>Tip:</strong> You can bookmark this page to review your analysis later
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SurveyQuestion
      question={currentQuestion}
      value={answers[currentQuestion.id]}
      onChange={handleAnswerChange}
      onNext={handleNext}
      onPrevious={handlePrevious}
      canGoNext={canGoNext()}
      canGoPrevious={canGoPrevious()}
      isLast={isLastQuestion}
      questionNumber={currentQuestionIndex + 1}
      totalQuestions={questions.length}
    />
  );
};

export default TypeformSurvey;
