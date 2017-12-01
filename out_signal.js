var fs = require('fs');

var reader_code = [9000, 4500];
var signal_length = [560, 1690];

if (process.argv.length < 3) {
    console.log("Definition file is not specified");
    process.exit(1);
}

var headers = [
    "begin remote",
    "",
      "\tname            tv",
      "\tflags           RAW_CODES",
      "\teps             30",
      "\taeps            100",
      "\tgap             200000",
      "\ttoggle_bit_mask 0x0",
    "",
      "\tbegin raw_codes",
];

headers.forEach(function(line) {
    console.log(line);
});

var body = fs.readFileSync(process.argv[2], 'utf8');
var lines = body.split('\n');

var custom_code = [];
var ops = [];

var first = true;
lines.forEach(function(line) {
    var values = line.split(',');
    if (values.length > 1) {
        if (first) {
            custom_code.push(Number(values[0]));
            custom_code.push(Number(values[1]));
        }
        else {
            var op = {
                name: values[0],
                value: Number(values[1])
            };
            if (values.length == 2) {
                op.custom_code = custom_code;
            }
            else if (values.length == 4) {
                var cc = [Number(values[2]), Number(values[3])];
                op.custom_code = cc;
            }
            ops.push(op);
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

    op.custom_code.forEach(function(value) {
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

console.log("\tend raw_codes");
console.log("end remote");

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
