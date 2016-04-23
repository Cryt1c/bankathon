angular.module('starter.services', [])

.factory('Amount', function() {

  var available = 40;
  var spent = -20;

  return {
    getAvailable: function() {
      return available;
    },
    getSpent: function() {
      return spent;
    }
  };
})

.factory('Stats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var stats = [{
    id: 0,
    name: 'Essen & Trinken',
    spent: 10
  }, {
    id: 1,
    name: 'Spielzeug',
    spent: 2
  }, {
    id: 2,
    name: 'Bücher',
    spent: 4
  }, {
    id: 3,
    name: 'Schulsachen',
    spent: 5
  }, {
    id: 4,
    name: 'Kino',
  spent: 2
  }];

  return {
    all: function() {
      return stats;
    },
    remove: function(stats) {
      stats.splice(stats.indexOf(stats), 1);
    },
    get: function(statId) {
      for (var i = 0; i < stats.length; i++) {
        if (stats[i].id === parseInt(statId)) {
          return stats[i];
        }
      }
      return null;
    }
  };
});
