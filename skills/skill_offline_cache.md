# Skill: PWA Offline Caching & Low-Bandwidth
TASK: Ensure offline playback in deep underground tunnels with zero latency.

RULES:
1. Cache Buckets:
   - `cuchi-static-v1`: App shell, CSS, JS, manifest, fonts.
   - `cuchi-audio-v1`: 5 pre-rendered `.mp3` station files (< 25MB total).
2. Fetch Interceptor:
   - Request to `/audio/stations/*` -> Cache-First with immediate return.
   - Request to `/data/*` -> Stale-While-Revalidate.
   - Request to `/api/ask` -> Network-Only with structured offline error fallback.
3. Storage Quota:
   - Evict oldest audio if total audio cache > 30MB.

OUTPUT: Instant offline playback under 0-bar cellular conditions.
