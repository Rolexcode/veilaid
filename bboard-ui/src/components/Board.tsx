import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import FingerprintRoundedIcon from '@mui/icons-material/FingerprintRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { type BBoardDerivedState, type DeployedBBoardAPI } from '../../../api/src/index';
import { useDeployedBoardContext } from '../hooks';
import { type BoardDeployment } from '../contexts';
import { type Observable } from 'rxjs';

export interface BoardProps {
  boardDeployment$?: Observable<BoardDeployment>;
}

const DEMO_GRANT_ID = new TextEncoder().encode('VEILAID-EMERGENCY-GRANT-2026'.padEnd(32, '\0'));
const MAXIMUM_INCOME = 10_000n;

const privacyFacts = [
  ['Enrollment', 'Proved privately', SchoolOutlinedIcon],
  ['Income ≤ $10,000', 'Exact amount hidden', LockOutlinedIcon],
  ['One claim per student', 'Anonymous nullifier', FingerprintRoundedIcon],
] as const;

export const Board: React.FC<Readonly<BoardProps>> = ({ boardDeployment$ }) => {
  const provider = useDeployedBoardContext();
  const [deployment, setDeployment] = useState<BoardDeployment>();
  const [api, setApi] = useState<DeployedBBoardAPI>();
  const [state, setState] = useState<BBoardDerivedState>();
  const [stage, setStage] = useState<'idle' | 'issuing' | 'issued' | 'proving' | 'approved'>('idle');
  const [error, setError] = useState<string>();
  const [copied, setCopied] = useState(false);

  const isWorking = stage === 'issuing' || stage === 'proving' || deployment?.status === 'in-progress';
  const shortAddress = useMemo(() => {
    const address = api?.deployedContractAddress;
    return address ? `${address.slice(0, 10)}…${address.slice(-8)}` : undefined;
  }, [api]);

  useEffect(() => {
    if (!boardDeployment$) return;
    const subscription = boardDeployment$.subscribe(setDeployment);
    return () => subscription.unsubscribe();
  }, [boardDeployment$]);

  useEffect(() => {
    if (!deployment || deployment.status === 'in-progress') return;
    if (deployment.status === 'failed') {
      setError(deployment.error.message || 'The Midnight contract could not be deployed.');
      return;
    }
    setApi(deployment.api);
    const subscription = deployment.api.state$.subscribe({
      next: setState,
      error: (cause: unknown) => setError(cause instanceof Error ? cause.message : String(cause)),
    });
    return () => subscription.unsubscribe();
  }, [deployment]);

  const issueCredential = useCallback(async () => {
    if (!api) return;
    setError(undefined);
    setStage('issuing');
    try {
      await api.issueDemoCredential();
      setStage('issued');
    } catch (cause: unknown) {
      setStage('idle');
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }, [api]);

  const claimGrant = useCallback(async () => {
    if (!api) return;
    setError(undefined);
    setStage('proving');
    try {
      await api.claimGrant(DEMO_GRANT_ID, MAXIMUM_INCOME);
      setStage('approved');
    } catch (cause: unknown) {
      setStage('issued');
      const message = cause instanceof Error ? cause.message : String(cause);
      setError(
        message.includes('already claimed')
          ? 'Duplicate claim blocked. This private credential has already claimed this grant.'
          : message,
      );
    }
  }, [api]);

  const copyContractAddress = useCallback(async () => {
    if (!api) return;
    await navigator.clipboard.writeText(api.deployedContractAddress);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }, [api]);

  if (!boardDeployment$) {
    return (
      <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card
            sx={{ height: '100%', bgcolor: 'primary.main', color: 'primary.contrastText', borderColor: 'primary.main' }}
          >
            <CardContent sx={{ p: { xs: 3, md: 5 }, '&:last-child': { pb: { xs: 3, md: 5 } } }}>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                <Chip
                  label="Live Midnight demo"
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,.12)', color: 'inherit' }}
                />
                <Chip label="PreProd" size="small" sx={{ bgcolor: 'rgba(255,255,255,.12)', color: 'inherit' }} />
              </Stack>
              <Typography variant="h2" sx={{ mt: 3, fontSize: { xs: '2rem', md: '3rem' } }}>
                Emergency Student Grant
              </Typography>
              <Typography sx={{ mt: 2, maxWidth: 560, color: 'rgba(255,255,255,.78)', lineHeight: 1.7 }}>
                One private proof confirms enrollment and financial eligibility. No documents are uploaded. No personal
                profile is written on-chain.
              </Typography>
              <Button
                variant="contained"
                color="inherit"
                startIcon={<AddRoundedIcon aria-hidden="true" />}
                onClick={() => provider.resolve()}
                aria-busy={deployment?.status === 'in-progress'}
                sx={{ mt: 4, color: 'primary.main', bgcolor: 'background.paper', px: 3 }}
              >
                Deploy VeilAid contract
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="overline" color="text.secondary">
                Publicly visible
              </Typography>
              <Stack spacing={2.5} sx={{ mt: 2 }}>
                <Metric label="Approved claims" value="0" />
                <Metric label="Student identities" value="0" />
                <Metric label="Income records" value="0" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  if (!api || !state) {
    return (
      <Card aria-busy="true">
        <LinearProgress />
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Skeleton width="30%" />
          <Skeleton height={68} width="70%" />
          <Skeleton height={120} />
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            {error ?? 'Connecting Lace, preparing private state, and deploying the Midnight contract…'}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, lg: 8 }}>
        <Card>
          {isWorking && <LinearProgress />}
          <CardContent sx={{ p: { xs: 3, md: 5 }, '&:last-child': { pb: { xs: 3, md: 5 } } }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Emergency Student Grant
                </Typography>
                <Typography variant="h2" sx={{ mt: 0.5, fontSize: { xs: '2rem', md: '2.8rem' } }}>
                  $500 in emergency support
                </Typography>
              </Box>
              <Chip
                label={stage === 'approved' ? 'Claim approved' : 'Applications open'}
                color={stage === 'approved' ? 'success' : 'default'}
              />
            </Stack>

            <Grid container spacing={2} sx={{ mt: 3 }}>
              {privacyFacts.map(([label, detail, Icon]) => (
                <Grid size={{ xs: 12, sm: 4 }} key={label}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(22,61,50,.055)', minHeight: 128 }}>
                    <Icon color="primary" aria-hidden="true" />
                    <Typography sx={{ mt: 1.5, fontWeight: 700 }}>{label}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {detail}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {error && (
              <Alert
                severity="error"
                sx={{ mt: 3 }}
                action={
                  <Button color="inherit" onClick={() => setError(undefined)}>
                    Dismiss
                  </Button>
                }
              >
                {error}
              </Alert>
            )}

            {stage === 'approved' && (
              <Alert icon={<CheckCircleOutlineRoundedIcon />} severity="success" sx={{ mt: 3 }}>
                Eligibility proved and claim accepted. Your name, exact income, and student record remained private.
              </Alert>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 4 }}>
              {stage === 'idle' || stage === 'issuing' ? (
                <Button
                  variant="contained"
                  onClick={issueCredential}
                  disabled={isWorking}
                  startIcon={
                    stage === 'issuing' ? <CircularProgress size={18} color="inherit" /> : <SchoolOutlinedIcon />
                  }
                >
                  {stage === 'issuing' ? 'Issuing private credential…' : 'Issue demo student credential'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={claimGrant}
                  disabled={isWorking}
                  startIcon={
                    stage === 'proving' ? <CircularProgress size={18} color="inherit" /> : <VerifiedUserOutlinedIcon />
                  }
                >
                  {stage === 'proving'
                    ? 'Generating private proof…'
                    : stage === 'approved'
                      ? 'Try duplicate claim'
                      : 'Prove eligibility privately'}
                </Button>
              )}
              <Button variant="text" href="https://docs.midnight.network/" target="_blank" rel="noreferrer">
                How Midnight protects this
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, lg: 4 }}>
        <Stack spacing={3}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="overline" color="text.secondary">
                On-chain transparency
              </Typography>
              <Stack divider={<Divider flexItem />} spacing={2.25} sx={{ mt: 2 }}>
                <Metric label="Credentials issued" value={state.issuedCount.toString()} />
                <Metric label="Claims approved" value={state.approvedClaimCount.toString()} />
                <Metric label="Private records exposed" value="0" />
              </Stack>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="overline" color="text.secondary">
                Contract
              </Typography>
              <Typography sx={{ mt: 1, fontFamily: 'ui-monospace, monospace', fontSize: 13 }}>
                {shortAddress}
              </Typography>
              <Button
                size="small"
                startIcon={<ContentCopyRoundedIcon aria-hidden="true" />}
                onClick={copyContractAddress}
                aria-label="Copy deployed contract address"
                sx={{ mt: 1.5 }}
              >
                <Box component="span" aria-live="polite">
                  {copied ? 'Copied!' : 'Copy address'}
                </Box>
              </Button>
            </CardContent>
          </Card>
        </Stack>
      </Grid>
    </Grid>
  );
};

const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 2 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h5" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
      {value}
    </Typography>
  </Box>
);
