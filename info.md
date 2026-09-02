# Climate & Air Card

A Home Assistant dashboard card combining climate controls, comfort history,
humidity, and optional indoor air-quality sensors for one zone.

![Climate & Air Card preview](docs/climate-air-card-preview.png)

## Highlights

- Target-temperature, HVAC-mode, and fan-mode controls.
- Humidity ring and inspectable temperature/humidity history.
- Optional CO₂, PM2.5, and VOC readings.
- Native Home Assistant visual configuration.

## Minimal configuration

```yaml
type: custom:climate-air-card
entity: climate.family_room
```

See the repository README for all optional entities and settings.

