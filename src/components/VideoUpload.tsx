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
  const [uploadProgress, setUploadProgress] = useState(0);
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

  const validateFile = (file: File) => {
    const validTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime'];
    const maxSize = 400 * 1024 * 1024; // 400MB (aumentado para S3)

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
        description: "Please upload a video smaller than 400MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const pollJobStatus = async (jobId: string) => {
    setCurrentStep('🤖 AI analyzing your technique...');
    setUploadProgress(40);

    const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
    const maxAttempts = 60; // 10 minutos máximo
    let attempts = 0;

    const poll = async (): Promise<any> => {
      try {
        const response = await fetch(`${baseUrl}/status/${jobId}`);
        if (!response.ok) throw new Error('Failed to check status');
        
        const result = await response.json();
        
        if (result.status === 'done' && result.result) {
          return result.result;
        } else if (result.status === 'error') {
          throw new Error('Analysis failed on server');
        } else {
          attempts++;
          if (attempts >= maxAttempts) {
            throw new Error('Analysis timeout - please try again');
          }
          
          // Simular progreso durante el análisis
          const progress = Math.min(90, 40 + (attempts * 2));
          setUploadProgress(progress);
          
          // Actualizar mensaje cada cierto tiempo
          if (attempts % 10 === 0) {
            const messages = [
              '🎾 Extracting pose and keyframes...',
              '📊 Comparing with professional technique...',
              '💡 Generating personalized feedback...',
              '🏆 Almost done, finalizing analysis...'
            ];
            const messageIndex = Math.floor(attempts / 10) % messages.length;
            setCurrentStep(messages[messageIndex]);
          }
          
          // Esperar 10 segundos antes del siguiente poll
          await new Promise(resolve => setTimeout(resolve, 10000));
          return poll();
        }
      } catch (error) {
        console.error('Polling error:', error);
        throw error;
      }
    };

    return poll();
  };

  const processFile = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    setUploadedFile(file);
    setUploadProgress(0);
    setCurrentStep('🚀 Preparing upload...');

    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || '';

      // 1. Obtener presigned URL
      setCurrentStep('📝 Getting upload authorization...');
      setUploadProgress(5);
      
      const uploadUrlResponse = await fetch(`${baseUrl}/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          stroke_type: strokeType,
          handedness: handedness
        })
      });

      if (!uploadUrlResponse.ok) {
        throw new Error(`Failed to get upload URL: ${uploadUrlResponse.status}`);
      }

      const { presigned, s3_key } = await uploadUrlResponse.json();
      
      // 2. Upload directo a S3
      setCurrentStep('⬆️ Uploading video to cloud...');
      setUploadProgress(10);
      
      const formData = new FormData();
      Object.entries(presigned.fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', file);

      const s3Response = await fetch(presigned.url, {
        method: 'POST',
        body: formData
      });

      if (!s3Response.ok) {
        throw new Error(`Upload failed: ${s3Response.status}`);
      }

      // 3. Notificar completado
      setCurrentStep('✅ Upload complete, starting analysis...');
      setUploadProgress(30);
      
      const notifyResponse = await fetch(`${baseUrl}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          s3_key,
          email: userEmail,
          stroke_type: strokeType,
          handedness: handedness,
          original_filename: file.name,
          file_size: file.size
        })
      });

      if (!notifyResponse.ok) {
        throw new Error(`Failed to start analysis: ${notifyResponse.status}`);
      }

      const { job_id } = await notifyResponse.json();

      // 4. Polling del resultado
      const analysisData = await pollJobStatus(job_id);
      
      setUploadProgress(100);
      setCurrentStep('🎉 Analysis complete!');
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
      setUploadProgress(0);
      setCurrentStep('');
      
      console.error('Upload/Analysis error:', error);
      
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
    setUploadProgress(0);
    setCurrentStep('');
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
                Supports MP4, AVI, MOV • Max 400MB
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
                    {isUploading && currentStep && (
                      <p className="text-xs text-tennis-green mt-1 font-medium">
                        {currentStep}
                      </p>
                    )}
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
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-tennis-green h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mb-3">
                    <span>{uploadProgress}% complete</span>
                    <span>~{Math.max(1, Math.ceil((100 - uploadProgress) / 10))} min remaining</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      {uploadProgress < 30 ? '⬆️ Uploading video...' : '🤖 AI analyzing technique...'}
                    </p>
                    <p className="text-xs text-gray-500">• Fast upload to cloud storage</p>
                    <p className="text-xs text-gray-500">• AI pose extraction and analysis</p>
                    <p className="text-xs text-gray-500">• Professional technique comparison</p>
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