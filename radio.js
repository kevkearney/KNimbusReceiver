
var sizeof = require('object-sizeof');
var weatherDB = require("./data/weatherDB");
var cppMsg = require('./node_modules/cppmsg/cppMsg.js');
var reverse = require("buffer-reverse");


var response = {
        SleepTime: 120,
        LightningIndoors: false,
        LightningTune: 0,
        LightningNoiseFloor: 4,
        RadioPower: 3,
        SystemReset: 0,
		EnableDisturbers: 1,
		ResetRainGauge: 0
};


var weatherdatamsg = new cppMsg.msg(
	[
		['MessageType', 'int8'],
		['Temperature', 'int16'],
		['Humidity', 'int16'],
		['BaroPressure', 'int16'],
		['BaroTemperature', 'int16'],
                ['BaroHumidity','int16'],
                ['Lux', 'uint16'],
                ['WindSpeed','int16'],
                ['WindDirection','int16'],
                ['RainClicks','uint16'],
                ['Cycles','uint16'],
				['TotalRainClicks', 'uint16']
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
		['SystemReset', 'bool'],
		['EnableDisturbers', 'bool'],
		['ResetRainGauge', 'bool']
	]
);

var socket = require('socket.io-client')('http://localhost:3000');

var NRF24 = require('nrf'),
	spiDev = "/dev/spidev0.0",
	cePin = 22,
	irqPin = 25, //var ce = require("./gpio").connect(cePin)
	pipes = [0xF0F0F0F0E1, 0xF0F0F0F0D2];
var nrf = NRF24.connect(spiDev, cePin, irqPin);
//nrf._debug = true;
nrf.channel(0x4c); // Set channel to 76
nrf.transmitPower('PA_MAX');
nrf.dataRate('1Mbps') // Set data rate to 1Mbps
nrf.crcBytes(2) // Set the CRC to 2
nrf.autoRetransmit({
	count: 1000,
	delay: 25
});
nrf.begin(function() {
	console.log("Radio recevier listening.");
	var rx = nrf.openPipe('rx', pipes[1]),
		tx = nrf.openPipe('tx', pipes[0],{autoAck:false});
    //nrf.printDetails();
	rx.on('data', function(d) {

		var typeCode = reverse(d).readUIntBE(0, 1);;
		
		if (typeCode === 1) {
			var data = weatherdatamsg.decodeMsg(reverse(d));
			console.log(data);
			data.SampleDate = new Date();
			weatherDB.insertWeather(data, function(currentDate) {
				socket.emit('weather message', data);

			});        
		}

		else if(typeCode === 2) {
			var data = lightningMsg.decodeMsg(reverse(d));
                        data.SampleDate = new Date();

			weatherDB.insertLightning(data, () => {
                                        socket.emit('lightning message', data);
				});
		}
		else{
				console.warn("No suitable struct found for decode.");
		}
 var responseBuf = reverse(weathercontrolmsg.encodeMsg(response));
                
                tx.write(responseBuf,sizeof(responseBuf));
                //nrf.printDetails();
response.SystemReset = 0;
console.log(response);
	

	});
	tx.on('error', function(e) {
		console.warn("Error sending reply.", e);
		process.exit();
	});
});

