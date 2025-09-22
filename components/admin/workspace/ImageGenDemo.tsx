'use client';

import { Box, Typography, useTheme } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import { toolService, assetService } from '@/services/api';
import AssetGallery from './AssetGallery';
import {
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Alert,
  Paper
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

interface ImageResult {
  status: string;
  asset_id: number;
  public_url: string;
  filename: string;
  message: string;
}

interface Asset {
  id: number;
  filename: string;
  public_url: string;
  content_type: string;
  file_size: number;
  created_at: string;
  meta: any;
}



export default function ImageGenDemo() {
  const [promptInput, setPromptInput] = useState<string>('A futuristic city skyline at sunset');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [updates, setUpdates] = useState<TaskUpdate[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [imageResult, setImageResult] = useState<ImageResult | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsRunning(true);
      setUpdates([]);
      setError(null);
      setImageResult(null);

      // Check if user is authenticated
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Please log in to use this feature.');
        setIsRunning(false);
        return;
      }

      // Run the image generation task
      const result = await toolService.runToolTask('generate_image_with_logo', {
        prompt: promptInput,
        guidance: 4.0,
        num_inference_steps: 50
      });
      console.log(result);
      setTaskId(result.task_id);
      connectWebSocket(result.task_id);

    } catch (err: any) {
      console.error('Error starting image generation:', err);

      // Handle authentication errors
      if (err.name === 'ApiError' && err.status === 401) {
        setError('Authentication failed. Please log in again.');
        localStorage.removeItem('accessToken'); // Clear invalid token
      } else {
        setError(err.message || 'Failed to start image generation. Please try again.');
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
        console.log('Received WebSocket message:', event.data);

        try {
          const messageData = JSON.parse(event.data);
          console.log('Parsed message data:', messageData);

          // Add to updates list
          const update: TaskUpdate = {
            task_id: messageData.task_id || taskId,
            message: messageData.message || event.data,
            type: messageData.type || 'info',
            timestamp: new Date().toISOString(),
            progress: messageData.progress,
            current: messageData.current,
            total: messageData.total
          };
          setUpdates(prev => [...prev, update]);

          // Check if this is the final result with image data
          if (messageData.data && messageData.data.public_url) {
            console.log('✅ Image ready, displaying:', messageData.data.public_url);
            setImageResult(messageData.data);
            setIsRunning(false);
            disconnectWebSocket();
          } else if (messageData.type === 'task_error') {
            console.log('❌ Task error:', messageData);
            setIsRunning(false);
            disconnectWebSocket();
          } else {
            console.log('📝 Regular update:', messageData.type, messageData.message);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error, 'Raw data:', event.data);
          // If it's not JSON, treat it as a plain message
          const update: TaskUpdate = {
            task_id: taskId,
            message: event.data,
            type: 'info',
            timestamp: new Date().toISOString()
          };
          setUpdates(prev => [...prev, update]);
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

  // Fetch AI-generated assets on component mount
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setAssetsLoading(true);
        const response = await assetService.getAssets({
          upload_source: 'ai_generation',
          limit: 20
        });
        setAssets(response.assets || []);
      } catch (err: any) {
        console.error('Error fetching AI-generated assets:', err);
        // Don't show error for assets loading failure - it's not critical
      } finally {
        setAssetsLoading(false);
      }
    };

    fetchAssets();

    return () => {
      disconnectWebSocket();
    };
  }, []);

  // Refresh assets when a new image is generated
  useEffect(() => {
    if (imageResult) {
      const refreshAssets = async () => {
        try {
          const response = await assetService.getAssets({
            upload_source: 'ai_generation',
            limit: 20
          });
          setAssets(response.assets || []);
        } catch (err: any) {
          console.error('Error refreshing assets:', err);
        }
      };

      // Small delay to ensure the new asset is saved to database
      setTimeout(refreshAssets, 2000);
    }
  }, [imageResult]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        AI Image Generation Demo
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Left side - Form */}
        <Box sx={{ flex: { xs: 'none', md: 1 } }}>
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Generate Image"
              subheader="A demo app showcasing AI model integration, database storage, and real-time progress updates via Celery tasks and WebSocket connections. The celery task can be found in the api tasks as generate_image_with_logo_task.py"
            />
            <CardContent>
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                <TextField
                  label="Prompt"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Describe the image you want to generate..."
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isRunning}
                  size="large"
                >
                  {isRunning ? 'Generating...' : 'Generate Image'}
                </Button>
              </Box>

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

        {/* Right side - Progress and Result */}
        <Box sx={{ flex: 1 }}>
          {/* Show progress only when no image result */}
          {!imageResult && (
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title="Generation Progress"
                subheader="Real-time updates from the image generation process"
              />
              <CardContent>
                {updates.length === 0 ? (
                  <Typography color="text.secondary" fontStyle="italic">
                    No updates yet. Generate an image to see real-time progress.
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
                      maxHeight: '300px',
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
          )}

          {/* Image Result */}
          {imageResult && (
            <Card>
              <CardHeader
                title="Generated Image"
                subheader="Your AI-generated image with logo overlay"
              />
              <CardContent>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                    borderRadius: 2
                  }}
                >
                  <img
                    src={imageResult.public_url}
                    alt="Generated"
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      height: 'auto',
                      borderRadius: '8px',
                      display: 'block',
                      margin: '0 auto',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }}
                    onError={(e) => {
                      console.error('Image failed to load:', imageResult.public_url);
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', imageResult.public_url);
                    }}
                  />

                  {/* Asset Metadata */}
                  <Box sx={{ mt: 3, p: 2, bgcolor: theme.palette.background.paper, borderRadius: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      Asset Details
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ flex: '1 1 200px' }}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Asset ID:</strong>
                        </Typography>
                        <Typography variant="body1">
                          {imageResult.asset_id}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: '1 1 200px' }}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Status:</strong>
                        </Typography>
                        <Chip
                          label={imageResult.status}
                          color={imageResult.status === 'completed' ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Filename:</strong>
                      </Typography>
                      <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                        {imageResult.filename}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Image URL:</strong>
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          wordBreak: 'break-all',
                          color: theme.palette.primary.main,
                          '&:hover': { textDecoration: 'underline', cursor: 'pointer' }
                        }}
                        onClick={() => window.open(imageResult.public_url, '_blank')}
                      >
                        {imageResult.public_url}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Message:</strong>
                      </Typography>
                      <Typography variant="body1">
                        {imageResult.message}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </CardContent>
            </Card>
          )}
        </Box>

      </Box>

      {/* Asset Gallery */}
      <AssetGallery
        assets={assets}
        loading={assetsLoading}
      />

    </Box>
  );
}
