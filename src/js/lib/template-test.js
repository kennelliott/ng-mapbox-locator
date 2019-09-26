var sampleTemplate = require('../hb-templates/sample.hbs'),
	div = document.createElement('div');

div.innerHTML = sampleTemplate({ title:'test' });

document.body.appendChild(div);