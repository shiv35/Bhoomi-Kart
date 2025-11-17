import React from 'react';
import { Chip, Stack } from '@mui/material';
import { FilterList, Co2Outlined as EcoOutlined } from '@mui/icons-material';

interface FilterBadgeProps {
  filters: {
    category?: string;
    earth_score_min?: number;
    earth_score_max?: number;
  };
  onRemoveFilter: (filterType: string) => void;
}

const FilterBadge: React.FC<FilterBadgeProps> = ({ filters, onRemoveFilter }) => {
  return (
    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
      {filters.category && (
        <Chip
          icon={<FilterList />}
          label={`Category: ${filters.category}`}
          onDelete={() => onRemoveFilter('category')}
          color="primary"
          variant="outlined"
        />
      )}

      {filters.earth_score_min && (
        <Chip
          icon={<EcoOutlined />}
          label={`EarthScore ≥ ${filters.earth_score_min}`}
          onDelete={() => onRemoveFilter('earth_score')}
          color="success"
          variant="outlined"
        />
      )}

      {filters.earth_score_max && (
        <Chip
          label={`EarthScore ≤ ${filters.earth_score_max}`}
          onDelete={() => onRemoveFilter('earth_score_max')}
          color="warning"
          variant="outlined"
        />
      )}
    </Stack>
  );
};

export default FilterBadge;