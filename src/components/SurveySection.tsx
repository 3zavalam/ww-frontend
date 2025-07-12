
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, ExternalLink, CheckCircle } from 'lucide-react';
import { SimpleFeedback } from './SimpleFeedback';

interface SurveySectionProps {
  userEmail: string;
  strokeType?: string;
  sessionId?: string;
}

const SurveySection = ({ userEmail, strokeType, sessionId }: SurveySectionProps) => {
  // Usar directamente el componente SimpleFeedback
  return (
    <SimpleFeedback 
      userEmail={userEmail}
      strokeType={strokeType || 'unknown'}
      sessionId={sessionId}
    />
  );
};

export default SurveySection;
