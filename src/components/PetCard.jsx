import React, { useState, useRef } from 'react';
import SequentialSubtitlesOverlay from './SequentialSubtitlesOverlay.jsx';
import ShareModal from './ShareModal.jsx';

const PetCard = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const videoRef = useRef(null);

  // Debug logging para subtítulos secuenciales
  if (post.isSequentialSubtitles) {
    console.log('🎬 PetCard recibió video con subtítulos secuenciales:', {
      id: post.id,
      petName: post.petName,
      isSequentialSubtitles: post.isSequentialSubtitles,
      subtitlesCount: post.subtitles?.length,
      totalDuration: post.totalDuration,
      mediaType: post.mediaType
    });
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-400';
    if (confidence >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="relative h-full w-full bg-black">
      {/* Media Background */}
      <div className="absolute inset-0">
        {post.mediaType === 'video' ? (
          <video
            ref={videoRef}
            src={post.mediaUrl}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            onError={(e) => {
              console.warn('Error cargando video:', e);
              // Mostrar mensaje de error si el video no se puede cargar
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <img
            src={post.mediaUrl}
            alt={`${post.petName} the ${post.breed}`}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Subtítulos secuenciales para videos */}
        {post.isSequentialSubtitles && post.subtitles && post.mediaType === 'video' && (
          <SequentialSubtitlesOverlay 
            subtitles={post.subtitles}
            videoRef={videoRef}
            totalDuration={post.totalDuration}
          />
        )}
      </div>

      {/* Content Overlay */}
      <div className="relative h-full flex flex-col justify-between p-4">
        
        {/* Top Section - User Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center pantone-214c">
              <span className="text-white font-bold text-lg">
                {post.petName.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">{post.petName}</h3>
              <p className="text-gray-300 text-sm">{post.breed}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Video indicator */}
            {post.mediaType === 'video' && (
              <div className="bg-black/50 rounded-full p-2">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
            )}
            <button className="text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Action Buttons - Moved to top, positioned on left side */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex flex-col items-center space-y-4">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isLiked ? 'bg-red-600' : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            <svg
              className={`w-6 h-6 ${isLiked ? 'text-white' : 'text-white'}`}
              fill={isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <span className="text-white text-sm font-medium">
            {formatNumber(post.likes)}
          </span>

          <button className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
          <span className="text-white text-sm font-medium">
            {formatNumber(post.comments)}
          </span>

          <button 
            onClick={() => setShowShareModal(true)}
            className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
          <span className="text-white text-sm font-medium">
            Compartir
          </span>
        </div>

        {/* Bottom Section - Info & Translation */}
        <div className="flex items-end justify-between">
          {/* Right Side Info */}
          <div className="flex flex-col items-end space-y-4">
            <div className="text-right">
              <p className="text-white font-medium">@{post.username}</p>
              <p className="text-gray-300 text-sm">{post.timestamp}</p>
            </div>
            
            {!showTranslation && !post.isSequentialSubtitles && (post.translation || post.emotionalDubbing) && (
              <button
                onClick={() => setShowTranslation(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
              >
                Ver traducción
              </button>
            )}
          </div>

          {/* Translation Overlay - Solo para posts que NO tienen subtítulos secuenciales */}
          {showTranslation && !post.isSequentialSubtitles && (
            <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-6 max-w-sm w-full">
              <div className="text-center">
                {/* Doblaje Emocional - Capa Principal */}
                {(post.output_emocional || post.emotionalDubbing) && (
                  <div className="mb-4">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      <span className="text-orange-400 font-medium text-sm">Doblaje Emocional</span>
                    </div>
                    <p className="text-white text-lg font-medium mb-2 leading-relaxed">
                      "{post.output_emocional || post.emotionalDubbing}"
                    </p>
                    {post.emotionalTone && (
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <span className="text-gray-400 text-xs">Tono:</span>
                        <span className="text-orange-300 text-xs font-medium capitalize">
                          {post.emotionalTone}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Traducción Técnica - Capa Secundaria */}
                <div className="border-t border-gray-600 pt-3">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                    <span className="text-blue-500 font-medium text-sm">Traducción Técnica</span>
                  </div>
                  <p className="text-white text-sm font-medium mb-2 leading-relaxed opacity-80">
                    "{post.output_tecnico || post.translation}"
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-gray-400 text-xs">Confianza:</span>
                    <span className={`font-semibold text-xs ${getConfidenceColor(post.confidence)}`}>
                      {post.confidence}%
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowTranslation(false)}
                  className="mt-4 text-blue-500 text-sm font-medium hover:underline"
                >
                  Ocultar traducción
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        post={post}
      />
    </div>
  );
};

export default PetCard;
