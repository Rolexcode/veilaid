import React from 'react';
import { AppBar, Box, Chip, Container, Typography } from '@mui/material';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

export const Header: React.FC = () => (
  <AppBar position="static" elevation={0} color="transparent" data-testid="header">
    <Container maxWidth="lg">
      <Box sx={{ minHeight: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }} data-testid="header-logo">
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <ShieldOutlinedIcon aria-hidden="true" />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 750, letterSpacing: '-0.03em', lineHeight: 1.1 }}>VeilAid</Typography>
            <Typography variant="caption" color="text.secondary">
              Prove eligibility, not identity.
            </Typography>
          </Box>
        </Box>
        <Chip label="Midnight PreProd" variant="outlined" size="small" />
      </Box>
    </Container>
  </AppBar>
);
