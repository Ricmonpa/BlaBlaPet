import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname === '/' ? 'home' : 
                   location.pathname === '/camera' ? 'camera' : 
                   location.pathname === '/profile' ? 'profile' : 
                   location.pathname === '/emotional-dubbing-test' ? 'emotional-dubbing-test' : 'home';

  const navItems = [
    {
      id: 'home',
      label: 'Inicio',
      path: '/',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'camera',
      label: 'Cámara',
      path: '/camera',
      icon: (
        <div className="relative w-6 h-6">
          {/* Fondo blanco con bordes de colores */}
          <div className="absolute inset-0 bg-white rounded-md border-2 border-transparent" 
               style={{
                 borderTopColor: '#1ca9b1',
                 borderLeftColor: '#1ca9b1', 
                 borderBottomColor: '#db195d',
                 borderRightColor: '#db195d',
                 transform: 'translate(1px, 1px)'
               }}>
          </div>
          {/* Rectángulo blanco principal */}
          <div className="absolute inset-0 bg-white rounded-md border border-gray-200 flex items-center justify-center">
            {/* Signo de más negro */}
            <svg className="w-3 h-3" fill="black" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </div>
        </div>
      )
    },
    {
      id: 'profile',
      label: 'Perfil',
      path: '/profile',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="w-full px-4 py-3 h-16" style={{ backgroundColor: '#DC195C' }}>
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.path)}
            className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors ${
              activeTab === item.id
                ? 'text-white bg-white bg-opacity-20'
                : 'text-white hover:text-white hover:bg-white hover:bg-opacity-10'
            }`}
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;
