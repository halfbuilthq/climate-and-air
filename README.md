# Climate & Air Card for Home Assistant

[![HACS Default](https://img.shields.io/badge/HACS-Default-41BDF5.svg)](https://github.com/hacs/default)

A combined climate control, comfort trend and indoor air-quality card for
Home Assistant dashboards.

![Climate & Air Card preview](docs/climate-air-card-preview.png)

## Features

- Climate entity for current and target temperature
- Working target-temperature, HVAC-mode and fan-mode controls
- Indoor humidity ring with climate-attribute fallback
- Temperature and humidity history over 1–24 hours
- Mouse, touch and keyboard chart inspection with point-in-time tooltips
- Optional CO₂, PM2.5 and VOC readings
- Native Home Assistant visual configuration
- Responsive light and dark themes
- Available in the default HACS catalogue

## Configuration

```yaml
type: custom:climate-air-card
title: Family Room
entity: climate.family_room
humidity_entity: sensor.family_room_humidity
co2_entity: sensor.family_room_co2
pm25_entity: sensor.family_room_pm25
voc_entity: sensor.family_room_voc
history_hours: 6
show_history: true
```

Only `entity` is required. Humidity is shown only when `humidity_entity` is
configured. Each air-quality tile is likewise hidden when its entity is blank.

## HACS installation

The card is available in the default HACS catalogue; no custom repository is needed.

[![Open in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=halfbuilthq&repository=climate-and-air&category=plugin)

1. Select the button above, or open **HACS** in Home Assistant.
2. Search for **Climate & Air Card**.
3. Open the card and select **Download**.
4. Refresh your browser, then add **Climate & Air Card** from the dashboard card picker.

For updates, download the latest release when offered in HACS and refresh your
dashboard. HACS may take time to discover a newly published release.

## Development

```sh
npm install
npm run dev
```

Run all tests and build the production bundle:

```sh
npm run check
```

The bundle is emitted to `dist/climate-air-card.js`.

## Manual installation

1. Copy `dist/climate-air-card.js` to `<config>/www/climate-air-card.js`.
2. Add `/local/climate-air-card.js` as a JavaScript module dashboard resource.
3. Add **Climate & Air Card** from Home Assistant's card picker.

## License

[MIT](LICENSE)
