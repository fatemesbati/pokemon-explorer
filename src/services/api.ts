import axios, { AxiosError } from "axios";
import {
  Pokemon,
  PokemonListResponse,
  PokemonBasicInfo,
  PokemonSpecies,
  EvolutionChain,
  EvolutionStage,
  ChainLink,
} from "../types/pokemon";

const BASE_URL = "https://pokeapi.co/api/v2";
const ITEMS_PER_PAGE = 20;
const API_TIMEOUT = 10000;
const FAVORITES_KEY = "pokemon_favorites";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      console.error("API Error:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("Network Error:", error.message);
    } else {
      console.error("Request Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export const fetchPokemonList = async (
  page: number = 1
): Promise<PokemonListResponse> => {
  try {
    const offset = (page - 1) * ITEMS_PER_PAGE;
    const response = await api.get<PokemonListResponse>("/pokemon", {
      params: { limit: ITEMS_PER_PAGE, offset },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch Pokemon list. Please try again later.");
  }
};

export const fetchPokemonDetail = async (
  idOrName: string | number
): Promise<Pokemon> => {
  try {
    const response = await api.get<Pokemon>(`/pokemon/${idOrName}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error("Pokemon not found.");
    }
    throw new Error("Failed to fetch Pokemon details. Please try again later.");
  }
};

const fetchPokemonSpecies = async (
  idOrName: string | number
): Promise<PokemonSpecies> => {
  try {
    const response = await api.get<PokemonSpecies>(
      `/pokemon-species/${idOrName}`
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch Pokemon species data.");
  }
};

const fetchEvolutionChain = async (url: string): Promise<EvolutionChain> => {
  try {
    const response = await axios.get<EvolutionChain>(url);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch evolution chain.");
  }
};

const extractPokemonId = (url: string): number => {
  const matches = url.match(/\/pokemon\/(\d+)\//);
  return matches ? parseInt(matches[1], 10) : 0;
};

export const getPokemonSpriteUrl = (id: number): string => {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
};

export const transformPokemonList = (
  items: Array<{ name: string; url: string }>
): PokemonBasicInfo[] => {
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

export const formatPokemonName = (name: string): string => {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const formatStatName = (statName: string): string => {
  const statMap: Record<string, string> = {
    hp: "HP",
    attack: "Attack",
    defense: "Defense",
    "special-attack": "Sp. Atk",
    "special-defense": "Sp. Def",
    speed: "Speed",
  };
  return statMap[statName] || statName;
};

export const calculateTotalPages = (totalCount: number): number => {
  return Math.ceil(totalCount / ITEMS_PER_PAGE);
};

const extractEvolutionStages = (chain: ChainLink): EvolutionStage[] => {
  const stages: EvolutionStage[] = [];

  const traverse = (link: ChainLink): void => {
    const speciesUrl = link.species.url;
    const id = parseInt(speciesUrl.split("/").slice(-2, -1)[0], 10);
    const minLevel = link.evolution_details[0]?.min_level || undefined;

    stages.push({
      id,
      name: link.species.name,
      imageUrl: getPokemonSpriteUrl(id),
      minLevel,
    });

    if (link.evolves_to && link.evolves_to.length > 0) {
      link.evolves_to.forEach((evolution) => traverse(evolution));
    }
  };

  traverse(chain);
  return stages;
};

export const getEvolutionChain = async (
  pokemonId: number
): Promise<EvolutionStage[]> => {
  try {
    const species = await fetchPokemonSpecies(pokemonId);
    const evolutionChain = await fetchEvolutionChain(
      species.evolution_chain.url
    );
    return extractEvolutionStages(evolutionChain.chain);
  } catch (error) {
    console.error("Error fetching evolution chain:", error);
    return [];
  }
};

export const getFavorites = (): number[] => {
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error("Error reading favorites:", error);
    return [];
  }
};

export const isFavorite = (pokemonId: number): boolean => {
  return getFavorites().includes(pokemonId);
};

export const toggleFavorite = (pokemonId: number): boolean => {
  try {
    const favorites = getFavorites();
    const index = favorites.indexOf(pokemonId);

    if (index > -1) {
      favorites.splice(index, 1);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return false;
    } else {
      favorites.push(pokemonId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return true;
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return false;
  }
};

export async function fetchMultiplePokemon(
  ids: number[]
): Promise<PokemonBasicInfo[]> {
  const promises = ids.map(async (id) => {
    try {
      const pokemon = await fetchPokemonDetail(id);
      return {
        id: pokemon.id,
        name: pokemon.name,
        url: `${BASE_URL}/pokemon/${pokemon.id}/`,
        imageUrl: getPokemonSpriteUrl(pokemon.id),
      } as PokemonBasicInfo;
    } catch (err) {
      console.error(`Failed to fetch Pokemon ${id}`);
      return null;
    }
  });

  const results = await Promise.all(promises);
  return results.filter((p): p is PokemonBasicInfo => p !== null);
}

export async function searchPokemonByName(
  query: string
): Promise<PokemonBasicInfo | null> {
  try {
    const pokemon = await fetchPokemonDetail(query);
    return {
      id: pokemon.id,
      name: pokemon.name,
      url: `${BASE_URL}/pokemon/${pokemon.id}/`,
      imageUrl: getPokemonSpriteUrl(pokemon.id),
    };
  } catch {
    return null;
  }
}
