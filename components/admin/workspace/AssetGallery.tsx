'use client';

import { Box, Typography, Card, CardContent, CardHeader, Grid, Paper } from '@mui/material';

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
    <Card sx={{ mt: 4 }}>
      <CardHeader
        title={title}
        subheader={subheader || `All your AI-generated images with logo overlay (${assets.length} assets)`}
      />
      <CardContent>
        {loading ? (
          <Typography>Loading assets...</Typography>
        ) : assets.length === 0 ? (
          <Typography color="text.secondary" fontStyle="italic">
            No AI-generated images yet. Generate your first image above!
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {assets.map((asset) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={asset.id}>
                <Paper
                  sx={{
                    p: 2,
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
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '12px'
                    }}
                    onError={(e) => {
                      console.error('Gallery image failed to load:', asset.public_url);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <Typography variant="body2" noWrap>
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
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      "{asset.meta.prompt}"
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}
