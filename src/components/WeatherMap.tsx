import { useState } from 'react';
import { Plus, Minus, Navigation, Layers } from 'lucide-react';

interface WeatherMapProps {
  className?: string;
}

const WeatherMap = ({ className = "" }: WeatherMapProps) => {
  const [selectedLayer, setSelectedLayer] = useState('Precipitation');
  
  const mapLayers = ['Extreme', 'Heavy', 'Moderate', 'Light'];
  const locations = [
    { name: 'California, US', temp: '30°', lat: 36.7783, lng: -119.4179, opacity: 0.8 },
    { name: 'Texas, US', temp: '90%', lat: 31.9686, lng: -99.9018, opacity: 0.6 },
    { name: 'Florida, US', temp: '21°', lat: 27.7663, lng: -82.6404, opacity: 0.9 },
  ];

  return (
    <div className={`weather-card weather-card-hover p-6 h-full ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-weather-text-primary text-lg font-semibold">
          Weather condition map
        </h3>
        <select 
          className="bg-transparent text-weather-text-secondary text-sm border border-weather-border rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={selectedLayer}
          onChange={(e) => setSelectedLayer(e.target.value)}
        >
          <option value="Precipitation">24 hr</option>
          <option value="Temperature">Temperature</option>
          <option value="Wind">Wind</option>
          <option value="Clouds">Clouds</option>
        </select>
      </div>

      {/* Map Container */}
      <div className="relative h-80 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl overflow-hidden mb-4">
        {/* Mock Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-blue-800/10 to-slate-900/30"></div>
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <button className="w-8 h-8 bg-weather-card border border-weather-border rounded-lg flex items-center justify-center text-weather-text-secondary hover:text-weather-text-primary transition-colors">
            <Plus size={16} />
          </button>
          <button className="w-8 h-8 bg-weather-card border border-weather-border rounded-lg flex items-center justify-center text-weather-text-secondary hover:text-weather-text-primary transition-colors">
            <Minus size={16} />
          </button>
        </div>

        <div className="absolute bottom-4 right-4 flex gap-2 z-10">
          <button className="w-8 h-8 bg-weather-card border border-weather-border rounded-lg flex items-center justify-center text-weather-text-secondary hover:text-weather-text-primary transition-colors">
            <Navigation size={16} />
          </button>
          <button className="w-8 h-8 bg-weather-card border border-weather-border rounded-lg flex items-center justify-center text-weather-text-secondary hover:text-weather-text-primary transition-colors">
            <Layers size={16} />
          </button>
        </div>

        {/* Weather Overlays */}
        <div className="absolute inset-0">
          {/* Precipitation overlay */}
          <div className="absolute top-1/4 left-1/3 w-32 h-24 bg-blue-500/30 rounded-full blur-sm"></div>
          <div className="absolute top-1/2 right-1/4 w-24 h-20 bg-cyan-400/40 rounded-full blur-sm"></div>
          <div className="absolute bottom-1/3 left-1/4 w-20 h-16 bg-blue-400/35 rounded-full blur-sm"></div>
        </div>

        {/* Location Markers */}
        {locations.map((location, index) => (
          <div
            key={location.name}
            className={`absolute w-16 h-16 rounded-full border-2 border-white/50 flex items-center justify-center text-white text-xs font-medium cursor-pointer transition-all hover:scale-110`}
            style={{
              left: `${20 + index * 25}%`,
              top: `${30 + index * 15}%`,
              backgroundColor: `rgba(59, 130, 246, ${location.opacity})`,
            }}
          >
            {location.temp}
          </div>
        ))}

        {/* Sample weather regions */}
        <div className="absolute bottom-8 left-8 flex flex-wrap gap-2">
          {locations.map((location) => (
            <div
              key={location.name}
              className="flex items-center gap-2 px-3 py-1 bg-weather-card/80 border border-weather-border rounded-lg backdrop-blur-sm"
            >
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-weather-text-primary text-xs font-medium">
                {location.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between">
        <div className="text-weather-text-secondary text-sm font-medium">
          {selectedLayer}
        </div>
        <div className="flex items-center gap-2">
          {mapLayers.map((layer, index) => (
            <div key={layer} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: `hsl(193, 95%, ${85 - index * 15}%)`,
                  opacity: 0.4 + index * 0.2
                }}
              ></div>
              <span className="text-weather-text-secondary text-xs">
                {layer}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherMap;