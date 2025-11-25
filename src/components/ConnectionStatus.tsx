import { useEffect, useState } from 'react';
import { Box, Chip } from '@mui/material';
import { websocketService } from '../services/websocketService';

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(websocketService.isConnected());
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);

    websocketService.on('connect', checkConnection);
    websocketService.on('disconnect', checkConnection);

    return () => {
      clearInterval(interval);
      websocketService.off('connect', checkConnection);
      websocketService.off('disconnect', checkConnection);
    };
  }, []);

  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
      <Chip
        label={isConnected ? 'Connected' : 'Disconnected'}
        color={isConnected ? 'success' : 'error'}
        size="small"
      />
    </Box>
  );
}

