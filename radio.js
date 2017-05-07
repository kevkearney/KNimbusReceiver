var sizeof = require('object-sizeof');
var weatherDB = require("./data/weatherDB");
var cppMsg = require('../node_modules/cppmsg/cppMsg.js');
var reverse = require("buffer-reverse");

var weatherdatamsg = new cppMsg.msg(
	[
		['MessageType', 'int8'],
		['Temperature', 'int16'],
		['Humidty', 'int16'],
		['BaroPressure', 'int16'],
		['BaroTemperature', 'int16'],
		['Lux', 'uint16']
	]
);

var lightningMsg = new cppMsg.msg(
	[
		['MessageType', 'int8'],
		['EventType', 'int16'],
		['Distance', 'int16'],
		['Intensity', 'int16']
	]
);

var weathercontrolmsg = new cppMsg.msg(
	[
		['SleepTime', 'int16'],
		['LightningIndoors', 'bool'],
		['LightningTune', 'int16'],
		['LightningNoiseFloor', 'int16'],
		['RadioPower', 'int16'],
		['SystemReset', 'bool']
	]
);

var socket = require('socket.io-client')('http://localhost:3000');


//Test code, remove when complete
var response = {
	sleeptime: 10,
	lightningIndoors: true,
	lightningTune: 4,
	lightningNoiseFloor: 4,
	radioPower: 3
};

var NRF24 = require('nrf'),
	spiDev = "/dev/spidev0.0",
	cePin = 24,
	irqPin = 25, //var ce = require("./gpio").connect(cePin)
	pipes = [0xF0F0F0F0E1, 0xF0F0F0F0D2];
var nrf = NRF24.connect(spiDev, cePin, irqPin);
//nrf._debug = true; 
nrf.channel(0x4c); // Set channel to 76
nrf.transmitPower('PA_MAX');
nrf.dataRate('1Mbps') // Set data rate to 1Mbps
nrf.crcBytes(2) // Set the CRC to 2
nrf.autoRetransmit({
	count: 500,
	delay: 15
});
	var responseBuf = weathercontrolmsg.encodeMsg(response);
nrf.begin(function() {
	console.log("Radio recevier listening.");
	var rx = nrf.openPipe('rx', pipes[1]),
		tx = nrf.openPipe('tx', pipes[0]);

	rx.on('data', function(d) {
		
	
		tx.write(reverse(responseBuf),12);
		
		var typeCode = reverse(d).readUIntBE(0, 1);;
		console.log(typeCode);
		
		if (typeCode === 1) {
			var data = weatherdatamsg.decodeMsg(reverse(d));
			console.log(data);
        
		}
		else if(typeCode === 2) {
			var data = lightningMsg.decodeMsg(reverse(d));
			console.log(data);
		}
		else{
				console.warn("No suitable struct found for decode.");
		}
	

	});
	tx.on('error', function(e) {
		console.warn("Error sending reply.", e);
		process.exit();
	});
	tx.on('error', function(e) {
		console.warn("Error sending reply.", e);
		process.exit();
	});
});