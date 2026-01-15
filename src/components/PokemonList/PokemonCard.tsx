import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Skeleton,
  IconButton,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useNavigate } from "react-router-dom";
import { PokemonBasicInfo } from "../../types/pokemon";
import {
  formatPokemonName,
  isFavorite,
  toggleFavorite,
} from "../../services/api";

interface PokemonCardProps {
  pokemon: PokemonBasicInfo;
  index?: number;
  onFavoriteToggle?: () => void;
}
const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemon,
  index = 0,
  onFavoriteToggle,
}) => {
  // Navigation hook for programmatic navigation
  const navigate = useNavigate();
  // Track if image has loaded (for fade-in effect)
  const [imageLoaded, setImageLoaded] = useState(false);
  // Track if image failed to load (show fallback)
  const [imageError, setImageError] = useState(false);
  // Favorite status (synced with localStorage)
  const [favorite, setFavorite] = useState(isFavorite(pokemon.id));

  const handleClick = () => {
    sessionStorage.setItem("scrollPosition", window.scrollY.toString());
    sessionStorage.setItem(
      "listPageUrl",
      window.location.pathname + window.location.search
    );
    navigate(`/pokemon/${pokemon.id}`);
  };

  // Handle favorite button click
  const handleFavoriteClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Don't trigger card navigation
    const newStatus = toggleFavorite(pokemon.id);
    setFavorite(newStatus);

    // Notify parent to update favorites count
    if (onFavoriteToggle) {
      onFavoriteToggle();
    }
  };

  return (
    <Card
      onClick={handleClick}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${formatPokemonName(pokemon.name)}`}
      sx={{
        cursor: "pointer",
        transition: "all 0.3s ease",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",

        // Staggered entrance animation
        animation: "fadeInUp 0.5s ease-out forwards",
        animationDelay: `${index * 0.05}s`,
        opacity: 0,

        "@keyframes fadeInUp": {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },

        // Hover effect
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: 6,
        },

        // Focus outline for accessibility
        "&:focus": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: "2px",
        },
      }}
    >
      {/* ===== FAVORITE BUTTON ===== */}
      {/* Positioned absolutely in top-right corner */}
      <IconButton
        onClick={handleFavoriteClick}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 10, // Above image
          bgcolor: "rgba(255, 255, 255, 0.9)",
          "&:hover": { bgcolor: "rgba(255, 255, 255, 1)" },
        }}
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
      >
        {favorite ? (
          <FavoriteIcon sx={{ color: "error.main" }} />
        ) : (
          <FavoriteBorderIcon sx={{ color: "text.secondary" }} />
        )}
      </IconButton>

      {/* ===== IMAGE CONTAINER ===== */}
      {/* Square aspect ratio container (1:1) */}
      <Box
        sx={{
          position: "relative",
          paddingTop: "100%",
          bgcolor: "grey.50",
          overflow: "hidden",
        }}
      >
        {/* Loading Skeleton */}
        {!imageLoaded && !imageError && (
          <Skeleton
            variant="rectangular"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          />
        )}

        {/* Actual Image */}
        {!imageError ? (
          <CardMedia
            component="img"
            image={pokemon.imageUrl}
            alt={formatPokemonName(pokemon.name)}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              p: 2,
              display: imageLoaded ? "block" : "none",

              // Fade-in animation when image loads
              animation: imageLoaded ? "fadeIn 0.3s ease-in" : "none",
              "@keyframes fadeIn": {
                from: { opacity: 0 },
                to: { opacity: 1 },
              },
            }}
          />
        ) : (
          // Fallback for failed image loads
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "grey.200",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No Image
            </Typography>
          </Box>
        )}
      </Box>

      {/* ===== CARD CONTENT ===== */}
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Pokemon Number */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 500, mb: 0.5 }}
        >
          #{pokemon.id.toString().padStart(3, "0")}
        </Typography>

        {/* Pokemon Name */}
        <Typography
          variant="h6"
          component="h2"
          sx={{ fontWeight: 600, textTransform: "capitalize" }}
        >
          {formatPokemonName(pokemon.name)}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PokemonCard;
