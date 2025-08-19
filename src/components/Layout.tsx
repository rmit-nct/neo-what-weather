import WeatherSidebar from './WeatherSidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-weather-bg">
      <WeatherSidebar />
      <main className="pl-20">
        {children}
      </main>
    </div>
  );
};

export default Layout;