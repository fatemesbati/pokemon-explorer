import axios, { AxiosError } from 'axios';
import { Pokemon, PokemonListResponse, PokemonBasicInfo, PokemonSpecies, EvolutionChain, EvolutionStage } from '../types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';
const ITEMS_PER_PAGE = 20;

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error:', error.message);
    } else {
      // Error in request setup
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Fetch a paginated list of Pokemon
 * @param page - Page number (1-indexed)
 * @returns Promise with Pokemon list response
 */
export const fetchPokemonList = async (page: number = 1): Promise<PokemonListResponse> => {
  try {
    const offset = (page - 1) * ITEMS_PER_PAGE;
    const response = await api.get<PokemonListResponse>('/pokemon', {
      params: {
        limit: ITEMS_PER_PAGE,
        offset,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch Pokemon list. Please try again later.');
  }
};

/**
 * Extract Pokemon ID from URL
 * @param url - Pokemon URL from API
 * @returns Pokemon ID
 */
export const extractPokemonId = (url: string): number => {
  const matches = url.match(/\/pokemon\/(\d+)\//);
  return matches ? parseInt(matches[1], 10) : 0;
};

/**
 * Get Pokemon sprite URL from ID
 * @param id - Pokemon ID
 * @returns Sprite URL
 */
export const getPokemonSpriteUrl = (id: number): string => {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
};

/**
 * Fetch detailed information about a specific Pokemon
 * @param idOrName - Pokemon ID or name
 * @returns Promise with Pokemon details
 */
export const fetchPokemonDetail = async (idOrName: string | number): Promise<Pokemon> => {
  try {
    const response = await api.get<Pokemon>(`/pokemon/${idOrName}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error('Pokemon not found.');
    }
    throw new Error('Failed to fetch Pokemon details. Please try again later.');
  }
};

/**
 * Fetch Pokemon species data
 * @param idOrName - Pokemon ID or name
 * @returns Promise with species data
 */
export const fetchPokemonSpecies = async (idOrName: string | number): Promise<PokemonSpecies> => {
  try {
    const response = await api.get<PokemonSpecies>(`/pokemon-species/${idOrName}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch Pokemon species data.');
  }
};

/**
 * Fetch evolution chain data
 * @param url - Evolution chain URL
 * @returns Promise with evolution chain data
 */
export const fetchEvolutionChain = async (url: string): Promise<EvolutionChain> => {
  try {
    const response = await axios.get<EvolutionChain>(url);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch evolution chain.');
  }
};

/**
 * Extract evolution stages from chain
 * @param chain - Evolution chain link
 * @returns Array of evolution stages
 */
export const extractEvolutionStages = (chain: any): EvolutionStage[] => {
  const stages: EvolutionStage[] = [];
  
  const traverse = (link: any) => {
    const speciesUrl = link.species.url;
    const id = parseInt(speciesUrl.split('/').slice(-2, -1)[0], 10);
    const minLevel = link.evolution_details[0]?.min_level || undefined;
    
    stages.push({
      id,
      name: link.species.name,
      imageUrl: getPokemonSpriteUrl(id),
      minLevel,
    });
    
    if (link.evolves_to && link.evolves_to.length > 0) {
      link.evolves_to.forEach((evolution: any) => traverse(evolution));
    }
  };
  
  traverse(chain);
  return stages;
};

/**
 * Get complete evolution chain for a Pokemon
 * @param pokemonId - Pokemon ID
 * @returns Promise with evolution stages
 */
export const getEvolutionChain = async (pokemonId: number): Promise<EvolutionStage[]> => {
  try {
    const species = await fetchPokemonSpecies(pokemonId);
    const evolutionChain = await fetchEvolutionChain(species.evolution_chain.url);
    return extractEvolutionStages(evolutionChain.chain);
  } catch (error) {
    console.error('Error fetching evolution chain:', error);
    return [];
  }
};

/**
 * Transform Pokemon list items to include sprite URLs
 * @param items - Raw Pokemon list items from API
 * @returns Array of Pokemon with basic info including sprites
 */
export const transformPokemonList = (items: Array<{ name: string; url: string }>): PokemonBasicInfo[] => {
  return items.map((item) => {
    const id = extractPokemonId(item.url);
    return {
      id,
      name: item.name,
      url: item.url,
      imageUrl: getPokemonSpriteUrl(id),
    };
  });
};

/**
 * Format Pokemon name for display (capitalize first letter)
 * @param name - Pokemon name
 * @returns Formatted name
 */
export const formatPokemonName = (name: string): string => {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format stat name for display
 * @param statName - Raw stat name from API
 * @returns Formatted stat name
 */
export const formatStatName = (statName: string): string => {
  const statMap: Record<string, string> = {
    hp: 'HP',
    attack: 'Attack',
    defense: 'Defense',
    'special-attack': 'Sp. Atk',
    'special-defense': 'Sp. Def',
    speed: 'Speed',
  };
  return statMap[statName] || statName;
};

/**
 * Calculate total pages for pagination
 * @param totalCount - Total number of items
 * @returns Total number of pages
 */
export const calculateTotalPages = (totalCount: number): number => {
  return Math.ceil(totalCount / ITEMS_PER_PAGE);
};

// Favorites Management (localStorage)
const FAVORITES_KEY = 'pokemon_favorites';

/**
 * Get all favorite Pokemon IDs from localStorage
 * @returns Array of favorite Pokemon IDs
 */
export const getFavorites = (): number[] => {
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error reading favorites:', error);
    return [];
  }
};

/**
 * Check if a Pokemon is favorited
 * @param pokemonId - Pokemon ID
 * @returns True if favorited
 */
export const isFavorite = (pokemonId: number): boolean => {
  const favorites = getFavorites();
  return favorites.includes(pokemonId);
};

/**
 * Toggle favorite status for a Pokemon
 * @param pokemonId - Pokemon ID
 * @returns New favorite status
 */
export const toggleFavorite = (pokemonId: number): boolean => {
  try {
    const favorites = getFavorites();
    const index = favorites.indexOf(pokemonId);
    
    if (index > -1) {
      // Remove from favorites
      favorites.splice(index, 1);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return false;
    } else {
      // Add to favorites
      favorites.push(pokemonId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return true;
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return false;
  }
};

export { ITEMS_PER_PAGE };