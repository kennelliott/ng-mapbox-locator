import * as mapboxgl from 'mapbox-gl';
mapboxgl.accessToken = 'pk.eyJ1IjoiamVsZGVyIiwiYSI6InpCTmhMdm8ifQ.lJcqxcME79NwtzwTNX2qNw';

const FLAG = "data-ng-locator-map-processed"

class NGLocator {
    constructor(el, opts = {}) {
        // It's possible a page will attempt to reproecess a container. 
        // Checking for the existance of a data attribute will prevent this.
        if (!el.getAttribute(FLAG)) {

            // Throw errors if necessary
            if (opts.mapOptions) {
                if (opts.mapOptions.style) {
                    throw new Error("NGLocator: Do not provide a url to a style, only a top level styleId is valid.")
                }
                if (opts.mapOptions.container) {
                    throw new Error("NGLocator: Do not provide refernce to a container. Use the top level 'el' option instead")
                }
            }

            // Get DOM config if available to override defaults
            const DOMConfigEl = el.querySelector('[data-ng-locator-map-options]')
            const DOMConfig = DOMConfigEl ? JSON.parse(DOMConfigEl.textContent) : {}

            // merge DOM config into top level defaults into *this*
            Object.assign(this, {
                styleId: 'travel',
                el: el,
                iconRoot: "ngm-assets/img",
                mapFeatures: [],
                mapOptions: {}
            }, opts, DOMConfig );

           // deep merge DOM config mapOptions into defaults into this.mapOptions
            this.mapOptions = Object.assign({}, {
                center: [0, 0],
                zoom: 1,
                attributionControl: false,
                maxZoom: 14,
                pitchWithRotate: false
                // maxBounds: this.config.bounds
            }, opts.mapOptions, DOMConfig.mapOptions || {});

            // start the render
            this.renderEl()
            this.renderMap()

            return this
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
        this.el.setAttribute(FLAG, true)
        // add a class for easier styling
        this.el.classList.add("ng-locator-map")
        // insert the template
        this.el.insertAdjacentHTML('beforeend', tpl);
        // make reference to where map will go
        this.mapEl = this.el.querySelector(".ng-locator-map-inner")
        // set the map el

    }

    renderMap() {
        // get style url from style id
        this.mapOptions.style = this.parseStyle(this.styleId)
        // container is the inserted child element
        this.mapOptions.container = this.mapEl

        this.map = new mapboxgl.Map(this.mapOptions);

        console.log(this.map, this.map.getZoom(), this.mapOptions)
        this.map.addControl(new mapboxgl.NavigationControl());
        this.map.scrollZoom.disable();
        this.map.dragRotate.disable();
        this.map.touchZoomRotate.disableRotation();

        this.map.on('load', () => {
            this.mapLoadEvent()
        });

        this.map.on('moveend', () => {
            // kill the crashing labels at edge after moving map
            this.edgeLabelCrashKiller()
        })

    }

    mapLoadEvent() {
        // loop through features, load icons if necessary
        this.mapFeatures.forEach((mapFeature, i) => {
            const iconImageId = mapFeature.layout["icon-image"];

            if (iconImageId) {
                this.map.loadImage(this.getImageUrl(iconImageId), (error, image) => {
                    if (error) return console.error(error)

                    this.map.addImage(iconImageId, image);
                    this.map.addLayer(mapFeature);
                })
            } else {
                this.map.addLayer(mapFeature);
            }
        })

        // kill the crashing labels at edge on initial load
        this.edgeLabelCrashKiller()

    }

    edgeLabelCrashKiller() {
        // from here
        // https://github.com/mapbox/mapbox-gl-js/issues/6432
        //debug collisions
        // this.map.showCollisionBoxes = true

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
                'symbol-spacing': 10
            }
        })
    }


    getImageUrl(id) {
        return `${this.iconRoot}/${id.split("___")[0]}-01-01.png`
    }


    parseStyle(selectedStyle) {
        // default is travel
        let addedStyle;
        if (selectedStyle == "dark") {
            addedStyle = 'mapbox://styles/jelder/cji17s1zq0vqc2rnnj8nztodj?optimize=true';
        } else if (selectedStyle == "light") {
            addedStyle = 'mapbox://styles/jelder/cjhk1iruf181q2sn6egn70xxx?optimize=true';
        } else if (selectedStyle == "travel") {
            addedStyle = 'mapbox://styles/jelder/cjfn0m2nr1k0j2ss4idgbagcg?optimize=true';
        } else if (selectedStyle == "political") {
            addedStyle = 'mapbox://styles/jelder/cjhih1d850ats2rnfkxno7r99?optimize=true';
        } else if (selectedStyle == "expeditions") {
            addedStyle = 'mapbox://styles/jelder/cjh1o47u50flc2rpm4h4dd37x?optimize=true';
        } else if (selectedStyle == "community") {
            addedStyle = 'mapbox://styles/jelder/cjiuzcajb6to92smm7vz0ucfk?optimize=true';
        }
        return addedStyle

    }


}

export default NGLocator
