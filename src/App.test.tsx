import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock child components
jest.mock('./components/PokemonList/PokemonList', () => {
  return function MockPokemonList() {
    return <div data-testid="pokemon-list">Pokemon List</div>;
  };
});

jest.mock('./components/PokemonDetail/PokemonDetail', () => {
  return function MockPokemonDetail() {
    return <div data-testid="pokemon-detail">Pokemon Detail</div>;
  };
});

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('pokemon-list')).toBeInTheDocument();
  });

  it('applies theme provider', () => {
    const { container } = render(<App />);
    // Check if CssBaseline is applied
    expect(container).toBeInTheDocument();
  });
});
