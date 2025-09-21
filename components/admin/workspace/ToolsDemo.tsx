'use client';

import { Box, Typography, useTheme } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import { toolService } from '@/services/api';
import { 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  CardHeader,
  Chip,
  Alert
} from '@mui/material';

interface TaskUpdate {
  task_id: string;
  message: string;
  type: string;
  timestamp: string;
  progress?: number;
  current?: number;
  total?: number;
}

export default function ToolsDemo() {
  const [timeInput, setTimeInput] = useState<string>('5');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [updates, setUpdates] = useState<TaskUpdate[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsRunning(true);
      setUpdates([]);
      setError(null);

      // Check if user is authenticated
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Please log in to use this feature.');
        setIsRunning(false);
        return;
      }

      // Run the example streaming task
      const result = await toolService.runToolTask('example_streaming', { duration: parseInt(timeInput) });
      console.log(result);
      setTaskId(result.task_id);
      connectWebSocket(result.task_id);

    } catch (err: any) {
      console.error('Error starting task:', err);

      // Handle authentication errors
      if (err.name === 'ApiError' && err.status === 401) {
        setError('Authentication failed. Please log in again.');
        localStorage.removeItem('accessToken'); // Clear invalid token
      } else {
        setError(err.message || 'Failed to start task. Please try again.');
      }
      setIsRunning(false);
    }
  };

const connectWebSocket = (taskId: string) => {
  setConnectionStatus('connecting');
  
  try {
    // Get the API base URL and clean it
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (!apiUrl) {
      throw new Error('NEXT_PUBLIC_API_URL environment variable is not set');
    }
    
    console.log('API_BASE_URL:', apiUrl);
    
    // Remove protocol from API URL to get host
    const apiHost = apiUrl.replace(/^https?:\/\//, '');
    
    // Determine WebSocket protocol
    const wsProtocol = apiUrl.startsWith('https://') ? 'wss://' : 'ws://';
    
    // Construct WebSocket URL
    const wsUrl = `${wsProtocol}${apiHost}/tools/task/${taskId}/ws`;
    
    console.log('Attempting WebSocket connection to:', wsUrl);
    
    // Create WebSocket connection
    const ws = new WebSocket(wsUrl);
    
    // Add connection timeout
    const connectionTimeout = setTimeout(() => {
      ws.close();
      setError('WebSocket connection timed out');
      setConnectionStatus('disconnected');
    }, 10000); // 10 second timeout
    
    ws.onopen = () => {
      clearTimeout(connectionTimeout);
      console.log('WebSocket connected successfully');
      setConnectionStatus('connected');
      setError(null);
    };
    
    ws.onmessage = (event) => {
      try {
        console.log('Received WebSocket message:', event.data);
        const update: TaskUpdate = JSON.parse(event.data);
        setUpdates(prev => [...prev, update]);
        
        // Check if task is complete
        if (update.type === 'task_end' || update.type === 'task_error') {
          setIsRunning(false);
          disconnectWebSocket();
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        setError('Error parsing server message');
      }
    };
    
    ws.onerror = (error) => {
      clearTimeout(connectionTimeout);
      console.error('WebSocket error:', error);
      setConnectionStatus('disconnected');
      setError(`WebSocket connection failed. Check if server is running on ${apiHost}`);
      setIsRunning(false);
    };
    
    ws.onclose = (event) => {
      clearTimeout(connectionTimeout);
      console.log('WebSocket closed. Code:', event.code, 'Reason:', event.reason);
      setConnectionStatus('disconnected');
      
      // Only show error if it wasn't a normal close
      if (event.code !== 1000 && event.code !== 1001) {
        setError(`WebSocket closed unexpectedly (Code: ${event.code})`);
      }
      
      setIsRunning(false);
    };
    
    wsRef.current = ws;
    
  } catch (error) {
    console.error('Error setting up WebSocket:', error);
    setError((error as Error).message || 'Failed to setup WebSocket connection');
    setConnectionStatus('disconnected');
    setIsRunning(false);
  }
};

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Streaming demo using websockets
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Left side - Form */}
        <Box sx={{ flex: 1 }}>
          <p>The request is made and a celery task is initialized. we subscribe to the updates using webscokets and push the updates to a react compoonent. This app does nothing and will just process for however many seconds you specify. The celery task is called example_streaming_task.py in the api app.</p>
          <br/>
          <Card sx={{ mb: 3 }}>
            <CardHeader 
              title="Task Runner" 
              subheader="Run a sleep task and monitor its progress in real-time"
            />
            <CardContent>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <TextField
                  label="Duration (seconds)"
                  type="number"
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                  InputProps={{ inputProps: { min: 1, max: 60 } }}
                  fullWidth
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isRunning}
                  size="large"
                >
                  {isRunning ? 'Running...' : 'Start Task'}
                </Button>
              </form>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Connection Status: 
                  <Chip 
                    label={connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)} 
                    color={connectionStatus === 'connected' ? 'success' : 
                           connectionStatus === 'connecting' ? 'warning' : 'error'} 
                    sx={{ ml: 1 }}
                  />
                </Typography>
                
                {taskId && (
                  <Typography variant="body2" color="text.secondary">
                    Task ID: <code>{taskId}</code>
                  </Typography>
                )}
              </Box>
              
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Box>
        
        {/* Right side - Progress */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardHeader 
              title="Task Updates" 
              subheader="Real-time updates from the running task"
            />
            <CardContent>
              {updates.length === 0 ? (
                <Typography color="text.secondary" fontStyle="italic">
                  No updates yet. Start a task to see real-time updates.
                </Typography>
              ) : (
                <Box 
                  sx={{ 
                    bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                    color: theme.palette.mode === 'dark' ? 'green.400' : 'grey.800',
                    fontFamily: 'monospace', 
                    fontSize: '0.875rem', 
                    p: 2, 
                    borderRadius: 1,
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}
                >
                  {updates.map((update, index) => (
                    <div key={index}>
                      [{new Date(update.timestamp).toLocaleTimeString()}] 
                      <span style={{
                        marginLeft: '8px',
                        color: update.type === 'stage_start' ? theme.palette.info.main :
                               update.type === 'stage_end' ? theme.palette.success.main :
                               update.type === 'progress' ? theme.palette.warning.main :
                               update.type === 'task_start' ? theme.palette.primary.main :
                               update.type === 'task_end' ? theme.palette.success.main :
                               update.type === 'task_error' ? theme.palette.error.main : theme.palette.text.primary
                      }}>
                        {update.message}
                      </span>
                      {update.progress !== undefined && (
                        <span style={{ 
                          marginLeft: '8px',
                          color: theme.palette.text.secondary 
                        }}>
                          ({Math.round(update.progress * 100)}%)
                        </span>
                      )}
                    </div>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
