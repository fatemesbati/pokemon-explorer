import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Skeleton, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useNavigate } from 'react-router-dom';
import { PokemonBasicInfo } from '../../types/pokemon';
import { formatPokemonName, isFavorite, toggleFavorite } from '../../services/api';

interface PokemonCardProps {
  pokemon: PokemonBasicInfo;
  index?: number;
  onFavoriteToggle?: () => void;
}

const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, index = 0, onFavoriteToggle }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [favorite, setFavorite] = React.useState(isFavorite(pokemon.id));

  const handleClick = () => {
  // Save scroll position before navigating
  sessionStorage.setItem('scrollPosition', window.scrollY.toString());
  // Save current list URL to return to (including search params for view mode)
  sessionStorage.setItem('listPageUrl', window.location.pathname + window.location.search);
  navigate(`/pokemon/${pokemon.id}`);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  const handleFavoriteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    const newStatus = toggleFavorite(pokemon.id);
    setFavorite(newStatus);
    if (onFavoriteToggle) {
      onFavoriteToggle();
    }
  };

  return (
    <Card
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${formatPokemonName(pokemon.name)}`}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        // Entrance animation
        animation: 'fadeInUp 0.5s ease-out forwards',
        animationDelay: `${index * 0.05}s`,
        opacity: 0,
        '@keyframes fadeInUp': {
          '0%': {
            opacity: 0,
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: 6,
        },
        '&:focus': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: '2px',
        },
      }}
    >
      {/* Favorite Button */}
      <IconButton
        onClick={handleFavoriteClick}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 10,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 1)',
          },
        }}
        aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        {favorite ? (
          <FavoriteIcon sx={{ color: 'error.main' }} />
        ) : (
          <FavoriteBorderIcon sx={{ color: 'text.secondary' }} />
        )}
      </IconButton>

      <Box
        sx={{
          position: 'relative',
          paddingTop: '100%',
          bgcolor: 'grey.50',
          overflow: 'hidden',
        }}
      >
        {!imageLoaded && !imageError && (
          <Skeleton
            variant="rectangular"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          />
        )}
        {!imageError ? (
          <CardMedia
            component="img"
            image={pokemon.imageUrl}
            alt={formatPokemonName(pokemon.name)}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              p: 2,
              display: imageLoaded ? 'block' : 'none',
              // Image fade in
              animation: imageLoaded ? 'fadeIn 0.3s ease-in' : 'none',
              '@keyframes fadeIn': {
                from: { opacity: 0 },
                to: { opacity: 1 },
              },
            }}
          />
        ) : (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.200',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No Image
            </Typography>
          </Box>
        )}
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 500, mb: 0.5 }}
        >
          #{pokemon.id.toString().padStart(3, '0')}
        </Typography>
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 600,
            textTransform: 'capitalize',
          }}
        >
          {formatPokemonName(pokemon.name)}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PokemonCard;