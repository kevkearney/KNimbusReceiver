var Struct = require('struct');
var sizeof = require('object-sizeof');
var Parser = require('binary-parser').Parser;
//var weatherMsg = new Parser().endianess('big').uint16('BaroTemperature').uint16('BaroPressure').uint16('Humidity').uint16('Temperature').uint16('Lux');
var weatherMsg = new Parser().endianess('big').uint16('Lux').int16('BaroTemperature').int16('BaroPressure').int16('Humidity').int16('Temperature');
var weatherControl = Struct()
	.word16Sbe('sleepTime',4)
	.word8Sbe('lightningIndoors',1)
        .word16Sbe('lightningTune',1)
        .word16Sbe('lightningNoiseFloor',1)
        .word16Sbe('radioPower', 1)


var NRF24 = require('nrf'),
	spiDev = "/dev/spidev0.0",
	cePin = 24,
	irqPin = 25, //var ce = require("./gpio").connect(cePin)
	pipes = [0xF0F0F0F0E1, 0xF0F0F0F0D2];
var nrf = NRF24.connect(spiDev, cePin, irqPin);
//nrf._debug = true;git 
nrf.channel(0x4c); // Set channel to 76
nrf.transmitPower('PA_MAX');
nrf.dataRate('1Mbps') // Set data rate to 1Mbps
nrf.crcBytes(2) // Set the CRC to 2
nrf.autoRetransmit({
	count: 500,
	delay: 15
});

nrf.begin(function() {
	console.log("Radio recevier listening.");
	var rx = nrf.openPipe('rx', pipes[1]),
        tx = nrf.openPipe('tx', pipes[0]);
	 
	rx.on('data', function(d) {		
                var weatherData = weatherMsg.parse(d);

		console.log(weatherData);
                weatherControl.allocate();
                var buf = weatherControl.buffer();
                buf.fill(0);
                var proxy = weatherControl.fields;
                proxy.presentCount = 1;
                proxy.list[0].sleepTime = 10;
	        proxy.list[0].lightningIndoors = 0;
                proxy.list[0].lightningTune = 2;
                proxy.list[0].lightningNoiseFloor = 4;
                proxy.list[0].radioPower = 3;

//                var response = {sleeptime: 10, lightningIndoors: true, lightningTune: 4, lightningNoiseFloor: 4, radioPower: 3};
  //              var convertedResponse = weatherControl.parse(response);

                tx.write(reverse(buf), sizeof(buf));

	});
	tx.on('error', function(e) {
		console.warn("Error sending reply.", e);
		process.exit();
	});
});

function reverse(s) {
	return s.split("").reverse().join("");
}


