import * as mapboxgl from 'mapbox-gl';

class NGLocator {
    constructor(opts) {
        //apply base options
        this.el = null
        Object.assign(this, opts);

        this.flag = "data-ng-locator-map-processed"

        // only run the code if some other embed hasnt processed it
        if (!this.el.getAttribute(this.flag)) {

            // defaults, override with input "config" options
            this.config = {
                center: [0, 0],
                zoom: 1,
                style: 'travel'
            }
            Object.assign(this.config, opts.config);

            // override with DOM config if available
            this.optionsEl = this.el.querySelector('[data-ng-locator-map-options]')
            this.config = this.el && this.optionsEl ? JSON.parse(this.optionsEl.textContent) : this.config

            this.renderEl()
            this.renderMap()
        }
    }

    renderEl() {
        const tpl = `
        		<div class="ng-locator-map-inner"></div>
				<div class="ng-locator-map-meta">
					© NGP, Content may not reflect <a href="https://www.nationalgeographic.com/maps/cartographic-policies/" target="new">National Geographic's current map policy</a>.
				</div>
        	`
        // set as processed
        this.el.setAttribute(this.flag, true)
        // add a class for easier styling
        this.el.classList.add("ng-locator-map")
        // insert the template
        this.el.insertAdjacentHTML('beforeend', tpl);
        // make reference to where map will go
        this.mapEl = this.el.querySelector(".ng-locator-map-inner")
    }

    renderMap() {

        mapboxgl.accessToken = 'pk.eyJ1IjoiamVsZGVyIiwiYSI6InpCTmhMdm8ifQ.lJcqxcME79NwtzwTNX2qNw';

        this.map = new mapboxgl.Map({
            container: this.mapEl,
            style: this.parseStyle(this.config.style),
            center: this.config.center,
            zoom: this.config.zoom,
            attributionControl: false,
            maxZoom: 14,
            pitchWithRotate: false,
            maxBounds: this.config.bounds
        });
        this.map.addControl(new mapboxgl.NavigationControl());
        this.map.scrollZoom.disable();
        this.map.dragRotate.disable();
        this.map.touchZoomRotate.disableRotation();

        //only does this part if user has added a point
        //inserts add point function into code

        this.map.on('load', () => {
            this.mapLoadEvent()
        });

        this.map.on('moveend', () => {
            // kill the crashing labels at edge after moving map
            this.edgeLabelCrashKiller()
        })

    }


    mapLoadEvent() {
        if (this.config.displayPoint) {
            var iconURL = "ngm-assets/img/" + this.config.iconStyle + "-" + this.config.iconColor + "-01-01.png"
            this.map.loadImage(iconURL, (error, image) => {
                if (error) throw error;
                this.map.addImage("POI" + this.config.uniqueTime, image);
                this.map.addLayer({
                    "id": "point-circle" + this.config.uniqueTime,
                    "type": "symbol",
                    "source": {
                        "type": "geojson",
                        "data": {
                            "type": "FeatureCollection",
                            "features": [{
                                "type": "Feature",
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": this.config.point
                                },
                                "properties": {
                                    "title": this.config.pointName
                                }
                            }]
                        }
                    },
                    "layout": {
                        "icon-image": "POI" + this.config.uniqueTime,
                        "icon-size": this.config.iconSize,
                        "text-field": "{title}",
                        "text-font": ["Geograph Edit Medium"],
                        "text-offset": this.config.iconOffset,
                        "text-anchor": this.config.textAnchor,
                        "text-justify": this.config.textJustify
                    },
                    "paint": {
                        "text-color": this.config.highlightColor,
                        "icon-opacity": this.config.stops,
                        "text-opacity": this.config.stops
                    }
                });
            })
        }

        // kill the crashing labels at edge on initial load
        this.edgeLabelCrashKiller()

    }

    edgeLabelCrashKiller() {
    	// from here
        // https://github.com/mapbox/mapbox-gl-js/issues/6432
    	//debug collisions
    	this.map.showCollisionBoxes = true

        if (this.map.getLayer('viewport-line-symbols')) this.map.removeLayer('viewport-line-symbols');
        if (this.map.getSource("viewport-line")) this.map.removeSource('viewport-line')
        if (this.map.hasImage("pixel")) this.map.removeImage('pixel')


        var viewport = this.map.getBounds()

        this.map.addSource('viewport-line', {
            type: 'geojson',
            data: {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [viewport._sw.lng, viewport._sw.lat],
                        [viewport._sw.lng, viewport._ne.lat],
                        [viewport._ne.lng, viewport._ne.lat],
                        [viewport._ne.lng, viewport._sw.lat],
                        [viewport._sw.lng, viewport._sw.lat]
                    ]
                }
            }
        })

        var width = 10
        var data = new Uint8Array(width * width * 4)
        this.map.addImage('pixel', { width: width, height: width, data: data })

        this.map.addLayer({
            id: 'viewport-line-symbols',
            type: 'symbol',
            source: 'viewport-line',
            layout: {
                'icon-image': 'pixel',
                'symbol-placement': 'line',
                'symbol-spacing': 16
            }
        })
    }


    parseStyle(selectedStyle) {
        // default is travel
        let addedStyle;
        if (selectedStyle == "dark") {
            addedStyle = 'mapbox://styles/jelder/cji17s1zq0vqc2rnnj8nztodj';
        } else if (selectedStyle == "light") {
            addedStyle = 'mapbox://styles/jelder/cjhk1iruf181q2sn6egn70xxx';
        } else if (selectedStyle == "travel") {
            addedStyle = 'mapbox://styles/jelder/cjfn0m2nr1k0j2ss4idgbagcg';
        } else if (selectedStyle == "policital") {
            addedStyle = 'mapbox://styles/jelder/cjhih1d850ats2rnfkxno7r99';
        } else if (selectedStyle == "expeditions") {
            addedStyle = 'mapbox://styles/jelder/cjh1o47u50flc2rpm4h4dd37x';
        } else if (selectedStyle == "community") {
            addedStyle = 'mapbox://styles/jelder/cjiuzcajb6to92smm7vz0ucfk';
        }
        return addedStyle
    }

    parseParams(options) {
        try {
            return options ? JSON.parse(options) : null;
        } catch (e) {
            throw e;
        }
    }


}

export default NGLocator
