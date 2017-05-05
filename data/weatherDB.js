var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://192.168.0.145:27017/weather';

var insertWeather = function(weatherData, callback) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        insertWeatherDocument(db, weatherData, function(currentDate) {
            db.close();
        });
    });
    callback();
};

var insertLightning = function(lightningData, calllback) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        insertLightningDocument(db, lightningData, function() {
            db.close();
        });
    });
    calllback();
};

var insertWeatherDocument = function(db, weatherData, callback) {
    db.collection('weather').insertOne({
        "Temperature": weatherData.Temperature / 100,
        "BaroPressure": weatherData.BaroPressure / 10,
        "Humidity": weatherData.Humidity / 100,
        "BaroTemperature": weatherData.BaroTemperature / 100,
        "Lux": weatherData.Lux,
        "SampleDate": weatherData.SampleDate
    }, function(err, result) {
        assert.equal(err, null);
        console.log("Inserted a document into the weather collection at ", new Date());
        callback();
    });
};

var insertLightningDocument = function(db, lightningData, callback) {
    db.collection('lightning').insertOne({
        "EventType": lightningData.EventType,
        "Distance": lightningData.Distance,
        "SampleDate": lightningData.SampleDate

    }, function(err, result) {
        assert.equal(err, null);
        console.log("Inserted a document into the lightning collection at ", new Date());
        callback();
    });
};

module.exports.insertWeather = insertWeather;
module.exports.insertLightning = insertLightning;

module.exports.weatherStream = function(io) {
    io.sockets.on('connection', function(socket) {
        MongoClient.connect(url, function(err, db) {
            var collection = db.collection('weather')
            var stream = collection.find().sort({
              SampleDate: -1
            })
            .limit(10).stream();
            stream.on('data', function(weather) {
                socket.emit('weather message', weather);
            });
        });
    });
};
