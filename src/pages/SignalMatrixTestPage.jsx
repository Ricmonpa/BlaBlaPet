import React from 'react';
import SignalMatrixTest from '../components/SignalMatrixTest.jsx';
import BottomNavigation from '../components/BottomNavigation.jsx';

const SignalMatrixTestPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🧠 Sistema de Análisis con Matriz de Señales
          </h1>
          <p className="text-gray-600 text-lg">
            Prueba el nuevo sistema que evita el "catastrophic forgetting" usando una matriz estable de 50 señales caninas.
          </p>
        </div>
        
        <SignalMatrixTest />
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default SignalMatrixTestPage;
