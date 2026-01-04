import axios from 'axios';
import {
  fetchPokemonList,
  fetchPokemonDetail,
  extractPokemonId,
  getPokemonSpriteUrl,
  transformPokemonList,
  formatPokemonName,
  formatStatName,
  calculateTotalPages,
  ITEMS_PER_PAGE,
} from './api';
import { PokemonListResponse, Pokemon } from '../types/pokemon';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchPokemonList', () => {
    it('should fetch pokemon list successfully', async () => {
      const mockResponse: PokemonListResponse = {
        count: 1302,
        next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
        previous: null,
        results: [
          { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
          { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
        ],
      };

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockResponse }),
        interceptors: {
          response: { use: jest.fn() },
        },
      } as any);

      const result = await fetchPokemonList(1);
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when fetching pokemon list', async () => {
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(new Error('Network error')),
        interceptors: {
          response: { use: jest.fn() },
        },
      } as any);

      await expect(fetchPokemonList(1)).rejects.toThrow(
        'Failed to fetch Pokemon list. Please try again later.'
      );
    });
  });

  describe('fetchPokemonDetail', () => {
    it('should fetch pokemon details successfully', async () => {
      const mockPokemon: Partial<Pokemon> = {
        id: 1,
        name: 'bulbasaur',
        height: 7,
        weight: 69,
        abilities: [],
        types: [],
        stats: [],
        sprites: {} as any,
        base_experience: 64,
      };

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockPokemon }),
        interceptors: {
          response: { use: jest.fn() },
        },
      } as any);

      const result = await fetchPokemonDetail(1);
      expect(result.name).toBe('bulbasaur');
    });

    it('should throw specific error for 404', async () => {
      const error = {
        isAxiosError: true,
        response: { status: 404 },
      };

      mockedAxios.isAxiosError.mockReturnValue(true);
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(error),
        interceptors: {
          response: { use: jest.fn() },
        },
      } as any);

      await expect(fetchPokemonDetail('invalid')).rejects.toThrow('Pokemon not found.');
    });
  });

  describe('extractPokemonId', () => {
    it('should extract pokemon ID from URL', () => {
      const url = 'https://pokeapi.co/api/v2/pokemon/25/';
      expect(extractPokemonId(url)).toBe(25);
    });

    it('should return 0 for invalid URL', () => {
      const url = 'https://pokeapi.co/invalid/url';
      expect(extractPokemonId(url)).toBe(0);
    });
  });

  describe('getPokemonSpriteUrl', () => {
    it('should generate correct sprite URL', () => {
      const url = getPokemonSpriteUrl(25);
      expect(url).toBe(
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
      );
    });
  });

  describe('transformPokemonList', () => {
    it('should transform pokemon list with IDs and sprite URLs', () => {
      const items = [
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
      ];

      const result = transformPokemonList(items);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        name: 'bulbasaur',
        url: 'https://pokeapi.co/api/v2/pokemon/1/',
        imageUrl:
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
      });
    });
  });

  describe('formatPokemonName', () => {
    it('should capitalize first letter', () => {
      expect(formatPokemonName('pikachu')).toBe('Pikachu');
    });

    it('should handle hyphenated names', () => {
      expect(formatPokemonName('mr-mime')).toBe('Mr Mime');
    });
  });

  describe('formatStatName', () => {
    it('should format stat names correctly', () => {
      expect(formatStatName('hp')).toBe('HP');
      expect(formatStatName('special-attack')).toBe('Sp. Atk');
      expect(formatStatName('special-defense')).toBe('Sp. Def');
    });
  });

  describe('calculateTotalPages', () => {
    it('should calculate total pages correctly', () => {
      expect(calculateTotalPages(100)).toBe(5);
      expect(calculateTotalPages(95)).toBe(5);
      expect(calculateTotalPages(101)).toBe(6);
    });
  });

  describe('ITEMS_PER_PAGE', () => {
    it('should be defined and have correct value', () => {
      expect(ITEMS_PER_PAGE).toBe(20);
    });
  });
});
