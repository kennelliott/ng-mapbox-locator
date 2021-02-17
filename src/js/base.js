import "./lib/_project.js";
/* YOUR GRAPHIC JS HERE */
import NGLocator from './NGLocator'
import mapSettings from './mapSettings'

document.addEventListener('DOMContentLoaded', function() {
// initiate your project after the document has loaded in

    const locator = new NGLocator(document.querySelector(".ng-graphic-wrap"), mapSettings);
    const map = locator.map

    // wait for map readiness
    map.on('load', () => {
        // new layers go here e.g.: map.addLayer() 
    })
});
