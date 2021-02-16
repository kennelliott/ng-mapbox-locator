# this should be run in an npn postinstall script

parentdir=$(dirname `pwd`)

if [ $(basename $parentdir) = "node_modules" ]; then
	cp -R src/ngm-assets/img/* ../../src/ngm-assets/img && \
	cp ../mapbox-gl/dist/mapbox-gl.css ../../src/sass/mapbox-gl.scss && \
	cp src/sass/base.scss ../../src/sass/ng-mapbox-locator.scss && \

	settingsFileDest=../../src/js/mapSettings.js
	if [ ! -e "$settingsFileDest" ]; then
		cp src/js/mapSettings.js $settingsFileDest
	else
		echo "$settingsFileDest exists, not overwriting"
	fi

	
else
    echo "ngm-mapbox-locator: Unable to install local project assets"
fi

