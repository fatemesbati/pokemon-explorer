import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Grid,
  LinearProgress,
  Button,
  Alert,
  Divider,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import EvolutionChain from "../EvolutionChain/EvolutionChain";
import {
  fetchPokemonDetail,
  formatPokemonName,
  formatStatName,
  getEvolutionChain,
  isFavorite,
  toggleFavorite,
} from "../../services/api";
import { Pokemon, TYPE_COLORS, EvolutionStage } from "../../types/pokemon";

// Maximum possible base stat value for any Pokemon stat
// WHY: Used to calculate percentage for progress bars
// SOURCE: Pokemon game mechanics (255 is theoretical max)
const MAX_STAT = 255;
const PokemonDetail: React.FC = () => {
  // Extract Pokemon ID from URL (e.g., /pokemon/25 → id = "25")
  const { id } = useParams<{ id: string }>();

  // Navigation hook for programmatic navigation
  const navigate = useNavigate();

  // Pokemon data object (null until loaded)
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);

  // Evolution chain stages array
  const [evolutionStages, setEvolutionStages] = useState<EvolutionStage[]>([]);

  // Loading state for initial data fetch
  const [loading, setLoading] = useState(true);

  // Error message if API call fails
  const [error, setError] = useState<string | null>(null);

  // Image loading state (for smooth fade-in)
  const [imageLoaded, setImageLoaded] = useState(false);

  // Favorite status (synced with localStorage)
  const [favorite, setFavorite] = useState(false);

  // Runs when component mounts or when ID changes
  useEffect(() => {
    const loadPokemonDetail = async () => {
      // Validate ID exists
      if (!id) {
        setError("Invalid Pokemon ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch main Pokemon data
        const data = await fetchPokemonDetail(id);
        setPokemon(data);

        // Check favorite status from localStorage
        setFavorite(isFavorite(data.id));

        // Fetch evolution chain (async)
        const evolutions = await getEvolutionChain(data.id);
        setEvolutionStages(evolutions);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load Pokemon details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPokemonDetail();
  }, [id]);

  // Handle back button click
  const handleBack = () => {
    const listPageUrl = sessionStorage.getItem("listPageUrl");
    if (listPageUrl) {
      navigate(listPageUrl);
    } else {
      navigate("/");
    }
  };

  // Handle retry button click after error
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  // Handle favorite toggle button click
  const handleFavoriteToggle = () => {
    if (pokemon) {
      const newStatus = toggleFavorite(pokemon.id);
      setFavorite(newStatus);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading Pokémon details..." />;
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back to List
        </Button>
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

  if (!pokemon) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back to List
        </Button>
        <Alert severity="info">Pokemon not found.</Alert>
      </Container>
    );
  }

  // Get high-quality official artwork, fallback to sprite
  const mainImage =
    pokemon.sprites.other?.["official-artwork"]?.front_default ||
    pokemon.sprites.front_default;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header: Back Button and Favorite Toggle */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="outlined"
        >
          Back to List
        </Button>
        <IconButton
          onClick={handleFavoriteToggle}
          sx={{
            bgcolor: "background.paper",
            boxShadow: 2,
            "&:hover": {
              bgcolor: "background.paper",
              boxShadow: 4,
            },
          }}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        >
          {favorite ? (
            <FavoriteIcon sx={{ color: "error.main", fontSize: 30 }} />
          ) : (
            <FavoriteBorderIcon
              sx={{ color: "text.secondary", fontSize: 30 }}
            />
          )}
        </IconButton>
      </Box>

      {/* Main Content Card */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          // Smooth entrance animation
          animation: "fadeInScale 0.4s ease-out",
          "@keyframes fadeInScale": {
            "0%": {
              opacity: 0,
              transform: "scale(0.95)",
            },
            "100%": {
              opacity: 1,
              transform: "scale(1)",
            },
          },
        }}
      >
        {/* ===== HEADER SECTION ===== */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          {/* Pokemon Number */}
          <Typography variant="h6" color="text.secondary" gutterBottom>
            #{pokemon.id.toString().padStart(3, "0")}
          </Typography>

          {/* Pokemon Name */}
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              textTransform: "capitalize",
              color: "primary.main",
            }}
          >
            {formatPokemonName(pokemon.name)}
          </Typography>

          {/* Type Badges */}
          <Box
            sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 3 }}
          >
            {pokemon.types.map((type) => (
              <Chip
                key={type.type.name}
                label={type.type.name}
                sx={{
                  bgcolor: TYPE_COLORS[type.type.name] || "#777",
                  color: "white",
                  fontWeight: 600,
                  textTransform: "capitalize",
                  fontSize: "0.9rem",
                  px: 1,
                }}
              />
            ))}
          </Box>

          {/* Pokemon Image */}
          {mainImage && (
            <Box
              sx={{
                position: "relative",
                width: "100%",
                maxWidth: 300,
                margin: "0 auto",
                mb: 3,
              }}
            >
              {/* Loading Placeholder */}
              {!imageLoaded && (
                <Box
                  sx={{
                    width: "100%",
                    height: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "grey.100",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Loading image...
                  </Typography>
                </Box>
              )}

              {/* Actual Image */}
              <img
                src={mainImage}
                alt={formatPokemonName(pokemon.name)}
                onLoad={() => setImageLoaded(true)}
                style={{
                  width: "100%",
                  height: "auto",
                  display: imageLoaded ? "block" : "none",
                }}
              />
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* ===== EVOLUTION CHAIN SECTION ===== */}
        {/* Only show if Pokemon has evolutions */}
        {evolutionStages.length > 0 && (
          <>
            <EvolutionChain
              stages={evolutionStages}
              currentPokemonId={pokemon.id}
            />
            <Divider sx={{ my: 3 }} />
          </>
        )}

        {/* ===== PHYSICAL ATTRIBUTES SECTION ===== */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Height */}
          <Grid item xs={6}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Height
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {(pokemon.height / 10).toFixed(1)} m
              </Typography>
            </Paper>
          </Grid>

          {/* Weight */}
          <Grid item xs={6}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Weight
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {(pokemon.weight / 10).toFixed(1)} kg
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* ===== ABILITIES SECTION ===== */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Abilities
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {pokemon.abilities.map((ability) => (
              <Chip
                key={ability.ability.name}
                label={formatPokemonName(ability.ability.name)}
                variant={ability.is_hidden ? "outlined" : "filled"}
                color={ability.is_hidden ? "secondary" : "primary"}
                sx={{
                  fontSize: "0.9rem",
                  fontWeight: 500,
                }}
              />
            ))}
          </Box>

          {/* Hidden Abilities Note */}
          {pokemon.abilities.some((a) => a.is_hidden) && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1 }}
            >
              * Outlined abilities are hidden abilities
            </Typography>
          )}
        </Box>

        {/* ===== BASE STATS SECTION ===== */}
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Base Stats
          </Typography>

          {/* Individual Stats with Progress Bars */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {pokemon.stats.map((stat) => (
              <Box key={stat.stat.name}>
                {/* Stat Name and Value */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatStatName(stat.stat.name)}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {stat.base_stat}
                  </Typography>
                </Box>

                {/* Progress Bar */}
                <LinearProgress
                  variant="determinate"
                  value={(stat.base_stat / MAX_STAT) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    bgcolor: "grey.200",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 1,
                      // Color based on stat value
                      bgcolor:
                        stat.base_stat >= 100
                          ? "success.main" // Green for high stats
                          : stat.base_stat >= 60
                          ? "primary.main" // Blue for medium stats
                          : "warning.main", // Orange for low stats
                    },
                  }}
                />
              </Box>
            ))}
          </Box>

          {/* Total Stats Summary */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: "primary.light",
              borderRadius: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Total
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default PokemonDetail;
