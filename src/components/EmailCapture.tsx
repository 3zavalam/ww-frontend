
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Mail, Target, Clock, Users, CheckCircle, Star, ArrowRight } from 'lucide-react';
// Always use local mode (no Supabase) for now
const isLocalDev = true;

interface EmailCaptureProps {
  onEmailSubmit: (email: string, strokeType: string, handedness: string, experience: string) => void;
  onLimitReached: (daysUntilNext: number) => void;
  isLoading?: boolean;
}

const EmailCapture = ({ onEmailSubmit, onLimitReached, isLoading = false }: EmailCaptureProps) => {
  const [email, setEmail] = useState('');
  const [strokeType, setStrokeType] = useState('');
  const [handedness, setHandedness] = useState('');
  const [experience, setExperience] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [limitsData, setLimitsData] = useState<UserLimitCheck | null>(null);
  const [isCheckingLimits, setIsCheckingLimits] = useState(false);
  const [globalCounts, setGlobalCounts] = useState<{ totalAnalyses: number, remainingFreeAnalyses: number } | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsEmailValid(validateEmail(newEmail));
  };

  // Get global counts on component mount
  useEffect(() => {
    // Skip Supabase calls in local development
    if (isLocalDev) {
      setGlobalCounts({ totalAnalyses: 0, remainingFreeAnalyses: 100 });
      return;
    }
    
    const getGlobalCounts = async () => {
      try {
        const { getTotalAnalysesCount } = await import('@/lib/limits');
        const counts = await getTotalAnalysesCount();
        setGlobalCounts(counts);
      } catch (error) {
        console.error('Error getting global counts:', error);
      }
    };
    
    getGlobalCounts();
  }, []);

  // Verificar límites cuando el email es válido
  useEffect(() => {
    // Skip limits check for local development
    if (isLocalDev) {
      setLimitsData({ canAnalyze: true, totalAnalyses: 0, remainingFreeAnalyses: 100 });
      return;
    }
    
    const checkLimits = async () => {
      if (isEmailValid && email) {
        setIsCheckingLimits(true);
        try {
          const { checkUserLimits } = await import('@/lib/limits');
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
    // Skip limits check for local development
    if (isLocalDev) {
      if (isEmailValid && strokeType && handedness && experience) {
        onEmailSubmit(email, strokeType, handedness, experience);
      }
    } else {
      if (isEmailValid && strokeType && handedness && experience && limitsData) {
        if (!limitsData.canAnalyze && limitsData.daysUntilNext) {
          onLimitReached(limitsData.daysUntilNext);
        } else {
          onEmailSubmit(email, strokeType, handedness, experience);
        }
      }
    }
  };

  const isFormValid = isEmailValid && strokeType && handedness && experience;

  return (
    <div className="space-y-3">
      {/* Scarcity Bar - More compact */}
      <div className="bg-black text-white rounded-lg p-2 text-center border border-green-500/20">
        <div className="text-sm font-bold">🎾 COMMUNITY FREE ANALYSES</div>
        <div className="w-full bg-gray-800 rounded-full h-1.5 my-1">
          <div 
            className="bg-green-500 h-1.5 rounded-full transition-all duration-300" 
            style={{ 
              width: `${globalCounts ? Math.min((globalCounts.totalAnalyses / 1000) * 100, 100) : 0}%` 
            }}
          ></div>
        </div>
        <div className="text-xs opacity-90">
          {globalCounts 
            ? `Only ${globalCounts.remainingFreeAnalyses} out of 100 free analyses left for the community`
            : 'Loading community availability...'
          }
        </div>
      </div>

      {/* Hero Section - More compact */}
      <div className="text-center space-y-2">
        <div className="space-y-2">
        </div>

        {/* Process Icons - Main focus, larger, futuristic */}
        <div className="flex justify-center items-center gap-8 py-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center border-2 border-green-500/30 shadow-lg shadow-green-500/20">
              <Target className="w-8 h-8 text-green-500" />
            </div>
            <span className="text-lg font-semibold text-gray-800">Upload</span>
          </div>
          <ArrowRight className="w-6 h-6 text-green-500" />
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center border-2 border-green-500/30 shadow-lg shadow-green-500/20">
              <Clock className="w-8 h-8 text-green-500" />
            </div>
            <span className="text-lg font-semibold text-gray-800">AI analyzes</span>
          </div>
          <ArrowRight className="w-6 h-6 text-green-500" />
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center border-2 border-green-500/30 shadow-lg shadow-green-500/20">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <span className="text-lg font-semibold text-gray-800">Plan</span>
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
                <Label className="text-base font-semibold text-gray-700 mb-2 block">
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
                <Label className="text-base font-semibold text-gray-700 mb-2 block">
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
                <Label className="text-base font-semibold text-gray-700 mb-2 block">
                  Experience playing tennis *
                </Label>
                <RadioGroup value={experience} onValueChange={setExperience}>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="beginner" id="beginner" />
                      <Label htmlFor="beginner" className="cursor-pointer flex-1 text-sm">
                        0-2 years
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="intermediate" id="intermediate" />
                      <Label htmlFor="intermediate" className="cursor-pointer flex-1 text-sm">
                        2-5 years
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="advanced" id="advanced" />
                      <Label htmlFor="advanced" className="cursor-pointer flex-1 text-sm">
                        5+ years
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
                    className="w-full h-10 bg-black hover:bg-gray-900 text-white font-bold text-sm transition-all duration-200 transform hover:scale-105 shadow-lg border border-green-500/30 hover:border-green-500/50"
                  >
                    {isLoading ? 'Processing...' : isCheckingLimits ? 'Checking availability...' : 'Start free analysis 🎾'}
                  </Button>
                )}

                {/* Social Proof - More compact */}
                <div className="flex items-center justify-center gap-3 text-xs text-gray-600 font-medium">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>+100 analyses</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>95% accuracy</span>
                  </div>
                </div>

              </div>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default EmailCapture;
