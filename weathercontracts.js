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