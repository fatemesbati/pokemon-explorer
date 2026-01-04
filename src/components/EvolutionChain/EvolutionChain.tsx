import React from 'react';
import { Box, Typography, Avatar, Skeleton } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { EvolutionStage } from '../../types/pokemon';
import { formatPokemonName } from '../../services/api';

interface EvolutionChainProps {
  stages: EvolutionStage[];
  currentPokemonId: number;
}

const EvolutionChain: React.FC<EvolutionChainProps> = ({ stages, currentPokemonId }) => {
  const navigate = useNavigate();
  const [loadedImages, setLoadedImages] = React.useState<Set<number>>(new Set());

  const handleImageLoad = (id: number) => {
    setLoadedImages((prev) => new Set(prev).add(id));
  };

  const handleEvolutionClick = (id: number) => {
  if (id !== currentPokemonId) {
    // Don't save list URL when navigating between evolutions
    navigate(`/pokemon/${id}`);
    }
   };

  if (stages.length <= 1) {
    return null;
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Evolution Chain
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {stages.map((stage, index) => (
          <React.Fragment key={stage.id}>
            <Box
              onClick={() => handleEvolutionClick(stage.id)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: stage.id !== currentPokemonId ? 'pointer' : 'default',
                transition: 'transform 0.2s',
                p: 2,
                borderRadius: 2,
                bgcolor: stage.id === currentPokemonId ? 'primary.light' : 'transparent',
                border: stage.id === currentPokemonId ? '2px solid' : '2px solid transparent',
                borderColor: stage.id === currentPokemonId ? 'primary.main' : 'transparent',
                '&:hover': {
                  transform: stage.id !== currentPokemonId ? 'scale(1.1)' : 'none',
                  bgcolor: stage.id !== currentPokemonId ? 'grey.100' : 'primary.light',
                },
              }}
            >
              <Box sx={{ position: 'relative', width: 80, height: 80 }}>
                {!loadedImages.has(stage.id) && (
                  <Skeleton variant="circular" width={80} height={80} />
                )}
                <Avatar
                  src={stage.imageUrl}
                  alt={formatPokemonName(stage.name)}
                  onLoad={() => handleImageLoad(stage.id)}
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'grey.100',
                    display: loadedImages.has(stage.id) ? 'flex' : 'none',
                  }}
                />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  fontWeight: stage.id === currentPokemonId ? 700 : 500,
                  textTransform: 'capitalize',
                }}
              >
                {formatPokemonName(stage.name)}
              </Typography>
              {stage.minLevel && (
                <Typography variant="caption" color="text.secondary">
                  Lv. {stage.minLevel}
                </Typography>
              )}
            </Box>
            
            {index < stages.length - 1 && (
              <ArrowForwardIcon
                sx={{
                  color: 'text.secondary',
                  fontSize: 30,
                  display: { xs: 'none', sm: 'block' },
                }}
              />
            )}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

export default EvolutionChain;