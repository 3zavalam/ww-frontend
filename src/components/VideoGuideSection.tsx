import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayCircle, Video, Camera, CheckCircle } from 'lucide-react';

const VideoGuideSection = () => {
  return (
    <div className="space-y-6 mb-8">
      <Card className="w-full max-w-4xl mx-auto shadow-lg border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Camera className="w-6 h-6 text-tennis-green" />
            How to Record Your Tennis Video
          </CardTitle>
          <p className="text-gray-600">Follow these guidelines for the best analysis results</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Video Tutorial Placeholder */}
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 bg-tennis-green/20 rounded-full flex items-center justify-center">
                <PlayCircle className="w-12 h-12 text-tennis-green" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Video Tutorial Coming Soon
                </h3>
                <p className="text-gray-600">
                  We'll add your instructional video here
                </p>
                {/* Placeholder for the actual video */}
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    📹 <strong>Video placeholder:</strong> Your tutorial video will be embedded here
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recording Tips */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-tennis-green" />
                Recording Tips
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Full body visible</p>
                    <p className="text-sm text-gray-600">Make sure your entire body is in frame from head to feet</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Side view angle</p>
                    <p className="text-sm text-gray-600">Position camera perpendicular to your hitting direction</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Good lighting</p>
                    <p className="text-sm text-gray-600">Record during daylight or with adequate court lighting</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Video Requirements
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Duration: 10-30 seconds</p>
                    <p className="text-sm text-gray-600">Include preparation, swing, and follow-through</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Stable recording</p>
                    <p className="text-sm text-gray-600">Use a tripod or have someone hold the camera steady</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Clear view of technique</p>
                    <p className="text-sm text-gray-600">Avoid obstacles blocking the camera view</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Example */}
          <div className="bg-tennis-green/5 border border-tennis-green/20 rounded-lg p-4">
            <h4 className="font-semibold text-tennis-green mb-2">💡 Pro Tip</h4>
            <p className="text-sm text-gray-700">
              Record multiple swings in one video! Our AI will automatically detect and analyze the best swing for you.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoGuideSection;