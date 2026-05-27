# Toronto → NYC Bike Trip

7-day cycling route from Toronto to New York City via Route 5 and the Empire State Trail. ~1,065 km.

## Run

```bash
open index.html
```

Or serve locally:
```bash
python3 -m http.server 8000
```

## What's here

- `index.html` — static viewer (Leaflet + OpenStreetMap). Sidebar tabs for Days, Hotels, Waypoints. Click a card to fly the map to it.
- `route.kml` — source data, exported from Google My Maps. The data inlined in `index.html` was derived from this.

## Route

| Day | To | Distance |
|-----|----|----|
| 1 | Buffalo | ~160 km |
| 2 | Rochester | ~175 km |
| 3 | Syracuse | ~165 km |
| 4+5 | Utica (+ rest day) | ~100 km |
| 6 | Albany | ~175 km |
| 7 | Poughkeepsie | ~160 km |
| 8 | New York City | ~130 km |

## Updating the data

The source of truth is the Google My Map (`mid=1C_d0sZc9HCjrNrimUhRHixzdgWa5h8k`). To update:

1. Edit on mymaps.google.com
2. Re-export: `curl -sL "https://www.google.com/maps/d/kml?forcekml=1&mid=1C_d0sZc9HCjrNrimUhRHixzdgWa5h8k" -o route.kml`
3. Sync changes into the `DATA` object in `index.html`
