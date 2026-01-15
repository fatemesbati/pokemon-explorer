import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FavoriteIcon from "@mui/icons-material/Favorite";
import GridViewIcon from "@mui/icons-material/GridView";
import { useSearchParams } from "react-router-dom";
import PokemonCard from "./PokemonCard";
import {
  fetchPokemonList,
  transformPokemonList,
  calculateTotalPages,
  getFavorites,
  fetchMultiplePokemon,
  searchPokemonByName,
} from "../../services/api";
import { PokemonBasicInfo } from "../../types/pokemon";

// Debounce delay for search input (ms)
const SEARCH_DEBOUNCE_MS = 300;

// Delay before showing content after loading (ms)
// WHY: Smooth transition, prevent flash of content
const CONTENT_TRANSITION_DELAY_MS = 200;

// Duration for scroll animation (ms)
const SCROLL_ANIMATION_DURATION_MS = 300;

// Timeout for waiting on images to load (ms)
const IMAGE_LOAD_TIMEOUT_MS = 2000;

// Number of skeleton cards to show while loading
const SKELETON_CARD_COUNT = 20;

// Skeleton placeholder card shown during loading
const SkeletonCard: React.FC = () => (
  <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
    <Skeleton variant="rectangular" sx={{ paddingTop: "100%" }} />
    <CardContent>
      <Skeleton variant="text" width="40%" sx={{ mb: 1 }} />
      <Skeleton variant="text" width="80%" />
    </CardContent>
  </Card>
);

const useScrollRestoration = (
  loading: boolean,
  pokemonList: PokemonBasicInfo[],
  favoritePokemon: PokemonBasicInfo[],
  filteredList: PokemonBasicInfo[]
) => {
  useEffect(() => {
    // Only restore if not loading and we have data
    if (
      !loading &&
      (pokemonList.length > 0 ||
        favoritePokemon.length > 0 ||
        filteredList.length > 0)
    ) {
      const savedScrollPosition = sessionStorage.getItem("scrollPosition");
      if (savedScrollPosition) {
        const targetPosition = parseInt(savedScrollPosition, 10);

        const waitForImages = () => {
          const images = document.querySelectorAll("img");
          const imagePromises = Array.from(images).map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
              img.addEventListener("load", resolve);
              img.addEventListener("error", resolve);
              setTimeout(resolve, IMAGE_LOAD_TIMEOUT_MS);
            });
          });

          Promise.all(imagePromises).then(() => {
            const startPosition = window.scrollY;
            const distance = targetPosition - startPosition;
            let startTime: number | null = null;

            // Smooth scroll animation using cubic easing
            const animation = (currentTime: number) => {
              if (startTime === null) startTime = currentTime;
              const timeElapsed = currentTime - startTime;
              const progress = Math.min(
                timeElapsed / SCROLL_ANIMATION_DURATION_MS,
                1
              );
              const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

              window.scrollTo(0, startPosition + distance * ease);

              if (progress < 1) {
                requestAnimationFrame(animation);
              } else {
                sessionStorage.removeItem("scrollPosition");
              }
            };

            requestAnimationFrame(animation);
          });
        };

        setTimeout(waitForImages, 100);
      }
    }
  }, [loading, pokemonList, favoritePokemon, filteredList]);
};

const PokemonList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const viewMode: "all" | "favorites" =
    searchParams.get("view") === "favorites" ? "favorites" : "all";

  // Main Pokemon list for current page (All Pokemon view)
  const [pokemonList, setPokemonList] = useState<PokemonBasicInfo[]>([]);

  // Favorite Pokemon list (Favorites view)
  const [favoritePokemon, setFavoritePokemon] = useState<PokemonBasicInfo[]>(
    []
  );

  // Filtered/searched results (used in both views)
  const [filteredList, setFilteredList] = useState<PokemonBasicInfo[]>([]);

  // Loading state for initial data fetch
  const [loading, setLoading] = useState(true);

  // Error message if API calls fail
  const [error, setError] = useState<string | null>(null);

  // Total count of all Pokemon (for pagination)
  const [totalCount, setTotalCount] = useState(0);

  // Current search query
  const [searchQuery, setSearchQuery] = useState("");

  // Count of favorited Pokemon (for display)
  const [favoritesCount, setFavoritesCount] = useState(0);

  // Loading state specifically for search operations
  const [searchLoading, setSearchLoading] = useState(false);

  // Controls fade-in animation of content
  const [showContent, setShowContent] = useState(false);

  // Flag to track if favorites are fully loaded (prevents premature "no favorites" message)
  const [favoritesFullyLoaded, setFavoritesFullyLoaded] = useState(false);

  // Trigger to force reload of favorites (incremented when favorites change)
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Loads paginated Pokemon list when in "All Pokemon" view without search
  useEffect(() => {
    const loadPokemon = async () => {
      try {
        setLoading(true);
        setShowContent(false);
        setError(null);

        // Fetch current page from API
        const data = await fetchPokemonList(currentPage);
        const transformedList = transformPokemonList(data.results);

        setPokemonList(transformedList);
        setTotalCount(data.count);
        setFavoritesCount(getFavorites().length);
        setFilteredList(transformedList);

        // Delay showing content for smooth transition
        setTimeout(() => {
          setShowContent(true);
          setLoading(false);
        }, CONTENT_TRANSITION_DELAY_MS);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred. Please try again."
        );
        setLoading(false);
      }
    };

    // Only load if in "all" view and no search query
    if (viewMode === "all" && !searchQuery) {
      loadPokemon();
    } else if (viewMode === "all" && searchQuery) {
      // If searching, don't show loading state (search handles it)
      setLoading(false);
      setShowContent(true);
    }
  }, [currentPage, viewMode, searchQuery]);

  // Loads favorite Pokemon when in "Favorites" view
  useEffect(() => {
    const loadFavorites = async () => {
      if (viewMode !== "favorites") return;

      try {
        const favoriteIds = getFavorites();
        setFavoritesCount(favoriteIds.length);

        // Check cache validity
        const cachedFavorites = sessionStorage.getItem("cachedFavorites");
        const cachedIds = sessionStorage.getItem("cachedFavoriteIds");

        if (cachedFavorites && cachedIds === JSON.stringify(favoriteIds)) {
          const parsed = JSON.parse(cachedFavorites);
          setFavoritePokemon(parsed);
          setFilteredList(parsed);
          setShowContent(true);
          setLoading(false);
          setFavoritesFullyLoaded(true);
          return;
        }

        setLoading(true);
        setShowContent(false);
        setError(null);

        if (favoriteIds.length === 0) {
          setFavoritePokemon([]);
          setFilteredList([]);
          sessionStorage.removeItem("cachedFavorites");
          sessionStorage.removeItem("cachedFavoriteIds");

          setTimeout(() => {
            setShowContent(true);
            setLoading(false);
            setFavoritesFullyLoaded(true);
          }, CONTENT_TRANSITION_DELAY_MS);
          return;
        }

        // Fetch all favorites using shared API
        const favorites = await fetchMultiplePokemon(favoriteIds);

        setFavoritePokemon(favorites);
        setFilteredList(favorites);

        sessionStorage.setItem("cachedFavorites", JSON.stringify(favorites));
        sessionStorage.setItem(
          "cachedFavoriteIds",
          JSON.stringify(favoriteIds)
        );

        setTimeout(() => {
          setShowContent(true);
          setLoading(false);
          setFavoritesFullyLoaded(true);
        }, CONTENT_TRANSITION_DELAY_MS);
      } catch {
        setError("Failed to load favorite Pokémon. Please try again.");
        setLoading(false);
        setFavoritesFullyLoaded(true);
      }
    };

    loadFavorites();
  }, [viewMode, reloadTrigger]);

  // Debounced search
  useEffect(() => {
    if (loading) return;

    const performSearch = async () => {
      const query = searchQuery.trim();

      // Empty search → restore current view list
      if (query === "") {
        setFilteredList(viewMode === "all" ? pokemonList : favoritePokemon);
        return;
      }

      setSearchLoading(true);

      const normalizedQuery = query.toLowerCase().trim().replace(/\s+/g, "-");

      try {
        if (viewMode === "all") {
          // Shared API → search for exact name
          const result = await searchPokemonByName(normalizedQuery);
          setFilteredList(result ? [result] : []);
        } else {
          // Local filter in favorites
          const filtered = favoritePokemon.filter(
            (pokemon) =>
              pokemon.name.toLowerCase().includes(normalizedQuery) ||
              pokemon.name.replace(/-/g, " ").includes(query.toLowerCase())
          );
          setFilteredList(filtered);
        }
      } catch (err) {
        console.error("Search error:", err);
        setFilteredList([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const timeoutId = setTimeout(performSearch, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, loading, favoritePokemon, viewMode, pokemonList]);

  useScrollRestoration(loading, pokemonList, favoritePokemon, filteredList);

  // Handle pagination page change
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setSearchParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle retry after error
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  /**
   * Handle search input change
   * Updates search query state (debounced search happens in useEffect)
   */
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Handle clear search button click
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Handle view mode toggle (All Pokemon / Favorites)
  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: "all" | "favorites" | null
  ) => {
    if (newMode) {
      setSearchQuery("");
      setSearchParams(newMode === "favorites" ? { view: "favorites" } : {}, {
        replace: true,
      });
    }
  };

  const handleFavoriteToggle = () => {
    setFavoritesCount(getFavorites().length);
    sessionStorage.removeItem("cachedFavorites");
    sessionStorage.removeItem("cachedFavoriteIds");
    if (viewMode === "favorites") {
      setReloadTrigger((prev) => prev + 1);
    }
  };

  const handleBrowseAll = () => {
    sessionStorage.removeItem("scrollPosition");
    sessionStorage.removeItem("cachedFavorites");
    sessionStorage.removeItem("cachedFavoriteIds");
    setSearchQuery("");
    setSearchParams({}, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = calculateTotalPages(totalCount);

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
      {/* Header Section */}
      <Fade in timeout={500}>
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: "primary.main",
              textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            Pokémon Explorer
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover and explore {totalCount.toLocaleString()} Pokémon
          </Typography>
        </Box>
      </Fade>

      {/* View Mode Toggle (All Pokemon / Favorites) */}
      <Fade in timeout={600}>
        <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
            sx={{ bgcolor: "background.paper", boxShadow: 1 }}
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
        <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
          <TextField
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search Pokémon by exact name (e.g., pikachu, charizard)..."
            variant="outlined"
            sx={{
              width: "100%",
              maxWidth: 600,
              "& .MuiOutlinedInput-root": { borderRadius: 3 },
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

      {/* Search Usage Hint */}
      {viewMode === "all" && (
        <Fade in timeout={750}>
          <Alert severity="info" sx={{ mb: 3, maxWidth: 600, mx: "auto" }}>
            <Typography variant="body2">
              <strong>Search Tip:</strong> Enter the exact Pokémon name for best
              results. Try: "pikachu", "charizard", "mewtwo"
            </Typography>
          </Alert>
        </Fade>
      )}

      {/* Loading Indicator for Search */}
      {searchLoading && (
        <Box sx={{ textAlign: "center", py: 2 }}>
          <CircularProgress size={40} sx={{ mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Searching for "{searchQuery}"...
          </Typography>
        </Box>
      )}

      {/* Skeleton Cards (Loading State) */}
      {loading && (
        <Fade in timeout={300}>
          <Grid container spacing={3}>
            {[...Array(SKELETON_CARD_COUNT)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={`skeleton-${index}`}>
                <SkeletonCard />
              </Grid>
            ))}
          </Grid>
        </Fade>
      )}

      {/* No Favorites Message */}
      {!loading &&
        favoritesFullyLoaded &&
        filteredList.length === 0 &&
        viewMode === "favorites" &&
        !searchQuery && (
          <Fade in timeout={500}>
            <Box sx={{ textAlign: "center", py: 8 }}>
              <FavoriteIcon
                sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No favorites yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click the heart icon on any Pokémon card to add it to your
                favorites
              </Typography>
              <Button
                variant="outlined"
                onClick={handleBrowseAll}
                sx={{ mt: 2 }}
              >
                Browse All Pokémon
              </Button>
            </Box>
          </Fade>
        )}

      {/* No Search Results */}
      {!loading &&
        filteredList.length === 0 &&
        searchQuery &&
        !searchLoading && (
          <Fade in timeout={500}>
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Pokémon found matching "{searchQuery}"
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Try the exact Pokémon name (e.g., "pikachu" not "pika")
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
            {(searchQuery || viewMode === "favorites") && (
              <Box sx={{ textAlign: "center", mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  {viewMode === "favorites" && searchQuery
                    ? `Found ${filteredList.length} favorite Pokémon matching "${searchQuery}"`
                    : viewMode === "favorites"
                    ? `Showing ${filteredList.length} favorite Pokémon`
                    : searchQuery
                    ? `Found: ${filteredList[0]?.name}`
                    : ""}
                </Typography>
              </Box>
            )}
          </Box>
        </Fade>
      )}

      {/* Pagination (Only for All Pokemon view without search) */}
      {!searchQuery && viewMode === "all" && totalPages > 1 && (
        <Fade in timeout={900}>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6, mb: 2 }}>
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
      {!searchQuery && viewMode === "all" && (
        <Fade in timeout={1000}>
          <Box sx={{ textAlign: "center", mt: 2 }}>
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