import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Pagination,
  Box,
  Alert,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GridViewIcon from '@mui/icons-material/GridView';
import { useSearchParams } from 'react-router-dom';
import PokemonCard from './PokemonCard';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import {
  fetchPokemonList,
  fetchPokemonDetail,
  transformPokemonList,
  calculateTotalPages,
  getFavorites,
  getPokemonSpriteUrl,
} from '../../services/api';
import { PokemonBasicInfo } from '../../types/pokemon';

const PokemonList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pokemonList, setPokemonList] = useState<PokemonBasicInfo[]>([]);
  const [allPokemonNames, setAllPokemonNames] = useState<PokemonBasicInfo[]>([]);
  const [favoritePokemon, setFavoritePokemon] = useState<PokemonBasicInfo[]>([]);
  const [filteredList, setFilteredList] = useState<PokemonBasicInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);

  // Get page from URL or default to 1
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  
  // Get view mode from URL or default to 'all'
  const urlViewMode = searchParams.get('view');
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>(
    urlViewMode === 'favorites' ? 'favorites' : 'all'
  );

  // Sync viewMode with URL
  useEffect(() => {
    const urlViewMode = searchParams.get('view');
    if (urlViewMode === 'favorites' && viewMode !== 'favorites') {
      setViewMode('favorites');
    } else if (!urlViewMode && viewMode !== 'all') {
      setViewMode('all');
    }
  }, [searchParams, viewMode]);

  // Load ALL Pokemon names once for search functionality
  useEffect(() => {
    const loadAllPokemonNames = async () => {
      try {
        // Fetch all Pokemon names (lightweight - only names and URLs)
        const response = await fetchPokemonList(1);
        const totalPokemon = response.count;
        
        // Fetch all Pokemon in one call
        const allPokemonResponse = await fetch(
          `https://pokeapi.co/api/v2/pokemon?limit=${totalPokemon}`
        );
        const allData = await allPokemonResponse.json();
        
        const allNames = transformPokemonList(allData.results);
        setAllPokemonNames(allNames);
      } catch (err) {
        console.error('Failed to load all Pokemon names:', err);
      }
    };

    loadAllPokemonNames();
  }, []);

  // Load regular Pokemon list
  useEffect(() => {
    const loadPokemon = async () => {
      try {
        if (initialLoad) {
          setLoading(true);
        } else {
          setBackgroundLoading(true);
        }
        setError(null);

        const data = await fetchPokemonList(currentPage);
        const transformedList = transformPokemonList(data.results);

        setPokemonList(transformedList);
        setTotalCount(data.count);
        
        // Update favorites count
        setFavoritesCount(getFavorites().length);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred. Please try again.'
        );
      } finally {
        setLoading(false);
        setBackgroundLoading(false);
        setInitialLoad(false);
      }
    };

    if (viewMode === 'all' && !searchQuery) {
      loadPokemon();
    } else if (viewMode === 'all' && searchQuery) {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [currentPage, viewMode, searchQuery, initialLoad]);

  // Load favorite Pokemon when switching to favorites view
  useEffect(() => {
    const loadFavorites = async () => {
      if (viewMode === 'favorites') {
        try {
          if (initialLoad) {
            setLoading(true);
          } else {
            setBackgroundLoading(true);
          }
          setError(null);

          const favoriteIds = getFavorites();
          
          if (favoriteIds.length === 0) {
            setFavoritePokemon([]);
            setLoading(false);
            setInitialLoad(false);
            return;
          }

          // Fetch all favorite Pokemon
          const favoritePromises = favoriteIds.map(async (id) => {
            try {
              const pokemon = await fetchPokemonDetail(id);
              return {
                id: pokemon.id,
                name: pokemon.name,
                url: `https://pokeapi.co/api/v2/pokemon/${pokemon.id}/`,
                imageUrl: getPokemonSpriteUrl(pokemon.id),
              };
            } catch (error) {
              console.error(`Failed to fetch Pokemon ${id}:`, error);
              return null;
            }
          });

          const favorites = await Promise.all(favoritePromises);
          const validFavorites = favorites.filter((p): p is PokemonBasicInfo => p !== null);
          
          setFavoritePokemon(validFavorites);
        } catch (err) {
          setError('Failed to load favorite Pokémon. Please try again.');
        } finally {
          setLoading(false);
          setBackgroundLoading(false);
          setInitialLoad(false);
        }
      }
    };

    loadFavorites();
  }, [viewMode, favoritesCount, initialLoad]);

  // Search across ALL Pokemon
  useEffect(() => {
    const searchPokemon = async () => {
      if (searchQuery.trim() === '') {
        // No search query - show current page or favorites
        if (viewMode === 'all') {
          setFilteredList(pokemonList);
        } else {
          setFilteredList(favoritePokemon);
        }
        return;
      }

      setSearchLoading(true);

      try {
        // Normalize search query - replace spaces with hyphens for matching
        const normalizedQuery = searchQuery.toLowerCase().trim().replace(/\s+/g, '-');
        
        if (viewMode === 'all') {
          // Search across ALL Pokemon
          const matchingPokemon = allPokemonNames.filter((pokemon) => {
            const pokemonName = pokemon.name.toLowerCase();
            // Match with hyphens OR spaces
            return pokemonName.includes(normalizedQuery) || 
                   pokemonName.replace(/-/g, ' ').includes(searchQuery.toLowerCase().trim());
          });
          setFilteredList(matchingPokemon);
        } else {
          // Search within favorites
          const filtered = favoritePokemon.filter((pokemon) => {
            const pokemonName = pokemon.name.toLowerCase();
            // Match with hyphens OR spaces
            return pokemonName.includes(normalizedQuery) || 
                   pokemonName.replace(/-/g, ' ').includes(searchQuery.toLowerCase().trim());
          });
          setFilteredList(filtered);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearchLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      searchPokemon();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, pokemonList, favoritePokemon, viewMode, allPokemonNames]);

  // Restore scroll position when returning from detail page
useEffect(() => {
  if (!loading && !backgroundLoading && (pokemonList.length > 0 || favoritePokemon.length > 0 || filteredList.length > 0)) {
    const savedScrollPosition = sessionStorage.getItem('scrollPosition');
    if (savedScrollPosition) {
      const targetPosition = parseInt(savedScrollPosition, 10);
      
      // Wait for images to load before scrolling
      const waitForImages = () => {
        const images = document.querySelectorAll('img');
        const imagePromises = Array.from(images).map((img) => {
          if (img.complete) {
            return Promise.resolve();
          }
          return new Promise((resolve) => {
            img.addEventListener('load', resolve);
            img.addEventListener('error', resolve);
            // Timeout after 2 seconds
            setTimeout(resolve, 2000);
          });
        });

        Promise.all(imagePromises).then(() => {
          // All images loaded, now scroll
          const startPosition = window.scrollY;
          const distance = targetPosition - startPosition;
          const duration = 300;
          let startTime: number | null = null;

          const animation = (currentTime: number) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            const ease = 1 - Math.pow(1 - progress, 3);
            
            window.scrollTo(0, startPosition + distance * ease);

            if (progress < 1) {
              requestAnimationFrame(animation);
            } else {
              sessionStorage.removeItem('scrollPosition');
            }
          };

          requestAnimationFrame(animation);
        });
      };

      // Start after a short delay to ensure DOM is ready
      setTimeout(waitForImages, 100);
      }
    }
  }, [loading, backgroundLoading, pokemonList, favoritePokemon, filteredList]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setSearchParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: 'all' | 'favorites' | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
      setSearchQuery(''); // Clear search when changing view mode
      // Update URL to include view mode
      if (newMode === 'favorites') {
        setSearchParams({ view: 'favorites' });
      } else {
        setSearchParams(currentPage > 1 ? { page: currentPage.toString() } : {});
      }
    }
  };

  const handleFavoriteToggle = () => {
    // Update favorites count when a favorite is toggled
    const newCount = getFavorites().length;
    setFavoritesCount(newCount);
    
    // If we're in favorites view, reload favorites
    if (viewMode === 'favorites') {
      // Trigger reload by toggling a state
      setViewMode('all');
      setTimeout(() => setViewMode('favorites'), 0);
    }
  };

  const totalPages = calculateTotalPages(totalCount);

  // Only show full loading on initial load
  if (loading && initialLoad) {
    return <LoadingSpinner message="Loading Pokémon..." />;
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRetry}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Background Loading Overlay */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={backgroundLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          Pokémon Explorer
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover and explore {totalCount.toLocaleString()} Pokémon
        </Typography>
      </Box>

      {/* View Mode Toggle */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="view mode"
          sx={{
            bgcolor: 'background.paper',
            boxShadow: 1,
          }}
        >
          <ToggleButton value="all" aria-label="all pokemon">
            <GridViewIcon sx={{ mr: 1 }} />
            All Pokémon
          </ToggleButton>
          <ToggleButton value="favorites" aria-label="favorites">
            <FavoriteIcon sx={{ mr: 1 }} />
            Favorites ({favoritesCount})
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Search Box */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <TextField
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search Pokémon by name across all pages..."
          variant="outlined"
          sx={{
            width: '100%',
            maxWidth: 600,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClearSearch}
                  edge="end"
                  size="small"
                  aria-label="clear search"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Loading indicator for search */}
      {searchLoading && (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Searching...
          </Typography>
        </Box>
      )}

      {/* No Results Message */}
      {filteredList.length === 0 && viewMode === 'favorites' && !searchQuery && !backgroundLoading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <FavoriteIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No favorites yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click the heart icon on any Pokémon card to add it to your favorites
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setViewMode('all')}
            sx={{ mt: 2 }}
          >
            Browse All Pokémon
          </Button>
        </Box>
      )}

      {filteredList.length === 0 && searchQuery && !searchLoading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Pokémon found matching "{searchQuery}"
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try searching with a different name
          </Typography>
          <Button
            variant="outlined"
            onClick={handleClearSearch}
            sx={{ mt: 2 }}
          >
            Clear Search
          </Button>
        </Box>
      )}

      {/* Pokemon Grid */}
      {filteredList.length > 0 && !searchLoading && (
        <>
          <Grid container spacing={3}>
            {filteredList.map((pokemon, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={pokemon.id}>
                <PokemonCard 
                  pokemon={pokemon} 
                  index={index}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              </Grid>
            ))}
          </Grid>

          {/* Search/Filter Results Info */}
          {(searchQuery || viewMode === 'favorites') && (
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {viewMode === 'favorites' && searchQuery
                  ? `Found ${filteredList.length} favorite Pokémon matching "${searchQuery}"`
                  : viewMode === 'favorites'
                  ? `Showing ${filteredList.length} favorite Pokémon`
                  : searchQuery
                  ? `Found ${filteredList.length} Pokémon matching "${searchQuery}" across all pages`
                  : ''}
              </Typography>
            </Box>
          )}
        </>
      )}

      {/* Pagination - Only show when not searching or filtering */}
      {!searchQuery && viewMode === 'all' && totalPages > 1 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 6,
            mb: 2,
          }}
        >
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}
          />
        </Box>
      )}

      {/* Page Info - Only show when not searching or filtering */}
      {!searchQuery && viewMode === 'all' && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Page {currentPage} of {totalPages}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default PokemonList;