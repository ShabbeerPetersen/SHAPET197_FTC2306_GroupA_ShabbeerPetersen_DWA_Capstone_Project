import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';

const LoadingCard = () => {
  return (
    <Card
      sx={{
        width: '100%',
        padding: 2,
        borderRadius: 8,
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
        textAlign: 'center',
      }}
    >
      <CardContent>
        <CircularProgress
          sx={{ color: '#3498db', marginBottom: 2 }}
          size={40}
          thickness={4}
        />
        <p>How about you Snorlax while we load your favourite podcasts ...</p>
      </CardContent>
    </Card>
  );
};

export default LoadingCard;
