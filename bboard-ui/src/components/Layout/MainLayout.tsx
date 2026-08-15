import React from 'react';
import { Box, Container } from '@mui/material';
import { Header } from './Header';

export const MainLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
    <Header />
    <Container component="main" maxWidth="lg" sx={{ py: { xs: 5, md: 9 } }}>
      {children}
    </Container>
  </Box>
);
