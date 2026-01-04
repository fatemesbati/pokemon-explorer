import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PokemonList from './PokemonList';
import * as api from '../../services/api';

// Mock the API
jest.mock('../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('PokemonList Component', () => {
  const mockPokemonList = {
    count: 1302,
    next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
    previous: null,
    results: [
      { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
      { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
      { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon/3/' },
    ],
  };

  const mockTransformedList = [
    {
      id: 1,
      name: 'bulbasaur',
      url: 'https://pokeapi.co/api/v2/pokemon/1/',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
    },
    {
      id: 2,
      name: 'ivysaur',
      url: 'https://pokeapi.co/api/v2/pokemon/2/',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png',
    },
    {
      id: 3,
      name: 'venusaur',
      url: 'https://pokeapi.co/api/v2/pokemon/3/',
      imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedApi.fetchPokemonList.mockResolvedValue(mockPokemonList);
    mockedApi.transformPokemonList.mockReturnValue(mockTransformedList);
    mockedApi.calculateTotalPages.mockReturnValue(66);
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('renders loading state initially', () => {
    renderWithRouter(<PokemonList />);
    expect(screen.getByText(/loading pokémon/i)).toBeInTheDocument();
  });

  it('renders pokemon list after loading', async () => {
    renderWithRouter(<PokemonList />);

    await waitFor(() => {
      expect(screen.getByText(/pokémon explorer/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/bulbasaur/i)).toBeInTheDocument();
    expect(screen.getByText(/ivysaur/i)).toBeInTheDocument();
    expect(screen.getByText(/venusaur/i)).toBeInTheDocument();
  });

  it('displays total count of pokemon', async () => {
    renderWithRouter(<PokemonList />);

    await waitFor(() => {
      expect(screen.getByText(/discover and explore 1,302 pokémon/i)).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    mockedApi.fetchPokemonList.mockRejectedValue(new Error('Network error'));

    renderWithRouter(<PokemonList />);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('renders pagination', async () => {
    renderWithRouter(<PokemonList />);

    await waitFor(() => {
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    // Check for page info
    expect(screen.getByText(/page 1 of 66/i)).toBeInTheDocument();
  });

  it('calls API with correct page parameter', async () => {
    renderWithRouter(<PokemonList />);

    await waitFor(() => {
      expect(mockedApi.fetchPokemonList).toHaveBeenCalledWith(1);
    });
  });

  it('displays pokemon cards with correct structure', async () => {
    renderWithRouter(<PokemonList />);

    await waitFor(() => {
      const cards = screen.getAllByRole('button');
      expect(cards.length).toBeGreaterThan(0);
    });
  });
});
