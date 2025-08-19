import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-weather-text-secondary">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-weather-text-primary">404</h1>
        <p className="text-xl mb-4 text-weather-text-secondary">Oops! Page not found</p>
        <a href="/" className="text-primary hover:text-primary-glow underline transition-colors">
          Return to Dashboard
        </a>
      </div>
    </div>
  );
};

export default NotFound;
