import React from 'react';
import EmotionalDubbingTest from '../components/EmotionalDubbingTest';
import BottomNavigation from '../components/BottomNavigation';

const EmotionalDubbingTestPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                🎭 Doblaje Emocional
              </h1>
              <p className="text-gray-600 text-sm">
                Prueba la nueva capa de subtítulos emocionales
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">
                <p>Nueva funcionalidad</p>
                <p className="text-green-600 font-medium">✓ Implementada</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pb-20">
        <EmotionalDubbingTest />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default EmotionalDubbingTestPage;
