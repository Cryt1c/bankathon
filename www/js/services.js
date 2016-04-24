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
    name: 'Essen',
    spent: 17,
    file: 'food.png',
    color: '#709C96',
    height: '50'
  }, {
    id: 1,
    name: 'Spaß',
    spent: 8,
    file: 'spass.png',
    color: '#D99DF5',
    height: '50'
  }, {
    id: 2,
    name: 'Sport',
    spent: 12,
    file: 'sport.png',
    color: '#A9F5C1',
    height: '50'
  }, {
    id: 3,
    name: 'Schulsachen',
    spent: 15,
    file: 'schule.png',
    color: '#F7BE5C',
    height: '50'
  }, {
    id: 4,
    name: 'Kleidung',
    spent: 11,
    file: 'kleidung.png',
    color: '#F7F55C',
    height: '50'
  }, {
    id: 5,
    name: 'Telefon',
    spent: 10,
    file: 'telefon.png',
    color: '#F75C5E',
    height: '50'
  }, {
    id: 6,
    name: 'Geschenk',
    spent: 7,
    file: 'geschenk.png',
    color: '#98D8ED',
    height: '50'
  }];

  return {
    all: function() {
      return stats;
    },
    getHeights: function(spentTotal) {

      for (var i = 0; i < stats.length; i++) {
          stats[i].height = stats[i].spent/spentTotal*500;
        console.log(stats[i].height);
      }
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
