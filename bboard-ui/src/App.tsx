import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { MainLayout, Board } from './components';
import { useDeployedBoardContext } from './hooks';
import { type BoardDeployment } from './contexts';
import { type Observable } from 'rxjs';

const App: React.FC = () => {
  const provider = useDeployedBoardContext();
  const [deployments, setDeployments] = useState<Array<Observable<BoardDeployment>>>([]);

  useEffect(() => {
    const subscription = provider.boardDeployments$.subscribe(setDeployments);
    return () => subscription.unsubscribe();
  }, [provider]);

  return (
    <MainLayout>
      <Box sx={{ maxWidth: 760, mb: { xs: 5, md: 7 } }}>
        <Typography variant="overline" color="primary" sx={{ fontWeight: 750, letterSpacing: '0.12em' }}>
          Private student aid
        </Typography>
        <Typography variant="h1" sx={{ mt: 1, fontSize: { xs: '2.8rem', md: '4.8rem' }, lineHeight: 0.98 }}>
          Your hardship is not public data.
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ mt: 3, maxWidth: 620, fontSize: { xs: '1rem', md: '1.15rem' }, lineHeight: 1.7 }}
        >
          Prove that you qualify for emergency support without exposing your name, income, or academic record. Midnight
          verifies the facts and prevents duplicate claims.
        </Typography>
      </Box>

      {deployments.map((deployment, index) => (
        <Board boardDeployment$={deployment} key={index} />
      ))}
      {deployments.length === 0 && <Board />}
    </MainLayout>
  );
};

export default App;
