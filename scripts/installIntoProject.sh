parentdir=$(dirname `pwd`)

if [ "$parentdir" = "node_modules" ]; then
	cp -R src/ngm-assets/img/* ../../src/ngm-assets/img && \
	cp ../mapbox-gl/dist/mapbox-gl.css ../../src/sass/mapbox-gl.scss && \
	cp src/sass/base.scss ../../src/sass/ng-mapbox-locator.scss
else
    echo "parent dir $parentdir"
fi

