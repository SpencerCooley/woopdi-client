'use client';

import { Box, Typography, Card, CardContent, CardHeader, Paper } from '@mui/material';

interface Asset {
  id: number;
  filename: string;
  public_url: string;
  content_type: string;
  file_size: number;
  created_at: string;
  meta: any;
}

interface AssetGalleryProps {
  assets: Asset[];
  loading: boolean;
  title?: string;
  subheader?: string;
  onAssetClick?: (asset: Asset) => void;
}

export default function AssetGallery({
  assets,
  loading,
  title = "AI Generated Images Gallery",
  subheader,
  onAssetClick
}: AssetGalleryProps) {
  const handleAssetClick = (asset: Asset) => {
    if (onAssetClick) {
      onAssetClick(asset);
    } else {
      // Default behavior: open in new tab
      window.open(asset.public_url, '_blank');
    }
  };

  return (
    <Card sx={{ mt: 4, width: '100%' }}>
      <CardHeader
        title={title}
        subheader={subheader || `All your AI-generated images with logo overlay (${assets.length} assets)`}
      />
      <CardContent sx={{ width: '100%' }}>
        {loading ? (
          <Typography>Loading assets...</Typography>
        ) : assets.length === 0 ? (
          <Typography color="text.secondary" fontStyle="italic">
            No AI-generated images yet. Generate your first image above!
          </Typography>
        ) : (
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            width: '100%'
          }}>
            {assets.map((asset) => (
              <Paper
                key={asset.id}
                sx={{
                  flex: '1 1 200px',
                  maxWidth: '250px',
                  minWidth: '150px',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 3,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
                onClick={() => handleAssetClick(asset)}
              >
                <img
                  src={asset.public_url}
                  alt={asset.filename}
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px 8px 0 0',
                    display: 'block'
                  }}
                  onError={(e) => {
                    console.error('Gallery image failed to load:', asset.public_url);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all', mb: 1 }}>
                    <strong>{asset.filename}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID: {asset.id} • {new Date(asset.created_at).toLocaleDateString()}
                  </Typography>
                  {asset.meta?.prompt && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        mt: 1,
                        wordBreak: 'break-word'
                      }}
                    >
                      "{asset.meta.prompt}"
                    </Typography>
                  )}
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
