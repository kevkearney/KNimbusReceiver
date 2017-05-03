var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://192.168.1.104:27017/weather';

var insertWeather = function(weatherData, callback) {
  var currentDate;
  MongoClient.connect(url, function(err, db) {
     assert.equal(null, err);
     insertWeatherDocument(db,weatherData, function(currentDate) {
       console.log('date current' + currentDate);
       db.close();
       callback(currentDate);
     });
  });
  console.log('date current' + currentDate);
};

var insertLightning = function(lightningData, callback) {
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  insertLightningDocument(db,lightningData, function() {
      db.close();
  });
});
};

var insertWeatherDocument = function(db,weatherData, callback) {
var currentDate = new Date();
 db.collection('weather').insertOne( {
     "Temperature" : weatherData.Temperature,
     "BaroPressure" : weatherData.BaroPressure,
     "Humidity" : weatherData.Humidity,
     "BaroTemperature" : weatherData.BaroTemperature,
     "Lux" : weatherData.Lux,
     "SampleDate" : currentDate
   }, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a document into the weather collection at ",currentDate);
  });
console.log("insert wewather date" + currentDate);
return currentDate;
};

var insertLightningDocument = function(db,lightningData) {
  db.collection('lightning').insertOne( {
     "EventType" : lightningData.eventType,
     "Distance" : lightningData.distance,    
     "SampleDate" : currentDate

   }, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a document into the lightning collection at ",currentDate);
  });
};

module.exports.insertWeather = insertWeather;
module.exports.insertLightning = insertLightning;

module.exports.weatherStream = function(io){
  io.sockets.on('connection', function (socket) {
    MongoClient.connect(url, function (err, db) {
        var collection = db.collection('weather')
        var stream = collection.find().sort({ _id : -1 }).limit(10).stream();
        stream.on('data', function (weather) { socket.emit('weather message', weather); });
    });
  });
};
