/* YOUR GRAPHIC JS HERE */
import NGLocator from './NGLocator'

// this is your document ready function
document.addEventListener('DOMContentLoaded', function() {
    // initiate your project after the document has loaded in here!
	this.els = document.querySelectorAll("[data-ng-locator-map]")
	this.els.forEach(el=> new NGLocator({el:el}))

});

