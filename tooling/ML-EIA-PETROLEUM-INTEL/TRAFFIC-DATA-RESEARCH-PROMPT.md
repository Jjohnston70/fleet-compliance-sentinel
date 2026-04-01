# Traffic Data Research Prompt (Claude in Browser)

Use this prompt to map Colorado Springs traffic datasets into an ingest-ready spec.

```text
I need you to research two sources and produce an implementation-ready data brief for a forecasting pipeline:

1) CDOT OTIS Traffic Data Explorer
https://dtdapps.coloradodot.info/otis/trafficdata

2) CDOT ArcGIS dataset page
https://data-cdot.opendata.arcgis.com/maps/21dc746fafbf41c8a898d31b414cc3ea/about

Goal:
Find the best traffic datasets to use as exogenous variables for petroleum pricing and demand analytics in Colorado Springs and Fountain.

Please deliver:

A) Dataset inventory (table)
- dataset name
- source URL
- geographic granularity
- time granularity (hourly/daily/monthly/annual)
- available date range
- whether truck class or heavy-vehicle percentage exists
- download method (excel/csv/api/arcgis rest)
- update frequency
- licensing and usage limits

B) Exact fields to extract for modeling
- required columns (station_id, date, total_volume, truck_volume or truck_pct, route, direction, lat, lon, county, data_quality_flag)
- optional high-value columns
- field definitions as documented by source

C) Colorado Springs and Fountain coverage
- list likely relevant stations and corridors (I-25, US-24, CO-21/Powers, Academy, freight routes)
- identify which have the longest continuous history

D) Access instructions
- click-by-click export steps from OTIS
- if ArcGIS has REST/FeatureServer endpoint, provide exact query examples
- provide at least 2 direct downloadable links if available

E) Data quality risks
- missing periods
- station relocations or recalibrations
- differences between AADT and observed counts
- caveats for trend modeling

Output format:
1) Executive summary (10 bullets max)
2) Dataset table
3) Recommended starter pull section with minimum viable files to download this week
```

