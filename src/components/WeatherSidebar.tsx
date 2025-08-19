import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Search, 
  MapPin, 
  Calendar,
  Heart,
  Settings,
  Bell,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { icon: Home, path: '/', label: 'Dashboard' },
  { icon: Search, path: '/search', label: 'Search' },
  { icon: MapPin, path: '/map', label: 'Map' },
  { icon: Calendar, path: '/calendar', label: 'Calendar' },
  { icon: Heart, path: '/favorites', label: 'Favorites' },
  { icon: Settings, path: '/settings', label: 'Settings' },
];

const WeatherSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed left-0 top-0 h-full w-20 weather-card border-r border-weather-border z-40">
      <div className="flex flex-col items-center py-6 h-full">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center weather-glow">
            <div className="text-primary-foreground font-bold text-xl">W</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-4 flex-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200",
                  "hover:bg-primary/20 hover:scale-105",
                  isActive 
                    ? "bg-primary text-primary-foreground weather-glow" 
                    : "text-weather-text-secondary hover:text-weather-text-primary"
                )}
                title={item.label}
              >
                <Icon size={20} />
              </button>
            );
          })}
        </nav>

        {/* Bottom Items */}
        <div className="flex flex-col gap-4">
          <button 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-weather-text-secondary hover:text-weather-text-primary hover:bg-primary/20 transition-all duration-200"
            title="Notifications"
          >
            <Bell size={20} />
          </button>
          <button 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-weather-text-secondary hover:text-weather-text-primary hover:bg-primary/20 transition-all duration-200"
            title="Profile"
          >
            <User size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeatherSidebar;