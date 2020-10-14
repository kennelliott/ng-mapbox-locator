parentdir=$(dirname `pwd`)

if [ -d "node_modules" ]; then
	cd node_modules/ng-mapbox-locator
	cp -R src/ngm-assets/img/* ../../src/ngm-assets/img && \
	cp src/sass/base.scss ../../src/sass/ng-mapbox-locator.scss && \
	cp ../mapbox-gl/dist/mapbox-gl.css ../../src/sass/mapbox-gl.scss
else
    echo "ngm-mapbox-locator: Unable to install local project assets"
fi

