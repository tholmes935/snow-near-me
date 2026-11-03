SNOW FINDER V2 — DEPLOYMENT

This is a deployable web app, NOT an App Store application.

To publish: On a computer, go to https://app.netlify.com/drop and drag the entire snow-finder-v2 folder into the drop area. If the Netlify drag-and-drop service does not build functions from your folder, connect a Git repository containing this folder instead and deploy with Netlify build settings (publish directory: .; functions directory: netlify/functions). The serverless function is REQUIRED for snow searches.

City search uses Open-Meteo geocoding (internet required). Snow reports are queried from the NOAA Regional Climate Centers ACIS network through a Netlify function. Data availability varies. This is an early prototype and station ID mappings, station coverage, observation freshness, and driving-time estimates require field testing before public launch.

No forecast snowfall is presented as confirmed. The app displays only positive numerical snow-depth observations dated within roughly 48 hours. It may miss real snow where no reporting station is included. Road miles and hours are ESTIMATES based on straight-line distance; real routing API is not yet connected.

Do not rely on the app alone to plan a snow trip. Verify conditions and roads before travel.
