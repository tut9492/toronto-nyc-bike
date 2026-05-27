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

## Routes

Two itineraries share the same Route 5 + Empire State Trail corridor — toggle in the viewer.

**Standard (7 days + 1 rest):**

| Day | To | Distance |
|-----|----|----|
| 1 | Buffalo | ~160 km |
| 2 | Rochester | ~175 km |
| 3 | Syracuse | ~165 km |
| 4+5 | Utica (+ rest day) | ~100 km |
| 6 | Albany | ~175 km |
| 7 | Poughkeepsie | ~160 km |
| 8 | New York City | ~130 km |

**Aggressive (5 riding days + rest after Syracuse, 200+ km days):**

| Day | To | Distance |
|-----|----|----|
| 1 | Batavia, NY | ~230 km |
| 2 | Syracuse | ~275 km (longest) |
| 3 | REST in Syracuse | 0 km |
| 4 | Amsterdam, NY | ~225 km |
| 5 | Poughkeepsie | ~215 km |
| 6 | New York City | ~130 km (arrival) |

**Excited Bike (3 days, do not actually do this):**

| Day | To | Distance |
|-----|----|----|
| 1 | Rochester | ~335 km |
| 2 | Albany | ~440 km |
| 3 | NYC | ~290 km |

## Bike playground

The map has a `🚲` you can move with the arrow keys (click the map first to focus). `SPACE` for a wheelie, `ENTER` for auto-ride along the route. Or click `▶ RIDE` / `🚲 WHEELIE` / `⟲ RESET` buttons.

## Updating the data

The source of truth is the Google My Map (`mid=1C_d0sZc9HCjrNrimUhRHixzdgWa5h8k`). To update:

1. Edit on mymaps.google.com
2. Re-export: `curl -sL "https://www.google.com/maps/d/kml?forcekml=1&mid=1C_d0sZc9HCjrNrimUhRHixzdgWa5h8k" -o route.kml`
3. Sync changes into the `DATA` object in `index.html`
