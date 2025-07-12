import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, Zap, ArrowLeft } from 'lucide-react';

interface LimitReachedProps {
  daysUntilNext: number;
  onGoBack: () => void;
}

export function LimitReached({ daysUntilNext, onGoBack }: LimitReachedProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-lg mx-auto shadow-xl border-0 bg-white">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Analysis Limit Reached
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
            <div className="text-4xl font-bold text-orange-600 mb-2">
              {daysUntilNext}
            </div>
            <p className="text-orange-700 font-semibold">
              {daysUntilNext === 1 ? 'day' : 'days'} until your next free analysis
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              You've already received your free weekly analysis! Our AI-powered feedback 
              is designed to give you focused improvement areas to work on.
            </p>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-800">What to do while you wait:</span>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Practice the drills from your last analysis</li>
                <li>• Focus on the specific areas we identified</li>
                <li>• Record new videos to analyze next week</li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">Want unlimited analyses?</span>
              </div>
              <p className="text-sm text-green-700 mb-3">
                Upgrade to Pro for unlimited weekly analyses and personalized coaching
              </p>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                Upgrade to Pro 🎾
              </Button>
            </div>
          </div>

          <Button 
            onClick={onGoBack}
            variant="outline" 
            className="w-full flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>

          <p className="text-xs text-gray-500">
            Your next free analysis will be available in {daysUntilNext} {daysUntilNext === 1 ? 'day' : 'days'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}