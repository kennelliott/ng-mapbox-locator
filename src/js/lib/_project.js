import "./ai2html.js"

class Project {
	constructor() {
		this.projectClass = "ng-mapbox-locator"
		this.initFooterYear()
	}
	initFooterYear() {
		const $footerYear = document.querySelector(`.${this.projectClass} .ngm-footer-year`)
		if ($footerYear) $footerYear.innerHTML = new Date().getFullYear()
	}
}

document.addEventListener('DOMContentLoaded', () => new Project());