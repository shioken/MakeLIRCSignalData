var fs = require('fs');

var reader_code = [9000, 4500];
var signal_length = [560, 1690];

if (process.argv.length < 3) {
    console.log("Definition file is not specified");
    process.exit(1);
}

var body = fs.readFileSync(process.argv[2], 'utf8');
var lines = body.split('\n');

var custom_code = [];
var ops = [];

var first = true;
lines.forEach(function(line) {
    var values = line.split(',');
    if (values.length == 2) {
        if (first) {
            custom_code.push(Number(values[0]));
            custom_code.push(Number(values[1]));
        }
        else {
            ops.push({
                name: values[0],
                value: Number(values[1])
            });
        }
        first = false;
    }
});

ops.forEach(function(op) {
    console.log("name " + op.name);
    var values = [];
    reader_code.forEach(function(value) {
        values.push(value);
    });

    custom_code.forEach(function(value) {
        var signal = makeSignal(value);
        values = values.concat(signal);
    })

    var signal = makeSignal(op.value);
    values = values.concat(signal);
    var signal_invert = makeSignal((~op.value) & 0xFF);
    values = values.concat(signal_invert);

    values.push(signal_length[0]);  // stop bit

    var out_code = "";
    var word_count = 0;
    values.forEach(function(value) {
        out_code += value;
        word_count++;
        if (word_count == 16) {
            word_count = 0;
            out_code += "\n";
        }
        else {
            out_code += " ";
        }
    })
    console.log(out_code);
    console.log('');
});

function makeSignal(value) {
    var signal = [];
    var mask = 0x80;
    for (index = 0; index < 8; index++) {
        var v = value & mask;
        signal.push(signal_length[0]);
        signal.push(signal_length[v != 0 ? 1 : 0]);

        mask = mask >>> 1;
    }

    return signal;
}
