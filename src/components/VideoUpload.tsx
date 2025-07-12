import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Video, CheckCircle, X, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoUploadProps {
  onVideoUpload: (file: File, analysisData?: any) => void;
  userEmail: string;
  strokeType: string;
  handedness: string;
}

const VideoUpload = ({ onVideoUpload, userEmail, strokeType, handedness }: VideoUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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

  const validateFile = (file: File) => {
    const validTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime'];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file (MP4, AVI, MOV)",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a video smaller than 100MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const processFile = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    setUploadedFile(file);

    try {
      // Crear FormData para enviar al backend
      const formData = new FormData();
      formData.append('video', file);
      formData.append('email', userEmail);
      formData.append('stroke_type', strokeType);
      formData.append('handedness', handedness);

      // Llamar al backend (usa proxy en desarrollo)
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const analysisData = await response.json();
      
      setIsUploading(false);
      
      // Pasar el archivo y los datos del análisis al siguiente componente
      onVideoUpload(file, analysisData);
      
      toast({
        title: "Analysis completed!",
        description: `Your ${strokeLabels[strokeType]} video has been successfully analyzed`,
      });
    } catch (error) {
      setIsUploading(false);
      setUploadedFile(null);
      
      toast({
        title: "Analysis error",
        description: error instanceof Error ? error.message : "There was a problem processing your video. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  return (
    <div className="space-y-4">
      {/* Selected Stroke Info */}
      <Card className="bg-tennis-green/10 border-tennis-green/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-2 text-tennis-green font-semibold">
            <Target className="w-5 h-5" />
            <span>Analyzing: {strokeLabels[strokeType]}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-2xl mx-auto shadow-lg border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Video className="w-6 h-6 text-tennis-green" />
            Upload Tennis Video
          </CardTitle>
          <p className="text-gray-600">Analyzing for: {userEmail}</p>
        </CardHeader>
        <CardContent>
          {!uploadedFile ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                isDragOver
                  ? 'border-tennis-green bg-tennis-green/5 scale-105'
                  : 'border-gray-300 hover:border-tennis-green/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Drag your video here
              </h3>
              <p className="text-gray-600 mb-4">
                or click to select it from your device
              </p>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="video-upload"
              />
              <label htmlFor="video-upload">
                <Button
                  type="button"
                  className="bg-tennis-green hover:bg-tennis-green/90 text-white"
                  asChild
                >
                  <span>Select Video</span>
                </Button>
              </label>
              <p className="text-sm text-gray-500 mt-4">
                Supports MP4, AVI, MOV • Max 100MB
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isUploading ? (
                    <div className="w-8 h-8 border-2 border-tennis-green border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-600">
                      {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                {!isUploading && (
                  <Button
                    onClick={removeFile}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {isUploading && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-tennis-green h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm text-gray-600">🤖 Analyzing video with AI...</p>
                    <p className="text-xs text-gray-500">• Extracting pose and keyframes</p>
                    <p className="text-xs text-gray-500">• Comparing with professional technique</p>
                    <p className="text-xs text-gray-500">• Generating personalized feedback</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoUpload;
