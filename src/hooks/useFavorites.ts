import { useState, useEffect } from 'react';

interface FavoriteLocation {
  id: string;
  name: string;
  country: string;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('weatherFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const addToFavorites = (name: string, country: string) => {
    const newFavorite: FavoriteLocation = {
      id: Date.now().toString(),
      name,
      country,
    };

    const alreadyExists = favorites.some(
      fav => fav.name.toLowerCase() === name.toLowerCase() && fav.country === country
    );

    if (!alreadyExists) {
      const updatedFavorites = [...favorites, newFavorite];
      setFavorites(updatedFavorites);
      localStorage.setItem('weatherFavorites', JSON.stringify(updatedFavorites));
      return true;
    }
    return false;
  };

  const removeFromFavorites = (id: string) => {
    const updatedFavorites = favorites.filter(fav => fav.id !== id);
    setFavorites(updatedFavorites);
    localStorage.setItem('weatherFavorites', JSON.stringify(updatedFavorites));
  };

  const isFavorite = (name: string, country: string) => {
    return favorites.some(
      fav => fav.name.toLowerCase() === name.toLowerCase() && fav.country === country
    );
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  };
};