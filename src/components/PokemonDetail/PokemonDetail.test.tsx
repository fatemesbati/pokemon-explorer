import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import PokemonDetail from './PokemonDetail';
import * as api from '../../services/api';
import { Pokemon } from '../../types/pokemon';

// Mock the API
jest.mock('../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('PokemonDetail Component', () => {
  const mockPokemon: Pokemon = {
  id: 25,
  name: 'pikachu',
  height: 4,
  weight: 60,
  base_experience: 112,
  species: {
    name: 'pikachu',
    url: 'https://pokeapi.co/api/v2/pokemon-species/25/',
  },
  abilities: [
    {
      ability: { name: 'static', url: 'https://pokeapi.co/api/v2/ability/9/' },
      is_hidden: false,
      slot: 1,
    },
    {
      ability: {
        name: 'lightning-rod',
        url: 'https://pokeapi.co/api/v2/ability/31/',
      },
      is_hidden: true,
      slot: 3,
    },
  ],
  types: [
    {
      slot: 1,
      type: { name: 'electric', url: 'https://pokeapi.co/api/v2/type/13/' },
    },
  ],
  stats: [
    {
      base_stat: 35,
      effort: 0,
      stat: { name: 'hp', url: 'https://pokeapi.co/api/v2/stat/1/' },
    },
    {
      base_stat: 55,
      effort: 0,
      stat: { name: 'attack', url: 'https://pokeapi.co/api/v2/stat/2/' },
    },
    {
      base_stat: 40,
      effort: 0,
      stat: { name: 'defense', url: 'https://pokeapi.co/api/v2/stat/3/' },
    },
    {
      base_stat: 50,
      effort: 0,
      stat: {
        name: 'special-attack',
        url: 'https://pokeapi.co/api/v2/stat/4/',
      },
    },
    {
      base_stat: 50,
      effort: 0,
      stat: {
        name: 'special-defense',
        url: 'https://pokeapi.co/api/v2/stat/5/',
      },
    },
    {
      base_stat: 90,
      effort: 2,
      stat: { name: 'speed', url: 'https://pokeapi.co/api/v2/stat/6/' },
    },
  ],
  sprites: {
    front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    front_shiny: null,
    front_female: null,
    front_shiny_female: null,
    back_default: null,
    back_shiny: null,
    back_female: null,
    back_shiny_female: null,
    other: {
      'official-artwork': {
        front_default:
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
        front_shiny: null,
      },
    },
  },
};

  beforeEach(() => {
    jest.clearAllMocks();
    mockedApi.fetchPokemonDetail.mockResolvedValue(mockPokemon);
    mockedApi.formatPokemonName.mockImplementation((name) => 
      name.charAt(0).toUpperCase() + name.slice(1)
    );
    mockedApi.formatStatName.mockImplementation((name) => {
      const statMap: Record<string, string> = {
        hp: 'HP',
        attack: 'Attack',
        defense: 'Defense',
        'special-attack': 'Sp. Atk',
        'special-defense': 'Sp. Def',
        speed: 'Speed',
      };
      return statMap[name] || name;
    });
  });

  const renderWithRouter = (id: string = '25') => {
    return render(
      <MemoryRouter initialEntries={[`/pokemon/${id}`]}>
        <Routes>
          <Route path="/pokemon/:id" element={<PokemonDetail />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders loading state initially', () => {
    renderWithRouter();
    expect(screen.getByText(/loading pokémon details/i)).toBeInTheDocument();
  });

  it('renders pokemon details after loading', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/pikachu/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/#025/)).toBeInTheDocument();
    expect(screen.getByText(/electric/i)).toBeInTheDocument();
  });

  it('displays abilities correctly', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/abilities/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/static/i)).toBeInTheDocument();
    expect(screen.getByText(/lightning-rod/i)).toBeInTheDocument();
  });

  it('displays stats with progress bars', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/base stats/i)).toBeInTheDocument();
    });

    expect(screen.getByText('HP')).toBeInTheDocument();
    expect(screen.getByText('Attack')).toBeInTheDocument();
    expect(screen.getByText('Speed')).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument(); // HP value
    expect(screen.getByText('90')).toBeInTheDocument(); // Speed value
  });

  it('displays physical attributes', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/height/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/0.4 m/)).toBeInTheDocument();
    expect(screen.getByText(/6.0 kg/)).toBeInTheDocument();
  });

  it('handles error state', async () => {
    mockedApi.fetchPokemonDetail.mockRejectedValue(new Error('Network error'));

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('has back button that navigates to previous page', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/pikachu/i)).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back to list/i });
    expect(backButton).toBeInTheDocument();

    await userEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('displays total stats', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/total/i)).toBeInTheDocument();
    });

    // Total = 35 + 55 + 40 + 50 + 50 + 90 = 320
    expect(screen.getByText('320')).toBeInTheDocument();
  });

  it('handles invalid pokemon ID', async () => {
    mockedApi.fetchPokemonDetail.mockRejectedValue(new Error('Pokemon not found.'));

    renderWithRouter('999999');

    await waitFor(() => {
      expect(screen.getByText(/pokemon not found/i)).toBeInTheDocument();
    });
  });

  it('displays pokemon image when available', async () => {
    renderWithRouter();

    await waitFor(() => {
      const image = screen.getByAltText(/pikachu/i);
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute(
        'src',
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
      );
    });
  });
});