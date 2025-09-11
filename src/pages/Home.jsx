import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import PetCard from '../components/PetCard';
import videoShareService from '../services/videoShareService.js';

const Home = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const location = useLocation();

  // Cargar posts desde localStorage al inicializar
  const [petPosts, setPetPosts] = useState(() => {
    try {
      const savedPosts = localStorage.getItem('yo_pett_feed_posts');
      if (savedPosts) {
        return JSON.parse(savedPosts);
      }
    } catch (error) {
      console.error('Error cargando posts desde localStorage:', error);
    }
    
    // Datos simulados por defecto
    return [
    {
      id: 1,
      username: '@golden_max',
      petName: 'Max',
      breed: 'Golden Retriever',
      mediaUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop',
      mediaType: 'photo',
      translation: '¡Estoy feliz de verte! ¿Quieres jugar conmigo?',
      emotionalDubbing: '¡Qué alegría verte! ¡No puedo esperar para jugar contigo!',
      emotionalTone: 'alegre',
      emotionalStyle: 'entusiasta y cariñoso',
      emotion: 'feliz',
      context: 'juego',
      confidence: 85,
      likes: 1247,
      comments: 89,
      timestamp: '2h ago'
    },
    {
      id: 2,
      username: '@luna_poodle',
      petName: 'Luna',
      breed: 'Poodle',
      mediaUrl: 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=400&h=600&fit=crop',
      mediaType: 'photo',
      translation: 'Mmm... creo que necesito una siesta después de tanto ejercicio',
      emotionalDubbing: '¡Ay, estoy agotada! ¡Necesito un descansito después de tanto ejercicio!',
      emotionalTone: 'cansado',
      emotionalStyle: 'agotado y relajado',
      emotion: 'cansado',
      context: 'descanso',
      confidence: 92,
      likes: 2156,
      comments: 156,
      timestamp: '4h ago'
    },
    {
      id: 3,
      username: '@rocky_boxer',
      petName: 'Rocky',
      breed: 'Boxer',
      mediaUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=600&fit=crop',
      mediaType: 'photo',
      translation: '¡Soy el guardián de la casa! Nadie pasa sin mi permiso',
      emotionalDubbing: '¡Cuidado! ¡Soy el protector de esta casa y nadie pasa sin mi permiso!',
      emotionalTone: 'protector',
      emotionalStyle: 'defensivo y alerta',
      emotion: 'defensivo',
      context: 'alerta_defensiva',
      confidence: 78,
      likes: 892,
      comments: 67,
      timestamp: '6h ago'
    }
    ];
  });

  // Verificar si hay nueva traducción desde la cámara
  useEffect(() => {
    if (location.state?.translation || location.state?.output_emocional || location.state?.isSequentialSubtitles) {
      // Si tenemos subtítulos secuenciales, usar esos datos
      if (location.state.isSequentialSubtitles && location.state.subtitles) {
        const newPost = {
          id: Date.now(),
          username: '@tu_mascota',
          petName: 'Tu Mascota',
          breed: 'Mascota',
          mediaUrl: location.state.media?.data || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop',
          mediaType: location.state.media?.type || 'video',
          // Campos para subtítulos secuenciales
          isSequentialSubtitles: true,
          subtitles: location.state.subtitles,
          totalDuration: location.state.totalDuration,
          // Campos del análisis dual (para compatibilidad)
          translation: location.state.translation,
          output_tecnico: location.state.output_tecnico,
          output_emocional: location.state.output_emocional,
          // Campos emocionales
          emotionalDubbing: location.state.output_emocional,
          emotionalTone: location.state.emotion || 'secuencial',
          emotionalStyle: 'subtítulos secuenciales',
          emotion: location.state.emotion || 'secuencial',
          context: location.state.context || 'video con subtítulos secuenciales',
          confidence: location.state.confidence || 85,
          source: location.state.source || 'sequential_subtitles',
          analysisType: location.state.analysisType || 'sequential',
          behavior: location.state.behavior,
          likes: 0,
          comments: 0,
          timestamp: 'Ahora'
        };
        
        setPetPosts(prev => {
          const updatedPosts = [newPost, ...prev];
          // Guardar en localStorage
          localStorage.setItem('yo_pett_feed_posts', JSON.stringify(updatedPosts));
          return updatedPosts;
        });
        setCurrentIndex(0);
      } else if (location.state.output_tecnico && location.state.output_emocional) {
      // Si tenemos análisis dual, usar esos datos directamente
        const newPost = {
          id: Date.now(),
          username: '@tu_mascota',
          petName: 'Tu Mascota',
          breed: 'Mascota',
          mediaUrl: location.state.media?.data || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop',
          mediaType: location.state.media?.type || 'photo',
          // Campos del análisis dual
          translation: location.state.output_tecnico, // Para compatibilidad con PetCard
          output_tecnico: location.state.output_tecnico,
          output_emocional: location.state.output_emocional,
          // Campos emocionales (usar los del análisis dual)
          emotionalDubbing: location.state.output_emocional,
          emotionalTone: location.state.emotion || 'neutral',
          emotionalStyle: 'análisis dual',
          emotion: location.state.emotion || 'neutral',
          context: location.state.context || 'análisis',
          confidence: location.state.confidence || 85,
          source: location.state.source || 'dual_analysis',
          analysisType: location.state.analysisType || 'dual',
          behavior: location.state.behavior,
          likes: 0,
          comments: 0,
          timestamp: 'Ahora'
        };
        
        setPetPosts(prev => {
          const updatedPosts = [newPost, ...prev];
          // Guardar en localStorage
          localStorage.setItem('yo_pett_feed_posts', JSON.stringify(updatedPosts));
          return updatedPosts;
        });
        setCurrentIndex(0);
      } else {
        // Fallback: sistema anterior (generar doblaje emocional)
        let emotionalDubbing = '';
        let emotionalTone = '';
        let emotionalStyle = '';
        let emotion = '';
        let context = '';
        
        // Si tenemos información emocional del análisis, usarla
        if (location.state.emotion && location.state.context) {
          emotion = location.state.emotion;
          context = location.state.context;
          
          // Generar doblaje emocional básico basado en la emoción
          const emotionMap = {
            'feliz': { dubbing: '¡Qué alegría! ¡Estoy súper feliz!', tone: 'alegre', style: 'entusiasta' },
            'ansioso': { dubbing: '¡Ay, estoy un poco nervioso!', tone: 'nervioso', style: 'inquieto' },
            'exigente': { dubbing: '¡Vamos, ya es hora!', tone: 'insistente', style: 'determinado' },
            'defensivo': { dubbing: '¡Cuidado, algo no está bien!', tone: 'cauteloso', style: 'protector' },
            'curioso': { dubbing: '¡Qué interesante! ¡Quiero explorar!', tone: 'curioso', style: 'aventurero' }
          };
          
          const emotionData = emotionMap[emotion] || emotionMap['feliz'];
          emotionalDubbing = emotionData.dubbing + ' ' + location.state.translation;
          emotionalTone = emotionData.tone;
          emotionalStyle = emotionData.style;
        } else {
          // Fallback: generar doblaje emocional básico
          emotionalDubbing = '¡Qué emoción! ' + location.state.translation;
          emotionalTone = 'emocionado';
          emotionalStyle = 'entusiasta';
          emotion = 'feliz';
          context = 'social';
        }
        
        const newPost = {
          id: Date.now(),
          username: '@tu_mascota',
          petName: 'Tu Mascota',
          breed: 'Mascota',
          mediaUrl: location.state.media?.data || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop',
          mediaType: location.state.media?.type || 'photo',
          translation: location.state.translation,
          emotionalDubbing: emotionalDubbing,
          emotionalTone: emotionalTone,
          emotionalStyle: emotionalStyle,
          emotion: emotion,
          context: context,
          confidence: location.state.confidence || 85,
          likes: 0,
          comments: 0,
          timestamp: 'Ahora'
        };
        
        setPetPosts(prev => {
          const updatedPosts = [newPost, ...prev];
          // Guardar en localStorage
          localStorage.setItem('yo_pett_feed_posts', JSON.stringify(updatedPosts));
          return updatedPosts;
        });
        setCurrentIndex(0);
      }
      
      // Limpiar el state para evitar duplicados
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // const handleSwipe = (direction) => {
  //   if (direction === 'up' && currentIndex < petPosts.length - 1) {
  //     setCurrentIndex(currentIndex + 1);
  //   } else if (direction === 'down' && currentIndex > 0) {
  //     setCurrentIndex(currentIndex - 1);
  //   }
  // };

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#DC195C' }}>
      {/* Header */}
      <div className="flex-shrink-0 bg-[#1ca9b1] pt-12 pb-4 px-4 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo_blabla_pet_positive.png" 
              alt="BlaBlaPet Logo" 
              className="h-20 w-auto"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Feed Container */}
      <div className="flex-1 relative overflow-hidden">
        {petPosts.map((post, index) => (
          <div
            key={post.id}
            className={`absolute inset-0 transition-transform duration-300 ${
              index === currentIndex ? 'translate-y-0' : 
              index < currentIndex ? '-translate-y-full' : 'translate-y-full'
            }`}
          >
            <PetCard post={post} />
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="flex-shrink-0">
        <BottomNavigation />
      </div>
    </div>
  );
};

export default Home;
