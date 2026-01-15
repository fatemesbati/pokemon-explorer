import React, { useState } from "react";
import { Box, Typography, Avatar, Skeleton } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";
import { EvolutionStage } from "../../types/pokemon";
import { formatPokemonName } from "../../services/api";

interface EvolutionChainProps {
  stages: EvolutionStage[];
  currentPokemonId: number;
}

const EvolutionChain: React.FC<EvolutionChainProps> = ({
  stages,
  currentPokemonId,
}) => {
  const navigate = useNavigate();
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const handleImageLoad = (id: number) => {
    setLoadedImages((prev) => new Set(prev).add(id));
  };

  const handleEvolutionClick = (id: number) => {
    if (id !== currentPokemonId) {
      navigate(`/pokemon/${id}`);
    }
  };

  if (stages.length <= 1) {
    return null;
  }

  return (
    <Box sx={{ mb: 4 }}>
      {/* Section Title */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Evolution Chain
      </Typography>

      {/* Evolution Stages Container */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {stages.map((stage, index) => (
          <React.Fragment key={stage.id}>
            {/* ===== EVOLUTION STAGE BOX ===== */}
            <Box
              onClick={() => handleEvolutionClick(stage.id)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: stage.id !== currentPokemonId ? "pointer" : "default",
                transition: "transform 0.2s",
                p: 2,
                borderRadius: 2,

                // Highlight current Pokemon
                bgcolor:
                  stage.id === currentPokemonId
                    ? "primary.light"
                    : "transparent",
                border:
                  stage.id === currentPokemonId
                    ? "2px solid"
                    : "2px solid transparent",
                borderColor:
                  stage.id === currentPokemonId
                    ? "primary.main"
                    : "transparent",

                // Hover effect (only for other evolutions)
                "&:hover": {
                  transform:
                    stage.id !== currentPokemonId ? "scale(1.1)" : "none",
                  bgcolor:
                    stage.id !== currentPokemonId
                      ? "grey.100"
                      : "primary.light",
                },
              }}
            >
              {/* Pokemon Image */}
              <Box sx={{ position: "relative", width: 80, height: 80 }}>
                {/* Loading Skeleton */}
                {!loadedImages.has(stage.id) && (
                  <Skeleton variant="circular" width={80} height={80} />
                )}

                {/* Actual Image */}
                <Avatar
                  src={stage.imageUrl}
                  alt={formatPokemonName(stage.name)}
                  onLoad={() => handleImageLoad(stage.id)}
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "grey.100",
                    display: loadedImages.has(stage.id) ? "flex" : "none",
                  }}
                />
              </Box>

              {/* Pokemon Name */}
              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  fontWeight: stage.id === currentPokemonId ? 700 : 500,
                  textTransform: "capitalize",
                }}
              >
                {formatPokemonName(stage.name)}
              </Typography>

              {/* Evolution Level */}
              {/* Only show if evolution requires leveling */}
              {stage.minLevel && (
                <Typography variant="caption" color="text.secondary">
                  Lv. {stage.minLevel}
                </Typography>
              )}
            </Box>

            {/* ===== ARROW SEPARATOR ===== */}
            {/* Show between stages, hide on mobile */}
            {index < stages.length - 1 && (
              <ArrowForwardIcon
                sx={{
                  color: "text.secondary",
                  fontSize: 30,
                  display: { xs: "none", sm: "block" }, // Hide on mobile
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
