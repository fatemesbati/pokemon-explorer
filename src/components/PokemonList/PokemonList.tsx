import React, { useState, useEffect, useCallback } from 'react';
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
  Fade,
  Card,
  CardContent,
  Skeleton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GridViewIcon from '@mui/icons-material/GridView';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PokemonCard from './PokemonCard';
import {
  fetchPokemonList,
  fetchPokemonDetail,
  transformPokemonList,
  calculateTotalPages,
  getFavorites,
  getPokemonSpriteUrl,
} from '../../services/api';
import { PokemonBasicInfo } from '../../types/pokemon';

// Skeleton Card Component
const SkeletonCard: React.FC = () => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Skeleton variant="rectangular" sx={{ paddingTop: '100%' }} />
    <CardContent>
      <Skeleton variant="text" width="40%" sx={{ mb: 1 }} />
      <Skeleton variant="text" width="80%" />
    </CardContent>
  </Card>
);

const PokemonList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [pokemonList, setPokemonList] = useState<PokemonBasicInfo[]>([]);
  const [allPokemonNames, setAllPokemonNames] = useState<PokemonBasicInfo[]>([]);
  const [favoritePokemon, setFavoritePokemon] = useState<PokemonBasicInfo[]>([]);
  const [filteredList, setFilteredList] = useState<PokemonBasicInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Get page from URL or default to 1
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Get view mode from URL or default to 'all'
  const viewMode: 'all' | 'favorites' =
    searchParams.get('view') === 'favorites' ? 'favorites' : 'all';

  console.log('=== COMPONENT RENDER ===');
  console.log('viewMode:', viewMode);
  console.log('currentPage:', currentPage);
  console.log('searchQuery:', searchQuery);
  console.log('loading:', loading);
  console.log('showContent:', showContent);
  console.log('filteredList length:', filteredList.length);
  console.log('favoritePokemon length:', favoritePokemon.length);
  console.log('pokemonList length:', pokemonList.length);
  console.log('searchParams:', Object.fromEntries(searchParams));

  // Load ALL Pokemon names once for search functionality
  useEffect(() => {
    console.log('Effect: Load all pokemon names');
    const loadAllPokemonNames = async () => {
      try {
        const response = await fetchPokemonList(1);
        const totalPokemon = response.count;

        const allPokemonResponse = await fetch(
          `https://pokeapi.co/api/v2/pokemon?limit=${totalPokemon}`
        );
        const allData = await allPokemonResponse.json();

        const allNames = transformPokemonList(allData.results);
        setAllPokemonNames(allNames);
        console.log('All pokemon names loaded:', allNames.length);
      } catch (err) {
        console.error('Failed to load all Pokemon names:', err);
      }
    };

    loadAllPokemonNames();
  }, []);

  // Load regular Pokemon list
  useEffect(() => {
    console.log('Effect: Load regular pokemon list triggered');
    console.log('Condition - viewMode:', viewMode, 'searchQuery:', searchQuery);
    
    const loadPokemon = async () => {
      console.log('Loading pokemon for page:', currentPage);
      try {
        setLoading(true);
        setShowContent(false);
        setError(null);

        const data = await fetchPokemonList(currentPage);
        const transformedList = transformPokemonList(data.results);
        console.log('Transformed list length:', transformedList.length);

        setPokemonList(transformedList);
        setTotalCount(data.count);
        setFavoritesCount(getFavorites().length);

        // بلافاصله filteredList رو set کن
        if (searchQuery.trim() === '') {
          console.log('Setting filteredList to transformedList');
          setFilteredList(transformedList);
        }

        // Small delay for smooth transition
        setTimeout(() => {
          console.log('Setting showContent to true');
          setShowContent(true);
          setLoading(false);
          setIsInitialLoad(false);
        }, 200);
      } catch (err) {
        console.error('Error loading pokemon:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred. Please try again.'
        );
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    if (viewMode === 'all') {
      console.log('Calling loadPokemon()');
      loadPokemon();
    } else {
      console.log('Skipping loadPokemon - viewMode is:', viewMode);
    }
  }, [currentPage, viewMode, searchQuery]);

  // Load favorite Pokemon
  useEffect(() => {
    console.log('Effect: Load favorite pokemon triggered');
    console.log('viewMode:', viewMode);
    
    const loadFavorites = async () => {
      if (viewMode === 'favorites') {
        console.log('Loading favorites...');
        try {
          setLoading(true);
          setShowContent(false);
          setError(null);

          const favoriteIds = getFavorites();
          console.log('Favorite IDs:', favoriteIds);
          setFavoritesCount(favoriteIds.length);

          if (favoriteIds.length === 0) {
            console.log('No favorites found');
            setFavoritePokemon([]);
            setFilteredList([]);
            setTimeout(() => {
              console.log('No favorites - setting showContent true');
              setShowContent(true);
              setLoading(false);
              setIsInitialLoad(false);
            }, 200);
            return;
          }

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
          console.log('Valid favorites:', validFavorites.length);

          setFavoritePokemon(validFavorites);
          if (searchQuery.trim() === '') {
            console.log('Setting filteredList to favorites');
            setFilteredList(validFavorites);
          }

          setTimeout(() => {
            console.log('Favorites loaded - setting showContent true');
            setShowContent(true);
            setLoading(false);
            setIsInitialLoad(false);
          }, 200);
        } catch (err) {
          console.error('Error loading favorites:', err);
          setError('Failed to load favorite Pokémon. Please try again.');
          setLoading(false);
          setIsInitialLoad(false);
        }
      } else {
        console.log('Not in favorites view, resetting favorite state');
        // Reset favorite state when not in favorites view
        setFavoritePokemon([]);
      }
    };

    loadFavorites();
  }, [viewMode, searchQuery]);

  // Handle search
  useEffect(() => {
    console.log('Effect: Search triggered');
    console.log('searchQuery:', searchQuery, 'loading:', loading, 'viewMode:', viewMode);
    
    if (loading) {
      console.log('Skipping search - loading is true');
      return;
    }

    const performSearch = () => {
      console.log('Performing search...');
      
      if (searchQuery.trim() === '') {
        console.log('Search query is empty');
        // اگر سرچ خالی بود، لیست اصلی رو نشون بده
        if (viewMode === 'all') {
          console.log('Setting filteredList to pokemonList, length:', pokemonList.length);
          setFilteredList(pokemonList);
        } else {
          console.log('Setting filteredList to favoritePokemon, length:', favoritePokemon.length);
          setFilteredList(favoritePokemon);
        }
        return;
      }

      console.log('Searching for:', searchQuery);
      setSearchLoading(true);

      const normalizedQuery = searchQuery.toLowerCase().trim().replace(/\s+/g, '-');

      if (viewMode === 'all') {
        console.log('Searching in all pokemon names, count:', allPokemonNames.length);
        const matchingPokemon = allPokemonNames.filter((pokemon) => {
          const pokemonName = pokemon.name.toLowerCase();
          return pokemonName.includes(normalizedQuery) ||
            pokemonName.replace(/-/g, ' ').includes(searchQuery.toLowerCase().trim());
        });
        console.log('Found in all:', matchingPokemon.length);
        setFilteredList(matchingPokemon);
      } else {
        console.log('Searching in favorites, count:', favoritePokemon.length);
        const filtered = favoritePokemon.filter((pokemon) => {
          const pokemonName = pokemon.name.toLowerCase();
          return pokemonName.includes(normalizedQuery) ||
            pokemonName.replace(/-/g, ' ').includes(searchQuery.toLowerCase().trim());
        });
        console.log('Found in favorites:', filtered.length);
        setFilteredList(filtered);
      }

      setSearchLoading(false);
      console.log('Search completed');
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => {
      console.log('Clearing search timeout');
      clearTimeout(timeoutId);
    };
  }, [searchQuery, viewMode, pokemonList, favoritePokemon, allPokemonNames, loading]);

  // Handle page change
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    console.log('Page change to:', page);
    setSearchParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle retry on error
  const handleRetry = () => {
    console.log('Retry clicked');
    window.location.reload();
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Search input changed:', event.target.value);
    setSearchQuery(event.target.value);
  };

  // Handle clear search
  const handleClearSearch = () => {
    console.log('Clear search clicked');
    setSearchQuery('');
  };

  // Handle view mode change
  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: 'all' | 'favorites' | null
  ) => {
    console.log('View mode change clicked, newMode:', newMode);
    
    if (newMode) {
      setSearchQuery('');
      
      if (newMode === 'favorites') {
        console.log('Setting view to favorites');
        setSearchParams({ view: 'favorites' }, { replace: true });
      } else {
        console.log('Setting view to all');
        setSearchParams({}, { replace: true });
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(() => {
    console.log('Favorite toggle triggered');
    const newCount = getFavorites().length;
    console.log('New favorites count:', newCount);
    setFavoritesCount(newCount);
    
    // اگر در favorites view هستیم، state رو آپدیت کن
    if (viewMode === 'favorites') {
      console.log('Updating favorites list');
      const favoriteIds = getFavorites();
      
      if (favoriteIds.length === 0) {
        console.log('No favorites left, clearing lists');
        setFavoritePokemon([]);
        setFilteredList([]);
        return;
      }
      
      // فقط favoriteهای جدید رو fetch کن
      const fetchUpdatedFavorites = async () => {
        console.log('Fetching updated favorites');
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
        console.log('Updated favorites:', validFavorites.length);
        
        setFavoritePokemon(validFavorites);
        
        // اگر سرچی وجود داره، فیلتر کن
        if (searchQuery.trim() !== '') {
          console.log('Re-applying search filter');
          const normalizedQuery = searchQuery.toLowerCase().trim().replace(/\s+/g, '-');
          const filtered = validFavorites.filter((pokemon) => {
            const pokemonName = pokemon.name.toLowerCase();
            return pokemonName.includes(normalizedQuery) ||
              pokemonName.replace(/-/g, ' ').includes(searchQuery.toLowerCase().trim());
          });
          setFilteredList(filtered);
        } else {
          console.log('Setting filteredList to updated favorites');
          setFilteredList(validFavorites);
        }
      };
      
      fetchUpdatedFavorites();
    }
  }, [viewMode, searchQuery]);

  // Handle browse all button
  const handleBrowseAll = useCallback(() => {
    console.log('=== BROWSE ALL CLICKED ===');
    console.log('Current viewMode:', viewMode);
    console.log('Current searchParams:', Object.fromEntries(searchParams));
    
    // پاک کردن search query
    setSearchQuery('');
    
    console.log('Changing URL to root (all pokemon view)');
    // تغییر به view mode همه
    setSearchParams({}, { replace: true });
    
    // اسکرول به بالا
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    console.log('Browse all completed');
  }, [setSearchParams, viewMode, searchParams]);

  // Calculate total pages
  const totalPages = calculateTotalPages(totalCount);

  // Render loading skeletons
  if (loading && isInitialLoad) {
    console.log('Rendering initial loading skeletons');
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[...Array(20)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={`skeleton-${index}`}>
              <SkeletonCard />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  // Render error
  if (error) {
    console.log('Rendering error:', error);
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

  console.log('=== FINAL RENDER LOGIC ===');
  console.log('viewMode:', viewMode);
  console.log('filteredList empty?', filteredList.length === 0);
  console.log('searchQuery empty?', searchQuery === '');
  console.log('loading?', loading);
  console.log('searchLoading?', searchLoading);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Fade in={showContent} timeout={500}>
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
      </Fade>

      {/* View Mode Toggle */}
      <Fade in={showContent} timeout={600}>
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
      </Fade>

      {/* Search Box */}
      <Fade in={showContent} timeout={700}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <TextField
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={
              viewMode === 'all' 
                ? "Search Pokémon by name across all pages..." 
                : "Search in your favorites..."
            }
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
      </Fade>

      {/* Search loading indicator */}
      {searchLoading && (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Searching...
          </Typography>
        </Box>
      )}

      {/* No Favorites Message */}
      {!loading && viewMode === 'favorites' && filteredList.length === 0 && !searchQuery && (
        <Fade in={showContent} timeout={500}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <FavoriteIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No favorites yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Click the heart icon on any Pokémon card to add it to your favorites
            </Typography>
            <Button
              variant="contained"
              onClick={handleBrowseAll}
              size="large"
              sx={{ mt: 2 }}
            >
              Browse All Pokémon
            </Button>
          </Box>
        </Fade>
      )}

      {/* No Search Results */}
      {!loading && filteredList.length === 0 && searchQuery && !searchLoading && (
        <Fade in={showContent} timeout={500}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No Pokémon found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              No results for "{searchQuery}"
            </Typography>
            <Button
              variant="outlined"
              onClick={handleClearSearch}
              size="large"
              sx={{ mt: 2 }}
            >
              Clear Search
            </Button>
          </Box>
        </Fade>
      )}

      {/* Pokemon Grid */}
      {!loading && filteredList.length > 0 && (
        <Fade in={showContent} timeout={800}>
          <Box>
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

            {/* Results Count */}
            <Box sx={{ textAlign: 'center', mt: 4, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {viewMode === 'favorites' && searchQuery
                  ? `Found ${filteredList.length} favorite Pokémon matching "${searchQuery}"`
                  : viewMode === 'favorites'
                    ? `Showing ${filteredList.length} favorite Pokémon`
                    : searchQuery
                      ? `Found ${filteredList.length} Pokémon matching "${searchQuery}"`
                      : viewMode === 'all'
                        ? `Page ${currentPage} of ${totalPages} - ${filteredList.length} Pokémon`
                        : ''}
              </Typography>
            </Box>
          </Box>
        </Fade>
      )}

      {/* Pagination - فقط برای حالت همه پوکمون‌ها و بدون سرچ */}
      {!searchQuery && viewMode === 'all' && totalPages > 1 && (
        <Fade in={showContent} timeout={900}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
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
              sx={{ '& .MuiPaginationItem-root': { fontSize: '1rem' } }}
            />
          </Box>
        </Fade>
      )}

      {/* Page Info */}
      {!searchQuery && viewMode === 'all' && (
        <Fade in={showContent} timeout={1000}>
          <Box sx={{ textAlign: '-center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Page {currentPage} of {totalPages} • Total {totalCount.toLocaleString()} Pokémon
            </Typography>
          </Box>
        </Fade>
      )}
    </Container>
  );
};

export default PokemonList;