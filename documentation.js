var aglio = require('aglio');
var fs = require('fs');
var glob = require('glob');

var spec_files = glob.sync(__dirname + '/routes/**/*.md');
var spec_buffer;

for(var index in spec_files) {
  spec_buffer += fs.readFileSync(spec_files[index]);
}

var options = {
  themeVariables: 'default'
};

aglio.render(spec_buffer, options, function (err, html) {
    if (err) return console.warn(err);

    fs.writeFileSync(__dirname + '/out/index.html', html);
});
