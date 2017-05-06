var sizeof = require('object-sizeof');
var cppMsg = require('../node_modules/cppmsg/cppMsg.js');
var reverse = require("buffer-reverse");

var weathermsg = new cppMsg.msg(
	[
		['ProtocolVersion', 'int16'],
		['MessageType', 'int16'],
		['Data', 'object']
	]
);

var weatherDatamsg = new cppMsg.msg(
	[
		['Temperature', 'int16'],
		['Humidty', 'int16'],
		['BaroPressure', 'int16'],
		['BaroTemperature', 'int16'],
		['Lux', 'uint16'],
		['test', 'bool']
	]
);

var weathercontrolmsg = new cppMsg.msg(
	[
		['sleepTime', 'int16'],
		['lightningIndoors', 'bool'],
		['lightningTune', 'int16'],
		['lightningNoiseFloor', 'int16'],
		['radioPower', 'int16']
	]
	);

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
		console.log(d);
		var data = weathermsg.decodeMsg(reverse(d));
		console.log(data);

		var response = {sleeptime: 10, lightningIndoors: true, lightningTune: 4, lightningNoiseFloor: 4, radioPower: 3};
		              var responseBuf = weathercontrolmsg.encodeMsg(response);



		               tx.write(reverse(responseBuf), sizeof(responseBuf));

	});
	tx.on('error', function(e) {
		console.warn("Error sending reply.", e);
		process.exit();
	});
});

//function reverse(s) {
//	return s.split("").reverse().join("");
//}
