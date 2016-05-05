angular.module('starter.services', [])

.factory('Amount', function() {
  var available = 40.00;
  var spentTotal = 0.00;
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
    spent: 17.27,
    file: 'food.png',
    color: '#38D42F',
    height: '50',
    icon_android: 'ion-icecream',
    icon_ios: 'ion-ios-nutrition'
  }, {
    id: 1,
    name: 'Spaß',
    spent: 8.98,
    file: 'spass.png',
    color: '#0D7DBF',
    height: '50',
    icon_android: 'ion-android-happy',
    icon_ios: 'ion-happy-outline'

  }, {
    id: 2,
    name: 'Sport',
    spent: 12.03,
    file: 'sport.png',
    color: '#FFE910',
    height: '50',
    icon_android: 'ion-android-bicycle',
    icon_ios: 'ion-ios-tennisball'
  }, {
    id: 3,
    name: 'Schulsachen',
    spent: 15.30,
    file: 'schule.png',
    color: '#FFA212',
    height: '50',
    icon_android: 'ion-university',
    icon_ios: 'ion-university'
  }, {
    id: 4,
    name: 'Kleidung',
    spent: 11.20,
    file: 'kleidung.png',
    color: '#ED3338',
    height: '50',
    icon_android: 'ion-tshirt',
    icon_ios: 'ion-tshirt'
  }, {
    id: 5,
    name: 'Telefon',
    spent: 10.00,
    file: 'telefon.png',
    color: '#AA6ADF',
    height: '50',
    icon_android: 'ion-android-call',
    icon_ios: 'ion-ios-telephone'
  }, {
    id: 6,
    name: 'Geschenke',
    spent: 7.98,
    file: 'geschenk.png',
    color: '#05DEE0',
    height: '50',
    icon_android: 'ion-heart',
    icon_ios: 'ion-heart'
  }];

  return {
    all: function() {
      return stats;
    },
    getHeights: function(spentTotal, available) {

      for (var i = 0; i < stats.length; i++) {
          stats[i].height = stats[i].spent/(spentTotal+available)*500;
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
})

.factory('Months', function() {

  var months = [
    {id: 1, name: 'Jänner'},
    {id: 2, name: 'Feburar'},
    {id: 3, name: 'März'},
    {id: 4, name: 'April'},
    {id: 5, name: 'Mai'},
    {id: 6, name: 'Juni'},
    {id: 7, name: 'Juli'},
    {id: 8, name: 'August'},
    {id: 9, name: 'September'},
    {id: 10, name: 'Oktober'},
    {id: 11, name: 'November'},
    {id: 12, name: 'Dezember'},
  ];

  return {
    getMonth: function(id) {
      return months[id].name;
    },
    getAll: function() {
     return months;
    }
  };

});

