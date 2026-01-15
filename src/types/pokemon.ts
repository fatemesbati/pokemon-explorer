export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{ name: string; url: string }>;
}

export interface PokemonBasicInfo {
  id: number;
  name: string;
  url: string;
  imageUrl: string;
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  abilities: Array<{
    ability: { name: string; url: string };
    is_hidden: boolean;
  }>;

  types: Array<{
    type: { name: string; url: string };
  }>;

  stats: Array<{
    base_stat: number;
    stat: { name: string; url: string };
  }>;

  sprites: {
    front_default: string | null;
    other?: {
      "official-artwork": {
        front_default: string | null;
      };
    };
  };

  species: {
    name: string;
    url: string;
  };
}

export interface PokemonSpecies {
  id: number;
  name: string;
  evolution_chain: {
    url: string;
  };
}

export interface ChainLink {
  species: {
    name: string;
    url: string;
  };

  evolution_details: Array<{
    min_level: number | null;
  }>;

  evolves_to: ChainLink[];
}

export interface EvolutionChain {
  id: number;
  chain: ChainLink;
}

export interface EvolutionStage {
  id: number;
  name: string;
  imageUrl: string;
  minLevel?: number;
}

export const TYPE_COLORS: Record<string, string> = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
};
