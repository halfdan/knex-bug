var knex = require('knex');
var moment = require('moment');
var path = require('path');

kI = knex({
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, 'development.sqlite3')
    },
    debug: true
});

function insertEvent(event) {
  return kI('events').insert({
    start_date: event.start_date.toDate(),
    value: event.value
  });
}

function findEvent(event) {
  return kI('events').where({
    start_date: event.start_date.toDate()
  }).first('value');
}

function updateEvent(event) {
  return kI('events').where({
    start_date: event.start_date.toDate()
  }).increment('value', event.value);
}

var currentMinute = moment().startOf('minute');

var events = [];

for (var i = 1; i <= 100; i++) {
    events.push({
        start_date: currentMinute,
        value: i
    });
}

kI.migrate.latest({
    directory: path.join(__dirname, 'migrations')
}).then(function() {
    console.log("Migrated");

    var p = Promise.resolve();
    events.forEach(function (event) {
      p = p.then(findEvent(event).then(function (row) {
        if (!row) {
          return insertEvent(event);
        } else {
          return updateEvent(event);
        }
      }));
    });

    return p.then(function (){
        console.log("All written.");
    });
});

