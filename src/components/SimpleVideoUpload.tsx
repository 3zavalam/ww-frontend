import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Video, CheckCircle, X, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getBackendUrl } from '@/lib/backendDetection';

interface SimpleVideoUploadProps {
  onVideoUpload: (file: File, analysisData?: any) => void;
  userEmail: string;
  strokeType: string;
  handedness: string;
  experience: string;
}

const SimpleVideoUpload = ({ onVideoUpload, userEmail, strokeType, handedness, experience }: SimpleVideoUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const { toast } = useToast();

  const strokeLabels: { [key: string]: string } = {
    forehand: 'Forehand',
    backhand: 'Backhand', 
    serve: 'Serve',
    volley: 'Volley'
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => file.type.startsWith('video/'));
    
    if (videoFile) {
      handleFileSelect(videoFile);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a video file (MP4, AVI, MOV)",
      });
      return;
    }

    // Validate file size (400MB limit)
    if (file.size > 400 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload a video smaller than 400MB",
      });
      return;
    }

    setUploadedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSimpleUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    setCurrentStep('🚀 Uploading and analyzing your video...');

    try {
      // Auto-detect backend URL (works with any IP/network)
      setCurrentStep('🔍 Connecting to backend...');
      const baseUrl = await getBackendUrl();

      // Create form data for simple upload
      const formData = new FormData();
      formData.append('video', uploadedFile);
      formData.append('email', userEmail);
      formData.append('stroke_type', strokeType);
      formData.append('handedness', handedness);
      formData.append('experience', experience);

      setCurrentStep('📊 Processing video with AI...');

      // Send directly to flask_local.py /upload endpoint
      const response = await fetch(`${baseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const analysisData = await response.json();
      
      setCurrentStep('✅ Analysis complete!');
      
      // Call the parent component's handler with the results
      onVideoUpload(uploadedFile, analysisData);

      toast({
        title: "Analysis Complete!",
        description: "Your tennis stroke has been analyzed successfully.",
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload and analyze video. Make sure the backend is running.",
      });
    } finally {
      setIsUploading(false);
      setCurrentStep('');
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setCurrentStep('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="border-2 border-dashed border-gray-200">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900">
            <Target className="w-6 h-6" />
            Upload Your {strokeLabels[strokeType]} Video
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Record your {strokeLabels[strokeType].toLowerCase()} and upload it for AI analysis
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!uploadedFile ? (
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${
                isDragOver 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="video/*"
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="video-upload"
                disabled={isUploading}
              />
              <label htmlFor="video-upload">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-lg font-medium text-gray-900">
                    Drop your video here or click to browse
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Supports MP4, MOV, AVI files up to 400MB
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Video className="h-10 w-10 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                {!isUploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {isUploading && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-blue-600">{currentStep}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300 animate-pulse"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      🤖 AI analyzing your {strokeLabels[strokeType].toLowerCase()} technique...
                    </p>
                    <p className="text-xs text-gray-500 mt-1">• Processing video </p>
                  </div>
                </div>
              )}

              {!isUploading && (
                <div className="mt-6">
                  <Button 
                    onClick={handleSimpleUpload}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                    size="lg"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Analyze My {strokeLabels[strokeType]}
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="text-center text-sm text-gray-500 space-y-1">
            <p>• Your video will be analyzed locally on our server</p>
            <p>• Results include pose analysis, technique feedback, and improvement tips</p>
            <p>• Processing typically takes 1-2 minutes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleVideoUpload;