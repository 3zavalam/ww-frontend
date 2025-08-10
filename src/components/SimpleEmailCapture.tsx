import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Mail, Target, ArrowRight } from 'lucide-react';

interface SimpleEmailCaptureProps {
  onEmailSubmit: (email: string, strokeType: string, handedness: string, experience: string) => void;
  onLimitReached?: (daysUntilNext: number) => void;
  isLoading?: boolean;
}

const SimpleEmailCapture = ({ onEmailSubmit, isLoading = false }: SimpleEmailCaptureProps) => {
  const [email, setEmail] = useState('');
  const [strokeType, setStrokeType] = useState('');
  const [handedness, setHandedness] = useState('');
  const [experience, setExperience] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsEmailValid(validateEmail(newEmail));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEmailValid && strokeType && handedness && experience && !isLoading) {
      onEmailSubmit(email, strokeType, handedness, experience);
    }
  };

  const strokeOptions = [
    { value: 'forehand', label: 'Forehand', icon: '🎾' },
    { value: 'backhand', label: 'Backhand', icon: '🎾' },
    { value: 'serve', label: 'Serve', icon: '🎾' }
  ];

  const handednessOptions = [
    { value: 'right', label: 'Right-handed', icon: '👉' },
    { value: 'left', label: 'Left-handed', icon: '👈' }
  ];

  const experienceOptions = [
    { value: 'beginner', label: 'Less than 2 years', icon: '' },
    { value: 'intermediate', label: '2-5 years', icon: '' },
    { value: 'advanced', label: '6+ years', icon: '' }
  ];

  const canSubmit = isEmailValid && strokeType && handedness && experience && !isLoading;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          AI Tennis Coach
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Upload your tennis stroke video and get instant AI-powered analysis with personalized feedback and drills
        </p>
      </div>

      <Card className="border-2">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Target className="w-6 h-6 text-blue-600" />
            Get Started
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <Label className="text-base font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="your.email@example.com"
                className="text-base p-3"
                disabled={isLoading}
                required
              />
              {email && !isEmailValid && (
                <p className="text-sm text-red-600">Please enter a valid email address</p>
              )}
            </div>

            {/* Stroke Type Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Which stroke do you want to analyze?</Label>
              <RadioGroup
                value={strokeType}
                onValueChange={setStrokeType}
                disabled={isLoading}
                className="grid grid-cols-1 md:grid-cols-3 gap-3"
              >
                {strokeOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label 
                      htmlFor={option.value} 
                      className="flex items-center gap-2 cursor-pointer text-base p-2 rounded hover:bg-gray-50 flex-1"
                    >
                      <span className="text-lg">{option.icon}</span>
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Handedness Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Which hand do you play with?</Label>
              <RadioGroup
                value={handedness}
                onValueChange={setHandedness}
                disabled={isLoading}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                {handednessOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label 
                      htmlFor={option.value}
                      className="flex items-center gap-2 cursor-pointer text-base p-2 rounded hover:bg-gray-50 flex-1"
                    >
                      <span className="text-lg">{option.icon}</span>
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Experience Level Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Experience playing tennis</Label>
              <RadioGroup
                value={experience}
                onValueChange={setExperience}
                disabled={isLoading}
                className="grid grid-cols-3 gap-3"
              >
                {experienceOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label 
                      htmlFor={option.value}
                      className="cursor-pointer text-base"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-3 text-base font-semibold transition-all ${
                canSubmit
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                'Processing...'
              ) : (
                <>
                  Continue to Video Upload
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-500 space-y-2">
            <p>• Your video will be analyzed with AI pose detection</p>
            <p>• Get personalized feedback and improvement drills</p>
            <p>• Compare your technique to professional players</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleEmailCapture;