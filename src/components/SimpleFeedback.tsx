import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { saveFeedback } from '@/lib/analytics';
import { Star, MessageCircle, ThumbsUp, ThumbsDown } from 'lucide-react';

interface SimpleFeedbackProps {
  userEmail: string;
  strokeType: string;
  sessionId?: string;
}

export function SimpleFeedback({ userEmail, strokeType, sessionId }: SimpleFeedbackProps) {
  const [rating, setRating] = useState<number>(0);
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [comments, setComments] = useState('');
  const [recommend, setRecommend] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      await saveFeedback({
        email: userEmail,
        rating: rating || undefined,
        helpful: helpful || undefined,
        comments: comments || undefined,
        recommend: recommend || undefined,
        stroke_type: strokeType,
        session_id: sessionId || crypto.randomUUID()
      });
      
      setSubmitted(true);
    } catch (error) {
      console.error('Error saving feedback:', error);
      alert('Error al guardar feedback. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-md mx-auto shadow-lg border-0 bg-green-50 border-green-200">
        <CardContent className="pt-6 text-center">
          <div className="text-green-600 text-lg font-semibold mb-2">
            ¡Gracias por tu feedback! 🎾
          </div>
          <p className="text-gray-600">
            Tus comentarios nos ayudan a mejorar WinnerWay
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto shadow-lg border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <MessageCircle className="w-5 h-5 text-tennis-green" />
          ¿Cómo fue tu experiencia?
        </CardTitle>
        <p className="text-gray-600 text-sm">Tu opinión nos ayuda a mejorar</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Rating con estrellas */}
          <div>
            <label className="block text-sm font-medium mb-3 text-gray-700">
              Califica el análisis (1-5 estrellas)
            </label>
            <div className="flex gap-1 justify-center">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setRating(num)}
                  className={`p-1 transition-colors ${
                    rating >= num ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  <Star className="w-8 h-8 fill-current" />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-gray-600 mt-2">
                {rating === 5 ? '¡Excelente!' : rating === 4 ? 'Muy bueno' : rating === 3 ? 'Bueno' : rating === 2 ? 'Regular' : 'Necesita mejorar'}
              </p>
            )}
          </div>

          {/* ¿Te fue útil? */}
          <div>
            <label className="block text-sm font-medium mb-3 text-gray-700">
              ¿Te fue útil el feedback?
            </label>
            <div className="flex gap-3 justify-center">
              <Button
                type="button"
                variant={helpful === true ? "default" : "outline"}
                size="sm"
                onClick={() => setHelpful(true)}
                className="flex items-center gap-2"
              >
                <ThumbsUp className="w-4 h-4" />
                Sí, muy útil
              </Button>
              <Button
                type="button"
                variant={helpful === false ? "default" : "outline"}
                size="sm"
                onClick={() => setHelpful(false)}
                className="flex items-center gap-2"
              >
                <ThumbsDown className="w-4 h-4" />
                No mucho
              </Button>
            </div>
          </div>

          {/* ¿Recomendarías? */}
          <div>
            <label className="block text-sm font-medium mb-3 text-gray-700">
              ¿Recomendarías WinnerWay?
            </label>
            <div className="flex gap-3 justify-center">
              <Button
                type="button"
                variant={recommend === true ? "default" : "outline"}
                size="sm"
                onClick={() => setRecommend(true)}
                className="bg-tennis-green hover:bg-tennis-green/90"
              >
                ¡Definitivamente!
              </Button>
              <Button
                type="button"
                variant={recommend === false ? "default" : "outline"}
                size="sm"
                onClick={() => setRecommend(false)}
              >
                Tal vez no
              </Button>
            </div>
          </div>

          {/* Comentarios */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Comentarios adicionales (opcional)
            </label>
            <Textarea
              placeholder="¿Qué te gustó más? ¿Qué podríamos mejorar?"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-tennis-green hover:bg-tennis-green/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Enviando...
              </div>
            ) : (
              'Enviar Feedback'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}