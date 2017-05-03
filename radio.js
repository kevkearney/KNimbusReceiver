var sizeof = require('object-sizeof');
var weatherDB = require("./data/weatherDB");
var Parser = require('binary-parser').Parser;
var weatherMsg = new Parser().endianess('big').float('Lux').float('BaroTemperature').float('BaroPressure').uint16('Humidity').float('Temperature');
var sleepTime = 30;
var socket = require('socket.io-client')('http://localhost:3000');

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
	delay: 0
});
nrf.begin(function() {
	console.log("Radio recevier listening.");
	var rx = nrf.openPipe('rx', pipes[1]),
		tx = nrf.openPipe('tx', pipes[0]);

	rx.on('data', function(d) {		
		var text = reverse(d.toString('utf8'));
		
		var response = '{sleepTime:' + sleepTime + '}';
			tx.write(reverse(response), sizeof(response));
		console.log("Before Check!")
		if (text.charAt(0) == 'L') {
			var lightningData = new Object();
			
			console.log("LIGHTNING EVENT DETECTED!")
			var trimmedText = text.substr(1);
			console.log(trimmedText);		
		
			var n = trimmedText.indexOf(":");
			if (n == -1) {
				lightningData.eventType = trimmedText;
				
				weatherDB.insertLightning(lightningData, () => {
				console.log("complete!")
				});			
			} else {
				lightningData.eventType = trimmedText.substring(0,n);
				lightningData.distance = trimmedText.substring(13);
				weatherDB.insertLightning(lightningData, () => {
				console.log("complete!") 
				});
			}
		} else {
			var weatherData = weatherMsg.parse(d);
			weatherDB.insertWeather(weatherData,function(currentDate){
				weatherData.SampleDate = currentDate;
                                socket.emit('weather message', weatherData);
			});
		}
		
	});
	tx.on('error', function(e) {
		console.warn("Error sending reply.", e);
		process.exit();
	});
});

function reverse(s) {
	return s.split("").reverse().join("");
}


