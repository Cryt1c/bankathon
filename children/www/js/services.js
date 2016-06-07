angular.module('starter.services', [])

  .factory('Amount', function () {
    var available = 0.00;
    var spentTotal = 0.00;
    var requestAmount = 10;
    return {
      getAvailable: function () {
        return available;
      },
      setAvailable: function (newValue) {
        available = newValue;
      },
      getSpentTotal: function (stats) {
        spentTotal = 0;
        for (var i = 0; i < stats.length; i++) {
          spentTotal += stats[i].spent;
        }
        return spentTotal;
      },
      spend: function (spent) {
        spentTotal += spent;
        available -= spent;
      },
      request: function (amount) {
        available += amount;
      }
    };
  })

  .service('transactionsService', function (Stats) {
    var _transactions = [];

    this.transactions = function () {
      return _transactions;
    };

    this.createTransaction = function (recipient, amount, category, is_need) {
      return {recipient: recipient, amount: amount, category: category, isNeed: is_need, writtenToServer: false};
    };

    this.addTransaction = function (transaction) {
      //trans.writtenToServer = false;
      if (!transaction.date) transaction.date = new Date();
      _transactions.push(transaction);
    };

    this.loadTransactionsJSON = function (existingTransactions) {
      //_transactions = existingTransactions;
      _transactions = _transactions.filter(function(value) {
        return (value.type == 1);
      });
      for (var i = 0; i < existingTransactions.length; i++) {
        var thisT = existingTransactions[i];
        var trans = this.createAndAddTransaction(thisT.recipient, thisT.amount, thisT.category);
        trans.isNeed = thisT.is_need;
        trans.date = new Date(thisT.timestamp);
        trans.writtenToServer = true; // flag this as already being written to the server
      }

    };

    this.createAndAddTransaction = function (recipient, amount, category, is_need) {
      var trans = this.createTransaction(recipient, amount, category, is_need);
      trans.writtenToServer = false;
      this.addTransaction(trans);
      return trans;
    };

    this.all = function () {
      return _transactions;
    };

    this.get = function (index) {
      return _transactions[index];
    };
  })

  .factory('Stats', function () {
    // Might use a resource here that returns a JSON array
    var nextBuy = -1;
    // Some fake testing data
    var stats = [{
      id: 0,
      name: 'Essen',
      spent: 0.00,
      file: 'food.png',
      color: '#ED3338',
      height: '25',
      icon_android: 'ion-icecream',
      icon_ios: 'ion-ios-nutrition'
    }, {
      id: 1,
      name: 'Spaß',
      spent: 0.00,
      file: 'spass.png',
      color: '#FFA212',
      height: '25',
      icon_android: 'ion-android-happy',
      icon_ios: 'ion-happy-outline'

    }, {
      id: 2,
      name: 'Sport',
      spent: 0.00,
      file: 'sport.png',
      color: '#FFE910',
      height: '25',
      icon_android: 'ion-android-bicycle',
      icon_ios: 'ion-ios-tennisball'
    }, {
      id: 3,
      name: 'Schulsachen',
      spent: 0.00,
      file: 'schule.png',
      color: '#38D42F',
      height: '25',
      icon_android: 'ion-university',
      icon_ios: 'ion-university'
    }, {
      id: 4,
      name: 'Kleidung',
      spent: 0.00,
      file: 'kleidung.png',
      color: '#05DEE0',
      height: '25',
      icon_android: 'ion-tshirt',
      icon_ios: 'ion-tshirt'
    }, {
      id: 5,
      name: 'Telefon',
      spent: 0.00,
      file: 'telefon.png',
      color: '#0D7DBF',
      height: '25',
      icon_android: 'ion-android-call',
      icon_ios: 'ion-ios-telephone'
    }, {
      id: 6,
      name: 'Geschenke',
      spent: 0.00,
      file: 'geschenk.png',
      color: '#AA6ADF',
      height: '25',
      icon_android: 'ion-heart',
      icon_ios: 'ion-heart'
    }, {
      id: 7,
      name: 'Einnahmen',
      spent: 0.00,
      file: 'geschenk.png',
      color: '#006B08',
      height: '25',
      icon_android: 'ion-plus',
      icon_ios: 'ion-plus'
    },];

    return {
      all: function () {
        return stats;
      },
      setSpent: function (transactions) {
        for (var i = 0; i < transactions.length; i++) {
          var category = transactions[i].category;
          stats[category].spent += transactions[i].amount;
        }
      },
      resetSpent: function () {
        for (var i = 0; i < stats.length; i++) {
          stats[i].spent = 0;
        }
        return stats;
      },
      resetHeights: function () {
        for (var i = 0; i < stats.length; i++) {
          stats[i].height = 25;
        }
        return stats;
      },
      setHeights: function (spentTotal, available, calc_height) {
        for (var i = 0; i < stats.length; i++) {
          var temp = stats[i].spent / (spentTotal + available) * calc_height;
          var check = 20;
          if(calc_height > 350) {
            check = 25;
          }
          if (temp > 0 && temp < check) {
            stats[i].height = check;
          }
          else {
            stats[i].height = temp;
          }
        }
        return stats;
      },
      remove: function (stats) {
        stats.splice(stats.indexOf(stats), 1);
      },
      spend: function (statId, spent) {
        for (var i = 0; i < stats.length; i++) {
          if (stats[i].id === parseInt(statId)) {
            stats[i].spent += spent;
          }
        }
      },
      get: function (statId) {
        for (var i = 0; i < stats.length; i++) {
          if (stats[i].id === parseInt(statId)) {
            return stats[i];
          }
        }
        return null;
      },
      getHeight: function(statId) {
        return stats[statId].height;
      }

    };
  })

  .factory('PunktZuKomma', function () {
    return {
      parse: function (value) {
        var text = parseFloat(value).toFixed(2).toString().replace(".", ",");
        return text;
      },
    };
  })
