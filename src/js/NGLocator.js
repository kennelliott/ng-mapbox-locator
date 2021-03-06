import mapboxgl from 'mapbox-gl';
import icons from '../data/icons.json'

const FLAG = "data-ng-locator-map-processed"
const DEBUG = false


class NGLocator {
    constructor(el, opts = {}) {
        // It's possible a page will attempt to reproecess a container. 
        // Checking for the existance of a data attribute will prevent this.
        if (!el.getAttribute(FLAG)) {

            // Throw errors if necessary
            if (opts.mapOptions) {
                if (opts.mapOptions.container) {
                    throw new Error("NGLocator: Do not provide refernce to a container. Use the top level 'el' option instead")
                }
            }

            // Get DOM config if available to override defaults
            const DOMConfigEl = el.querySelector('[data-ng-locator-map-options]')
            const DOMConfig = DOMConfigEl ? JSON.parse(DOMConfigEl.textContent) : {}

            this.accessToken = 'pk.eyJ1IjoiamVsZGVyIiwiYSI6InpCTmhMdm8ifQ.lJcqxcME79NwtzwTNX2qNw';
            
            // add custom icons?
            opts.icons = opts.icons ? [...opts.icons,...icons ] : icons

            // merge DOM config into top level defaults into *this*
            Object.assign(this, {
                styleId: 'travel',
                el: el,
                iconRoot: "ngm-assets/img/icons",
                mapFeatures: [],
                mapOptions: {}
            }, opts, DOMConfig);

            // deep merge DOM config mapOptions into defaults into this.mapOptions
            this.mapOptions = Object.assign({}, {
                // 0 center/zoom gets overriiden by map style (mapbox bug?)
                center: [0.000001, 0.000001],
                zoom: 0.000001,
                attributionControl: false,
                maxZoom: 14,
                pitchWithRotate: false,
                scrollZoom: false,
                dragRotate: false
                // maxBounds: this.config.bounds
            }, opts.mapOptions, DOMConfig.mapOptions || {});

            mapboxgl.accessToken = this.accessToken
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
        // can overrride with an absolute style url
        if (!this.mapOptions.style && this.styleId) {
            this.mapOptions.style = this.parseStyle(this.styleId)
        }
        // container is the inserted child element
        this.mapOptions.container = this.mapEl

        this.map = new mapboxgl.Map(this.mapOptions);

        this.map.addControl(new mapboxgl.NavigationControl());

        this.map.touchZoomRotate.disableRotation();

        this.map.on('load', () => {
            // the default style needs to be overriden with zoom center options??
            // this.map.setCenter(this.mapOptions.center)
            // this.map.setZoom(this.mapOptions.zoom)
            this.mapLoadEvent()
        });

        this.map.on('moveend', () => {
            // kill the crashing labels at edge after moving map
            this.edgeLabelCrashKiller()
        })

    }

    addMapLayer(mapFeature) {
        // bug: if there's 2 features that use the same icon, they will use the same id
        // one will try to load while the other one hasnt returned yet, leading to "an image with this name already exists"

        const iconId = mapFeature.source.data.features[0].properties.icon;
        const iconColor = mapFeature.source.data.features[0].properties.iconColor;
        const iconUniqueId = `${iconId}_${iconColor}`
        const hasImage = iconId ? this.map.hasImage(iconUniqueId) : false
        const hasLayer = this.map.getLayer(mapFeature.id)
        if (iconId) {
            if (!hasImage) {
                this.map.loadImage(this.getImageUrl(iconId, iconColor), (error, image) => {
                    if (error) return console.error(error)

                    // this.map.addImage(iconId, image, {pixelRatio: window.devicePixelRatio });
                    this.map.addImage(iconUniqueId, image);
                    this.map.addLayer(mapFeature);
                    // add the image id reference to the map feature
                    this.map.setLayoutProperty(mapFeature.id, "icon-image", iconUniqueId)
                })
            } else {
                this.map.addLayer(mapFeature);
                this.map.setLayoutProperty(mapFeature.id, "icon-image", iconUniqueId)
            }
        } else {
            if (!hasLayer) {
                this.map.addLayer(mapFeature);
            }
        }

    }

    removeMapLayer(mapFeature) {
        this.map.removeLayer(mapFeature.id)
    }

    updateMapLayer(f) {
        if (f.source.data) {
            this.map.getSource(f.id).setData(f.source.data)
        }
        if (f.paint) {
            for (let key in f.paint) {
                this.map.setPaintProperty(f.id, key, f.paint[key]);
            }
        }
        if (f.layout) {

            const iconId = f.source.data.features[0].properties.icon;
            const iconColor = f.source.data.features[0].properties.iconColor;
            const iconUniqueId = `${iconId}_${iconColor}`
            const hasImage = this.map.hasImage(iconUniqueId)
            if (iconId && !hasImage) {
                this.map.loadImage(this.getImageUrl(iconId, iconColor), (error, image) => {
                    if (error) return console.error(error)

                    // this.map.addImage(iconId, image, {pixelRatio: window.devicePixelRatio });
                    this.map.addImage(iconUniqueId, image);
                    // BUG FIX. setting layout property right after addimage leads to not rendering
                    setTimeout(() => {
                        for (let key in f.layout) {
                            this.map.setLayoutProperty(f.id, key, f.layout[key]);
                        }
                        this.map.setLayoutProperty(f.id, "icon-image", iconUniqueId)
                    }, 50)

                })

            } else {
                for (let key in f.layout) {
                    this.map.setLayoutProperty(f.id, key, f.layout[key]);
                }
                if (hasImage) {
                    this.map.setLayoutProperty(f.id, "icon-image", iconUniqueId)
                }
            }


        }
    }




    mapLoadEvent() {
        // https://docs.mapbox.com/mapbox-gl-js/example/drag-a-point/
        // loop through features, load icons if necessary
        this.mapFeatures.forEach((mapFeature, i) => {
            this.addMapLayer(mapFeature, i)
        })

        // kill the crashing labels at edge on initial load
        this.edgeLabelCrashKiller()

    }

    setMapOptions(opts) {
        this.mapOptions = opts
    }
    setMapFeatures(newFeatures) {
        const oldFeatures = this.mapFeatures

        oldFeatures.forEach((f, i) => {
            const newFeature = newFeatures.find(newFeature => newFeature.id == f.id)
            if (newFeature) {
                // if (this.map.getSource(f.id)) {
                this.updateMapLayer(newFeature)
                // }
            } else {
                this.removeMapLayer(f)
            }
        })

        newFeatures.forEach((f, i) => {
            if (oldFeatures.find(newFeature => newFeature.id == f.id)) {} else {
                this.addMapLayer(f)
            }
        })

        this.mapFeatures = newFeatures;


        // this.mapFeatures = opts
    }

    setStyle(styleId) {
        const newStyle = this.parseStyle(styleId)
        // check for existing style
        if (newStyle != this.mapOptions.style) {
            this.mapOptions.style = newStyle
            this.map.setStyle(this.mapOptions.style)
            // setting the style kills the layers; reload the layers
            this.map.once('style.load', () => {
                this.mapLoadEvent()
            })
        }
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


    getImageUrl(iconId, iconColor) {

        const iconSrc = this.icons.find(i=>i.id == iconId).colors[iconColor]
        
        return `${this.iconRoot}/${iconSrc}`
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
