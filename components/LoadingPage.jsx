import CircularProgress from '@mui/material/CircularProgress';

const LoadingPage = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <CircularProgress size={80} thickness={4} />
      <p style={{ marginTop: 20 }}>Sorry for being such a SLOWPOKE, just gathering data</p>
    </div>
  );
};

export default LoadingPage;
