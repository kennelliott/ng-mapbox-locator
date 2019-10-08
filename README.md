## Using this component

There are two ways to start a map. The DOM method, and the JS method. Both accept the same options

- `styleId` accepts a number of keywords that determines a map style endpoint
- `mapOptions` accepts anything that a `mapboxgl.Map()` function accepts.
- `mapFeatures` is an array of mapbox style layers and accepts anything those do. If using an `icon-image`, the ID is the filename of a .png, without extension. This file is deployed with this project.
- `iconRoot` can be used to override the default base path for all `icon-image`


### DOM Method

The Locator Tool will autogenerate scripts, styles and a config. The `data-ng-locator-map` attribute within a `<div>` identifies a container to turn into a locator. Inside that, a `data-ng-locator-map-options` attribute within a `<script>` contains options to configure the map. Like so:

```
<div data-ng-locator-map>
<script type="text/json" data-ng-locator-map-options>
{
    "styleId": "travel",
    "mapOptions": {
        "center": [
            -1.0079999356111387,
            14.817030865093983
        ],
        "zoom": 1.4932965015735384,
        "maxBounds": [
            [
                -84.17475060580158,
                -32.97726022142892
            ],
            [
                82.15875073459256,
                54.30708929643433
            ]
        ]
    },
    "mapFeatures": [
        {
            "id": "point-1570137469368",
            "type": "symbol",
            "source": {
                "type": "geojson",
                "data": {
                    "type": "FeatureCollection",
                    "features": [
                        {
                            "type": "Feature",
                            "geometry": {
                                "type": "Point",
                                "coordinates": [
                                    -5.0079999356169083,
                                    14.817030865098786
                                ]
                            },
                            "properties": {
                                "title": "Deuce"
                            }
                        }
                    ]
                }
            },
            "layout": {
                "icon-image": "POI-black",
                "icon-size": 0.75,
                "text-field": "{title}",
                "text-font": [
                    "Geograph Edit Medium"
                ],
                "text-offset": [
                    0.45,
                    0
                ],
                "text-anchor": "bottom-left",
                "text-justify": "left"
            },
            "paint": {
                "text-color": "#000000",
                "icon-opacity": {
                    "stops": [
                        [
                            12.4,
                            1
                        ],
                        [
                            12.5,
                            1
                        ]
                    ]
                },
                "text-opacity": {
                    "stops": [
                        [
                            12.4,
                            1
                        ],
                        [
                            12.5,
                            1
                        ]
                    ]
                }
            }
        }
    ]
}
</script>
</div>
            
```

### JS Method

These same options can be passed to a function to be used in an interactive project. 

- `el` : An additional key should be passed which references a selected DOM element.

```
const locator = new NGLocator({
    el: document.querySelector("#container-for-map"),  
    mapOptions: {}, 
    mapFeatures: []
})
```

Maps can be further customized by accessing the mapbox gl reference. For example: 

```
locator.map.addLayer(...)
```


## Useful project notes

Link to data: 

Contact info for sources: 

Link to promo in the DAM: 

Copy editor: 

URL to related story: 

## How to use trudy

Learn how to use trudy, the graphics template [here](https://drive.google.com/drive/folders/0B9f4BeCssbwoYW9LM2hydTZxQmc?usp=sharing).

## Publishing checklist

Follow this guide [here](https://docs.google.com/document/d/1c734ZEgYKZbE6BIoDhChHoFOFBpMucqqjPiwWKItaGM/edit)


# ng-mapbox-locator


Slug: ng-mapbox-locator

Graphics_editor: 

Headline: 

Public_URL: 

AEM_URL: 

Pub_date: 
(YYY-MM-DD)

Map: 
(Y/N)

Graphic: 
(Y/N)


:ignore 
