/*
 * Copyright Contributors to Agones a Series of LF Projects, LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useAgonesInstalled } from '../hooks/useAgonesInstalled';

interface NotInstalledBannerProps {
  isLoading?: boolean;
}

function NotInstalledBanner({ isLoading = false }: NotInstalledBannerProps) {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={2} minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" p={2} minHeight="200px">
      <Grid container spacing={2} direction="column" justifyContent="center" alignItems="center">
        <Grid item>
          <Typography variant="h5">
            Agones was not detected on your cluster. If you haven&apos;t already, please install it.
          </Typography>
        </Grid>
        <Grid item>
          <Typography>
            Learn how to{' '}
            <Link
              href="https://agones.dev/site/docs/installation/install-agones/"
              target="_blank"
              rel="noopener noreferrer"
            >
              install
            </Link>{' '}
            Agones
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

interface AgonesInstallCheckProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AgonesInstallCheck({ children, fallback }: AgonesInstallCheckProps) {
  const { isAgonesInstalled, isAgonesCheckLoading } = useAgonesInstalled();

  if (!isAgonesInstalled) {
    return <>{fallback || <NotInstalledBanner isLoading={isAgonesCheckLoading} />}</>;
  }

  return <>{children}</>;
}
