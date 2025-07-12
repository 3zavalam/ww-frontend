
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Mail, Target, Clock, Users, CheckCircle, Star, ArrowRight } from 'lucide-react';
import { checkUserLimits, calculateProgressPercentage, UserLimitCheck } from '@/lib/limits';

interface EmailCaptureProps {
  onEmailSubmit: (email: string, strokeType: string, handedness: string) => void;
  onLimitReached: (daysUntilNext: number) => void;
  isLoading?: boolean;
}

const EmailCapture = ({ onEmailSubmit, onLimitReached, isLoading = false }: EmailCaptureProps) => {
  const [email, setEmail] = useState('');
  const [strokeType, setStrokeType] = useState('');
  const [handedness, setHandedness] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [limitsData, setLimitsData] = useState<UserLimitCheck | null>(null);
  const [isCheckingLimits, setIsCheckingLimits] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsEmailValid(validateEmail(newEmail));
  };

  // Verificar límites cuando el email es válido
  useEffect(() => {
    const checkLimits = async () => {
      if (isEmailValid && email) {
        setIsCheckingLimits(true);
        try {
          const limits = await checkUserLimits(email);
          setLimitsData(limits);
        } catch (error) {
          console.error('Error checking limits:', error);
        } finally {
          setIsCheckingLimits(false);
        }
      } else {
        setLimitsData(null);
      }
    };

    checkLimits();
  }, [isEmailValid, email]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmailValid && strokeType && handedness && limitsData) {
      if (!limitsData.canAnalyze && limitsData.daysUntilNext) {
        onLimitReached(limitsData.daysUntilNext);
      } else {
        onEmailSubmit(email, strokeType, handedness);
      }
    }
  };

  const isFormValid = isEmailValid && strokeType && handedness;

  return (
    <div className="space-y-3">
      {/* Scarcity Bar - More compact */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-2 text-center">
        <div className="text-sm font-bold">🎾 LIMITED FREE ANALYSIS</div>
        <div className="w-full bg-orange-700 rounded-full h-1.5 my-1">
          <div 
            className="bg-white h-1.5 rounded-full transition-all duration-300" 
            style={{ 
              width: `${limitsData ? calculateProgressPercentage(limitsData.totalAnalyses) : 0}%` 
            }}
          ></div>
        </div>
        <div className="text-xs opacity-90">
          {limitsData 
            ? `Only ${limitsData.remainingFreeAnalyses} out of 100 free analyses remaining`
            : 'Loading availability...'
          }
        </div>
      </div>

      {/* Hero Section - More compact */}
      <div className="text-center space-y-2">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
            Professional feedback in <span className="text-tennis-green">30 seconds</span>
          </h1>
        </div>

        {/* Process Icons - More compact */}
        <div className="flex justify-center items-center gap-4 py-2">
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 bg-tennis-green rounded-full flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-medium">Upload</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 bg-tennis-green rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-medium">AI analyzes</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 bg-tennis-green rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-medium">Plan</span>
          </div>
        </div>

        {/* Main Form Card - More compact */}
        <Card className="w-full max-w-lg mx-auto shadow-2xl border-0 bg-white">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg font-bold text-gray-900">Start for free!</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Which stroke do you want to improve? *
                </Label>
                <RadioGroup value={strokeType} onValueChange={setStrokeType}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="forehand" id="forehand" />
                      <Label htmlFor="forehand" className="cursor-pointer flex-1 text-sm">
                        Forehand
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="backhand" id="backhand" />
                      <Label htmlFor="backhand" className="cursor-pointer flex-1 text-sm">
                        Backhand
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="serve" id="serve" />
                      <Label htmlFor="serve" className="cursor-pointer flex-1 text-sm">
                        Serve
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="volley" id="volley" />
                      <Label htmlFor="volley" className="cursor-pointer flex-1 text-sm">
                        Volley
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Which is your dominant hand? *
                </Label>
                <RadioGroup value={handedness} onValueChange={setHandedness}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="right" id="right" />
                      <Label htmlFor="right" className="cursor-pointer flex-1 text-sm">
                        Right-handed 🤚
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="left" id="left" />
                      <Label htmlFor="left" className="cursor-pointer flex-1 text-sm">
                        Left-handed ✋
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  className="h-9 text-center border-2 border-gray-200 focus:border-[#2E7D32] transition-all duration-200"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                {limitsData && !limitsData.canAnalyze && limitsData.daysUntilNext ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                    <p className="text-orange-700 font-semibold text-sm">
                      ⏰ You can get your next free analysis in {limitsData.daysUntilNext} {limitsData.daysUntilNext === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                ) : (
                  <Button
                    type="submit"
                    disabled={!isFormValid || isLoading || isCheckingLimits}
                    className="w-full h-10 bg-[#2E7D32] hover:bg-[#2E7D32]/90 text-white font-bold text-sm transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    {isLoading ? 'Processing...' : isCheckingLimits ? 'Checking availability...' : 'Start free analysis 🎾'}
                  </Button>
                )}

                {/* Social Proof - More compact */}
                <div className="flex items-center justify-center gap-3 text-xs text-green-600 font-medium">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>+100 analyses</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>95% accuracy</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>30 seconds</span>
                  </div>
                </div>

                {/* Security Copy */}
                <p className="text-xs text-gray-500 text-center">
                  No credit card • Cancel anytime • 100% secure
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Testimonials - More compact and horizontal */}
        <div className="bg-white rounded-lg p-3 shadow-lg max-w-4xl mx-auto">
          <h3 className="text-sm font-bold text-center mb-2">Testimonials</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm">
                👩
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-1">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-xs italic">"My serve improved 40% accuracy in just 4 weeks."</p>
                <p className="text-xs text-gray-600 mt-1">- Maria Gonzalez</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm">
                👨
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-1">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-xs italic">"I improved my forehand with the recommended drills."</p>
                <p className="text-xs text-gray-600 mt-1">- John Malone</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailCapture;
