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
        this.el.setAttribute(this.flag, true)
        this.el.classList.add("ng-locator-map")
        this.el.insertAdjacentHTML('beforeend', tpl);
        this.mapEl = this.el.querySelector(".ng-locator-map-inner")
    }

    renderMap() {

        mapboxgl.accessToken = 'pk.eyJ1IjoiamVsZGVyIiwiYSI6InpCTmhMdm8ifQ.lJcqxcME79NwtzwTNX2qNw';

        var map = new mapboxgl.Map({
            container: this.mapEl,
            style: this.parseStyle(this.config.style),
            center: this.config.center,
            zoom: this.config.zoom,
            attributionControl: false,
            maxZoom: 14,
            pitchWithRotate: false,
            maxBounds: this.config.bounds
        });
        map.addControl(new mapboxgl.NavigationControl());
        map.scrollZoom.disable();
        map.dragRotate.disable();
        map.touchZoomRotate.disableRotation();

        //only does this part if user has added a point
        //inserts add point function into code
        if (this.config.displayPoint) {

            var iconURL = "ngm-assets/img/" + this.config.iconStyle + "-" + this.config.iconColor + "-01-01.png"

            map.on('load', () => {
                map.loadImage(iconURL, (error, image) => {
                    if (error) throw error;
                    map.addImage("POI" + this.config.uniqueTime, image);
                    map.addLayer({
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
            });


        }
    }

    parseStyle(selectedStyle) {
        let addedStyle
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
