angular.module('starter.services', [])

.factory('Amount', function() {
  var available = 40;
  var spentTotal = 0;
  var requestAmount = 10;
  return {
    getAvailable: function() {
      return available;
    },
    getSpentTotal: function(stats) {
      var temp = 0;
      for (var i = 0; i < stats.length; i++) {
        temp += stats[i].spent;
      }
      spentTotal = temp;
      return spentTotal;
    },
    spend: function(spent) {
      spentTotal += spent;
      available -= spent;
    },
    request: function(amount) {
      available += amount;
    }
  };
})

.factory('Stats', function() {
  // Might use a resource here that returns a JSON array
  var nextBuy = -1;
  // Some fake testing data
  var stats = [{
    id: 0,
    name: 'Essen & Trinken',
    spent: 32,
    file: 'food.png',
  }, {
    id: 1,
    name: 'Spaß',
    spent: 28,
    file: 'spass.png'
  }, {
    id: 2,
    name: 'Sport & Hobbies',
    spent: 12,
    file: 'sport.png'
  }, {
    id: 3,
    name: 'Schulsachen',
    spent: 15,
    file: 'schule.png'
  }, {
    id: 4,
    name: 'Kleidung',
    spent: 23,
    file: 'kleidung.png'
  }, {
    id: 5,
    name: 'Telefon',
    spent: 20,
    file: 'telefon.png'
  }, {
    id: 6,
    name: 'Geschenk',
    spent: 7,
    file: 'geschenk.png'
  }];

  return {
    all: function() {
      return stats;
    },
    remove: function(stats) {
      stats.splice(stats.indexOf(stats), 1);
    },
    spend: function(statId, spent) {
      for (var i = 0; i < stats.length; i++) {
        if (stats[i].id === parseInt(statId)) {
          stats[i].spent += spent;
        }
      }
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
