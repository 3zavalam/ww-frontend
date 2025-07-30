import React from 'react';

const VideoGuideSection = () => {
  return (
    <div className="space-y-4 mb-6">
      <div className="w-full max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold text-center mb-4">
          How to Upload Your Tennis Video
        </h3>
        <div className="text-center mb-3">
          <p className="text-sm text-gray-600">
            Watch this guide to learn how to record and upload your tennis stroke
          </p>
        </div>
        
        <div className="bg-black rounded-lg overflow-hidden shadow-lg">
          <video 
            controls 
            autoPlay
            muted
            playsInline
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