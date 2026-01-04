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
  Fade,
  Card,
  CardContent,
  Skeleton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GridViewIcon from '@mui/icons-material/GridView';
import { useSearchParams } from 'react-router-dom';
import PokemonCard from './PokemonCard';
import { useNavigate } from 'react-router-dom';
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
  const [favoritesFullyLoaded, setFavoritesFullyLoaded] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Get page from URL or default to 1
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Get view mode from URL or default to 'all'
  const urlViewMode = searchParams.get('view');
  // const [viewMode, setViewMode] = useState<'all' | 'favorites'>(
  //   urlViewMode === 'favorites' ? 'favorites' : 'all'
  // );
  const viewMode: 'all' | 'favorites' =
    searchParams.get('view') === 'favorites' ? 'favorites' : 'all';

  // Sync viewMode with URL and reset state
  // useEffect(() => {
  //   const urlViewMode = searchParams.get('view');

  //   if (urlViewMode === 'favorites') {
  //     if (viewMode !== 'favorites') {
  //       setViewMode('favorites');
  //     }
  //     // بلافاصله loading رو true کن
  //     setLoading(true);
  //     setFavoritesFullyLoaded(false);
  //   } else if (!urlViewMode && viewMode !== 'all') {
  //     setViewMode('all');
  //     setFavoritesFullyLoaded(false);
  //   }
  // }, [searchParams, viewMode]);

  // Load ALL Pokemon names once for search functionality
  useEffect(() => {
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
        setLoading(true);
        setShowContent(false);
        setError(null);

        const data = await fetchPokemonList(currentPage);
        const transformedList = transformPokemonList(data.results);

        setPokemonList(transformedList);
        setTotalCount(data.count);
        setFavoritesCount(getFavorites().length);

        // بلافاصله filteredList رو set کن - بدون debounce
        setFilteredList(transformedList);

        // Small delay for smooth transition
        setTimeout(() => {
          setShowContent(true);
          setLoading(false);
        }, 200);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred. Please try again.'
        );
        setLoading(false);
      }
    };

    if (viewMode === 'all' && !searchQuery) {
      loadPokemon();
    } else if (viewMode === 'all' && searchQuery) {
      setLoading(false);
      setShowContent(true);
    }
  }, [currentPage, viewMode, searchQuery]);

  // Load favorite Pokemon with caching
  useEffect(() => {
    const loadFavorites = async () => {
      if (viewMode === 'favorites') {
        try {
          const favoriteIds = getFavorites();
          setFavoritesCount(favoriteIds.length);

          // 1. Check if we have cached favorites
          const cachedFavorites = sessionStorage.getItem('cachedFavorites');
          const cachedIds = sessionStorage.getItem('cachedFavoriteIds');

          // If cache exists and IDs match, use cached data immediately
          if (cachedFavorites && cachedIds === JSON.stringify(favoriteIds)) {
            const parsed = JSON.parse(cachedFavorites);
            setFavoritePokemon(parsed);
            // بلافاصله filteredList رو set کن
            setFilteredList(parsed);
            setShowContent(true);
            setLoading(false);
            setFavoritesFullyLoaded(true);
            return;
          }

          // 2. No cache or IDs changed, show loading
          setLoading(true);
          setShowContent(false);
          setError(null);

          if (favoriteIds.length === 0) {
            setFavoritePokemon([]);
            setFilteredList([]);
            sessionStorage.removeItem('cachedFavorites');
            sessionStorage.removeItem('cachedFavoriteIds');
            setTimeout(() => {
              setShowContent(true);
              setLoading(false);
              setFavoritesFullyLoaded(true);
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

          setFavoritePokemon(validFavorites);
          // بلافاصله filteredList رو set کن
          setFilteredList(validFavorites);

          sessionStorage.setItem('cachedFavorites', JSON.stringify(validFavorites));
          sessionStorage.setItem('cachedFavoriteIds', JSON.stringify(favoriteIds));

          setTimeout(() => {
            setShowContent(true);
            setLoading(false);
            setFavoritesFullyLoaded(true);
          }, 200);
        } catch (err) {
          setError('Failed to load favorite Pokémon. Please try again.');
          setLoading(false);
          setFavoritesFullyLoaded(true);
        }
      }
    };

    loadFavorites();
  }, [viewMode, reloadTrigger]);

  // Search across ALL Pokemon - فقط برای search
  useEffect(() => {
    // اگر داره لود میشه، skip کن
    if (loading) return;

    const searchPokemon = async () => {
      // اگر search query خالیه، skip کن
      if (searchQuery.trim() === '') {
        return;
      }

      setSearchLoading(true);

      try {
        const normalizedQuery = searchQuery.toLowerCase().trim().replace(/\s+/g, '-');

        if (viewMode === 'all') {
          const matchingPokemon = allPokemonNames.filter((pokemon) => {
            const pokemonName = pokemon.name.toLowerCase();
            return pokemonName.includes(normalizedQuery) ||
              pokemonName.replace(/-/g, ' ').includes(searchQuery.toLowerCase().trim());
          });
          setFilteredList(matchingPokemon);
        } else {
          const filtered = favoritePokemon.filter((pokemon) => {
            const pokemonName = pokemon.name.toLowerCase();
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

    const timeoutId = setTimeout(() => {
      searchPokemon();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, loading, favoritePokemon, viewMode, allPokemonNames]);

  // Restore scroll position
  useEffect(() => {
    if (!loading && (pokemonList.length > 0 || favoritePokemon.length > 0 || filteredList.length > 0)) {
      const savedScrollPosition = sessionStorage.getItem('scrollPosition');
      if (savedScrollPosition) {
        const targetPosition = parseInt(savedScrollPosition, 10);

        const waitForImages = () => {
          const images = document.querySelectorAll('img');
          const imagePromises = Array.from(images).map((img) => {
            if (img.complete) {
              return Promise.resolve();
            }
            return new Promise((resolve) => {
              img.addEventListener('load', resolve);
              img.addEventListener('error', resolve);
              setTimeout(resolve, 2000);
            });
          });

          Promise.all(imagePromises).then(() => {
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

        setTimeout(waitForImages, 100);
      }
    }
  }, [loading, pokemonList, favoritePokemon, filteredList]);

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

  // const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: 'all' | 'favorites' | null) => {
  //   if (newMode !== null) {
  //     setViewMode(newMode);
  //     setSearchQuery('');
  //     if (newMode === 'favorites') {
  //       setSearchParams({ view: 'favorites' });
  //     } else {
  //       setSearchParams(currentPage > 1 ? { page: currentPage.toString() } : {});
  //     }
  //   }
  // };

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: 'all' | 'favorites' | null
  ) => {
    if (newMode) {
      changeViewMode(newMode);
    }
  };

  const handleFavoriteToggle = () => {
    const newCount = getFavorites().length;
    setFavoritesCount(newCount);

    // Clear cache because favorites changed
    sessionStorage.removeItem('cachedFavorites');
    sessionStorage.removeItem('cachedFavoriteIds');

    // اگر در favorites هستیم، فقط reload کن
    if (viewMode === 'favorites') {
      setReloadTrigger(prev => prev + 1);
    }
  };

  const totalPages = calculateTotalPages(totalCount);

  // const changeViewMode = (mode: 'all' | 'favorites') => {
  //   setViewMode(mode);
  //   setSearchQuery('');

  //   if (mode === 'favorites') {
  //     setSearchParams({ view: 'favorites' });
  //   } else {
  //     setSearchParams(currentPage > 1 ? { page: currentPage.toString() } : {});
  //   }
  // };

  const changeViewMode = (mode: 'all' | 'favorites') => {
    setSearchQuery('');

    if (mode === 'favorites') {
      setSearchParams({ view: 'favorites' }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const exitFavorites = () => {
    // reset favorites-related state
    setFavoritesFullyLoaded(false);
    setFilteredList([]);
    setFavoritePokemon([]);
    setLoading(true);

    setSearchParams({}, { replace: true });
  };

  const navigate = useNavigate();


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
      {/* Header */}
      <Fade in timeout={500}>
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
      <Fade in timeout={600}>
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
      <Fade in timeout={700}>
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
      </Fade>

      {/* Loading indicator for search */}
      {searchLoading && (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <CircularProgress size={40} sx={{ mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Searching...
          </Typography>
        </Box>
      )}

      {/* Skeleton Cards while loading */}
      {loading && (
        <Fade in timeout={300}>
          <Grid container spacing={3}>
            {[...Array(20)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={`skeleton-${index}`}>
                <SkeletonCard />
              </Grid>
            ))}
          </Grid>
        </Fade>
      )}

      {/* No Favorites Message */}
      {!loading && favoritesFullyLoaded && filteredList.length === 0 && viewMode === 'favorites' && !searchQuery && (
        <Fade in timeout={500}>
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
              onClick={() => navigate('/', { replace: true })}
              sx={{ mt: 2 }}
            >
              Browse All Pokémon
            </Button>
          </Box>
        </Fade>
      )}

      {/* No Search Results */}
      {!loading && filteredList.length === 0 && searchQuery && !searchLoading && (
        <Fade in timeout={500}>
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
        </Fade>
      )}

      {/* Pokemon Grid */}
      {!loading && filteredList.length > 0 && !searchLoading && (
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

            {/* Results Info */}
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
          </Box>
        </Fade>
      )}

      {/* Pagination */}
      {!searchQuery && viewMode === 'all' && totalPages > 1 && (
        <Fade in timeout={900}>
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
        </Fade>
      )}

      {/* Page Info */}
      {!searchQuery && viewMode === 'all' && (
        <Fade in timeout={1000}>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Page {currentPage} of {totalPages}
            </Typography>
          </Box>
        </Fade>
      )}
    </Container>
  );
};

export default PokemonList;