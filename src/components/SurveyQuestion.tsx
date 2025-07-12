
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export interface Question {
  id: string;
  type: 'text' | 'email' | 'rating' | 'multiple-choice' | 'checkbox' | 'textarea';
  question: string;
  options?: string[];
  required?: boolean;
}

interface SurveyQuestionProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLast: boolean;
  questionNumber: number;
  totalQuestions: number;
}

const SurveyQuestion = ({
  question,
  value,
  onChange,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  isLast,
  questionNumber,
  totalQuestions
}: SurveyQuestionProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canGoNext) {
      onNext();
    }
  };

  const renderInput = () => {
    switch (question.type) {
      case 'text':
      case 'email':
        return (
          <Input
            type={question.type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu respuesta..."
            className="text-lg p-4 h-12 border-2 focus:border-tennis-green"
            autoFocus
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Escribe tu respuesta..."
            className="w-full min-h-[120px] p-4 text-lg border-2 rounded-md focus:border-tennis-green focus:outline-none resize-none"
            autoFocus
          />
        );

      case 'rating':
        return (
          <div className="flex justify-center space-x-3">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => onChange(rating)}
                className={`w-12 h-12 rounded-full text-lg font-semibold transition-all duration-200 ${
                  value === rating
                    ? 'bg-tennis-green text-white scale-110'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        );

      case 'multiple-choice':
        return (
          <RadioGroup value={value} onValueChange={onChange} className="space-y-3">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option} className="text-lg cursor-pointer flex-1">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <Checkbox
                  id={option}
                  checked={(value || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValues = value || [];
                    if (checked) {
                      onChange([...currentValues, option]);
                    } else {
                      onChange(currentValues.filter((v: string) => v !== option));
                    }
                  }}
                />
                <Label htmlFor={option} className="text-lg cursor-pointer flex-1">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-tennis-green/5 flex flex-col">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-1">
        <div
          className="h-1 bg-tennis-green transition-all duration-500"
          style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl animate-fade-in">
          {/* Question Number */}
          <div className="text-center mb-8">
            <span className="text-tennis-green font-semibold text-lg">
              {questionNumber} de {totalQuestions}
            </span>
          </div>

          {/* Question */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
              {question.question}
            </h2>
            {question.required && (
              <p className="text-gray-500 text-sm">* Campo obligatorio</p>
            )}
          </div>

          {/* Input */}
          <div className="mb-12">
            {renderInput()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              onClick={onPrevious}
              disabled={!canGoPrevious}
              variant="ghost"
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </Button>

            <Button
              onClick={onNext}
              disabled={!canGoNext}
              className="bg-tennis-green hover:bg-tennis-green/90 text-white px-8 py-3 flex items-center space-x-2"
            >
              <span>{isLast ? 'Finalizar' : 'Siguiente'}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyQuestion;
