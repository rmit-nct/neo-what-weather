import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { icon: Home, path: '/', label: 'Dashboard' },
  { icon: Heart, path: '/favorites', label: 'Favorites' }
];

const WeatherSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed inset-4 w-16 z-50 rounded-lg overflow-hidden">
      {/* Gradient background similar to image */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 via-slate-500/95 to-slate-900/95" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 via-blue-300/30 to-transparent mix-blend-overlay" />
      
      {/* Content */}
      <div className="relative flex flex-col items-center py-6 h-full px-2">
        {/* Logo with enhanced styling */}
        {<div className="mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/90 to-blue-700/90 flex items-center justify-center shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-300 transform hover:scale-105">
            <div className="text-white font-bold text-xl">W</div>
          </div>
        </div>}

        {/* Navigation Items */}
        <nav className="flex flex-col gap-6 flex-1 items-center">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "relative w-16 h-12 flex items-center justify-center transition-all group",
                  isActive 
                    ? "bg-gradient-to-r from-white/20 via-white/12 via-white/6 via-white/2 to-transparent text-white border-l-2 border-white"
                    : "text-slate-300 hover:text-white"
                )}
                title={item.label}
              >
                {/* Hover glow effect */}
                <div className={cn(
                  "absolute inset-0 transition-opacity duration-300",
                  isActive 
                    ? "opacity-0" 
                    : "m-1 rounded-md bg-blue-400/20 opacity-0 group-hover:opacity-100"
                )} />
              
                <Icon 
                  size={20} 
                  className={cn(
                    "relative z-10",
                    isActive ? "fill-white" : "fill-none"
                  )}
                />
              </button>
            );
          })}
        </nav>

        {/* Bottom spacing */}
        <div className="mt-auto h-8" />
      </div>
    </div>
  );
};

export default WeatherSidebar;