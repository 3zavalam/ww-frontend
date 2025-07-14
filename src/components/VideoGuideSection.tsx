import React from 'react';

const VideoGuideSection = () => {
  return (
    <div className="space-y-4 mb-6">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-3">
          <p className="text-sm text-gray-600">
            Play to see how to record and upload
          </p>
        </div>
        
        <div className="bg-black rounded-lg overflow-hidden shadow-lg">
          <video 
            controls 
            className="w-full h-auto"
            poster="/placeholder.svg"
          >
            <source src="/video-recording-guide.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
};

export default VideoGuideSection;