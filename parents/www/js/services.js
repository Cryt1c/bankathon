angular.module('starter.services', [])

  .factory('Kids', function () {

    var kids = [{
      id: 0,
      name: 'Michael',
      paired: true
    }];
    var kidsNum = kids.length;

    return {
      getAll: function () {
        return kids;
      },
      getNum: function (kids) {
        return kids.length;
      },
      setPaired: function (id, paired) {
        kids[id].paired = paired;
      }
    };
  })

  .factory('Amount', function () {
    var available = 18.82;
    var spentTotal = 0.00;

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
    };
  })

  .service('transactionsService', function () {
    var _transactions = [];

    this.transactions = function () {
      return _transactions;
    };

    this.createTransaction = function (recipient, amount, category, is_need) {
      return {recipient: recipient, amount: amount, category: category, is_need: is_need, writtenToServer: false};
    };

    this.addTransaction = function (transaction) {
      //trans.writtenToServer = false;
      if (!transaction.date) transaction.date = new Date();
      _transactions.push(transaction);
    };

    this.loadTransactionsJSON = function (existingTransactions) {
      //_transactions = existingTransactions;
      _transactions = _transactions.filter(function (value) {
        return (value.type == 1);
      });
      for (var i = 0; i < existingTransactions.length; i++) {
        var thisT = existingTransactions[i];
        var trans = this.createAndAddTransaction(thisT.recipient, thisT.amount, thisT.category);
        trans.is_need = thisT.is_need;
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

  .factory('Stats', function (transactionsService) {

    var categories = [{
      id: 0,
      name: 'Essen',
      spent: 0.00,
      file: 'food.png',
      color: '#38D42F',
      height: '25',
      icon_android: 'ion-icecream',
      icon_ios: 'ion-ios-nutrition'
    }, {
      id: 1,
      name: 'Spaß',
      spent: 0.00,
      file: 'spass.png',
      color: '#0D7DBF',
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
      color: '#FFA212',
      height: '25',
      icon_android: 'ion-university',
      icon_ios: 'ion-university'
    }, {
      id: 4,
      name: 'Kleidung',
      spent: 0.00,
      file: 'kleidung.png',
      color: '#ED3338',
      height: '25',
      icon_android: 'ion-tshirt',
      icon_ios: 'ion-tshirt'
    }, {
      id: 5,
      name: 'Telefon',
      spent: 0.00,
      file: 'telefon.png',
      color: '#AA6ADF',
      height: '25',
      icon_android: 'ion-android-call',
      icon_ios: 'ion-ios-telephone'
    }, {
      id: 6,
      name: 'Geschenke',
      spent: 0.00,
      file: 'geschenk.png',
      color: '#05DEE0',
      height: '25',
      icon_android: 'ion-heart',
      icon_ios: 'ion-heart'
    }];


    transactions = transactionsService.transactions();

/*    transactions = [{
      "id": 3,
      "amount": 2.49,
      "recipient": "Libro",
      "category": 3,
      "date": "2016-05-19T00:00:00.000Z",
      "is_need": true,
      "child_id": 1,
      "timestamp": "2016-05-19T13:13:54.624Z",
      "type": 0,
      "request_id": null
    }, {
      "id": 8,
      "amount": 3.14,
      "recipient": "Freudensprung",
      "category": 6,
      "date": "2016-05-31T00:00:00.000Z",
      "is_need": true,
      "child_id": 1,
      "timestamp": "2016-05-31T16:56:55.798Z",
      "type": 0,
      "request_id": null
    }, {
      "id": 103,
      "amount": 3.45,
      "recipient": "Paperbox",
      "category": 6,
      "date": "2016-06-06T00:00:00.000Z",
      "is_need": true,
      "child_id": 1,
      "timestamp": "2016-06-06T17:05:10.178Z",
      "type": 0,
      "request_id": null
    }, {
      "id": 97,
      "amount": 4.99,
      "recipient": "SportExports Filiale 1210",
      "category": 2,
      "date": "2016-06-04T00:00:00.000Z",
      "is_need": false,
      "child_id": 1,
      "timestamp": "2016-06-04T13:15:17.813Z",
      "type": 0,
      "request_id": null
    }, {
      "id": 5,
      "amount": 1.2,
      "recipient": "Fisher Spielwaren",
      "category": 1,
      "date": "2016-05-17T00:00:00.000Z",
      "is_need": false,
      "child_id": 1,
      "timestamp": "2016-05-17T16:39:33.981Z",
      "type": 0,
      "request_id": null
    }, {
      "id": 100,
      "amount": 10,
      "recipient": "A1",
      "category": 5,
      "date": "2016-06-15T00:00:00.000Z",
      "is_need": true,
      "child_id": 1,
      "timestamp": "2016-06-15T17:00:33.392Z",
      "type": 0,
      "request_id": null
    }, {
      "id": 99,
      "amount": 7.5,
      "recipient": "Billa",
      "category": 0,
      "date": "2016-06-06T00:00:00.000Z",
      "is_need": true,
      "child_id": 1,
      "timestamp": "2016-06-06T15:30:34.177Z",
      "type": 0,
      "request_id": null
    }, {
      "id": 9,
      "amount": 1.2,
      "recipient": "Mensa",
      "category": 0,
      "date": "2016-05-03T00:00:00.000Z",
      "is_need": true,
      "child_id": 1,
      "timestamp": "2016-05-03T17:01:37.466Z",
      "type": 0,
      "request_id": null
    }, {
      "id": 4,
      "amount": 5.99,
      "recipient": "H&M",
      "category": 4,
      "date": "2016-05-01T00:00:00.000Z",
      "is_need": false,
      "child_id": 1,
      "timestamp": "2016-05-01T16:39:08.247Z",
      "type": 0,
      "request_id": null
    }, {
      "id": 102,
      "amount": 4.99,
      "recipient": "H&M",
      "category": 4,
      "date": "2016-06-07T00:00:00.000Z",
      "is_need": false,
      "child_id": 1,
      "timestamp": "2016-06-07T17:02:55.407Z",
      "type": 0,
      "request_id": null
    }, {
      "id": 96,
      "amount": 2.65,
      "recipient": "Libro",
      "category": 3,
      "date": "2016-06-03T00:00:00.000Z",
      "is_need": true,
      "child_id": 1,
      "timestamp": "2016-06-03T12:25:34.896Z",
      "type": 0,
      "request_id": null
    }, {
      "id": 104,
      "amount": 5,
      "recipient": "Fisher Spielwaren",
      "category": 1,
      "date": "2016-06-06T00:00:00.000Z",
      "is_need": false,
      "child_id": 1,
      "timestamp": "2016-06-06T10:18:38.247Z",
      "type": 0,
      "request_id": null
    }, {
      "id": 98,
      "amount": 2.65,
      "recipient": "McDonalds",
      "category": 0,
      "date": "2016-06-05T00:00:00.000Z",
      "is_need": true,
      "child_id": 1,
      "timestamp": "2016-06-05T14:41:10.862Z",
      "type": 0,
      "request_id": null
    }, {
      "id": 2,
      "amount": 2.5,
      "recipient": "Billa",
      "category": 0,
      "date": "2016-05-05T00:00:00.000Z",
      "is_need": true,
      "child_id": 1,
      "timestamp": "2016-05-05T12:38:54.624Z",
      "type": 0,
      "request_id": null
    }, {
      "id": 6,
      "amount": 1.77,
      "recipient": "Der Mann",
      "category": 0,
      "date": "2016-05-14T00:00:00.000Z",
      "is_need": true,
      "child_id": 1,
      "timestamp": "2016-05-14T16:41:38.640Z",
      "type": 0,
      "request_id": null
    }, {
      "id": 10,
      "amount": 7.33,
      "recipient": "Billa",
      "category": 0,
      "date": "2016-05-25T00:00:00.000Z",
      "is_need": true,
      "child_id": 1,
      "timestamp": "2016-05-25T17:03:40.882Z",
      "type": 0,
      "request_id": null
    }, {
      "id": 11,
      "amount": 4.56,
      "recipient": "Libro",
      "category": 3,
      "date": "2016-05-12T00:00:00.000Z",
      "is_need": true,
      "child_id": 1,
      "timestamp": "2016-05-12T17:04:04.099Z",
      "type": 0,
      "request_id": null
    }, {
      "id": 12,
      "amount": 13.12,
      "recipient": "Hervis Sports",
      "category": 2,
      "date": "2016-05-09T00:00:00.000Z",
      "is_need": false,
      "child_id": 1,
      "timestamp": "2016-05-09T17:04:17.824Z",
      "type": 0,
      "request_id": null
    }, {
      "id": 1,
      "amount": 6.65,
      "recipient": "Spar",
      "category": 0,
      "date": "2016-04-30T00:00:00.000Z",
      "is_need": true,
      "child_id": 1,
      "timestamp": "2016-04-30T12:31:54.624Z",
      "type": 0,
      "request_id": null
    }];*/

    return {
      all: function () {
        return categories;
      },
      setTransactions: function () {
        transactions = transactionsService.transactions();
      },
      getTransactions: function () {
        return transactions;
      },
      getLegend: function (month, year) {
        var legend = [];
        for (var i = 0; i < transactions.length; i++) {
          if (legend[transactions[i].category] == null) {
            var date = new Date(transactions[i].date);
            if (date.getMonth() == month && date.getFullYear() == year) {
              var category = {};
              category.name = categories[transactions[i].category].name;
              category.icon_android = categories[transactions[i].category].icon_android;
              category.icon_ios = categories[transactions[i].category].icon_ios;
              category.color = categories[transactions[i].category].color;
              legend[transactions[i].category] = category;
            }
          }
        }
        return legend;
      },
      getNames: function () {
        var names = [];
        for (var i = 0; i < categories.length; i++) {
          names[i] = categories[i].name;
        }
        return names;
      },
      getSpent: function (month, year) {
        var spent = [0, 0, 0, 0, 0, 0, 0];
        for (var i = 0; i < transactions.length; i++) {
          var date = new Date(transactions[i].date);
          if (date.getMonth() == month && date.getFullYear() == year) {
            spent[transactions[i].category] += transactions[i].amount;
          }
        }
        return spent;
      },
      getColors: function () {
        var colors = [];
        for (var i = 0; i < categories.length; i++) {
          colors[i] = categories[i].color;
        }
        return colors;
      },
      getNeedWant: function (month, year) {
        var needwant = [0, 0];
        for (var i = 0; i < transactions.length; i++) {
          var date = new Date(transactions[i].date);
          if (date.getMonth() == month && date.getFullYear() == year) {
            if (transactions[i].is_need) needwant[0] += transactions[i].amount;
            else needwant[1] += transactions[i].amount;
          }
        }
        return needwant;
      },
      getMonth: function (month, year) {
        var line = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var hasData = false;
        for (var i = 0; i < transactions.length; i++) {
          var date = new Date(transactions[i].date);
          if (date.getMonth() == month && date.getFullYear() == year) {
            line[date.getDate() - 1] += transactions[i].amount;
            hasData = true;
          }
        }
        if (hasData) {
          return [line];
        }
        return hasData;
      }
    };
  })

  .factory('Days', function () {

    var monthdays = [{
      id: 1, label: '1. im Monat'
    },
      {id: 2, label: '5. im Monat'},
      {id: 3, label: '10. im Monat'},
      {id: 4, label: '15. im Monat'},
      {id: 5, label: '20. im Monat'},
      {id: 6, label: '25. im Monat'},
      {id: 7, label: 'letzter im Monat'},
    ];

    var weekdays = [
      {id: 1, label: 'Montag'},
      {id: 2, label: 'Dienstag'},
      {id: 3, label: 'Mittwoch'},
      {id: 4, label: 'Donnerstag'},
      {id: 5, label: 'Freitag'},
      {id: 6, label: 'Samstag'},
      {id: 7, label: 'Sonntag'},
    ];

    return {
      getMonthdays: function () {
        return monthdays;
      },
      getWeekdays: function () {
        return weekdays;
      }
    };
  })


  .factory('Intervall', function () {
    var list = [
      {id: 0, name: 'monatlich', useAsDefault: true},
      {id: 1, name: 'wöchentlich', useAsDefault: false}
    ];

    return {
      setList: function (newList) {
        list = newList;
        return true;
      },
      getList: function () {
        return list;
      },
      getDefault: function () {
        for (var i = 0; i < list.length; i++) {
          if (list[i].useAsDefault == true) {
            return list[i];
          }
        }
      },
      setDefault: function (id, value) {
        list[id].useAsDefault = value;
        return true;
      }
    };
  })

  .factory('Order', function () {

    var amount = 0;
    var text = "";
    var day = 0;

    return {
      setAmount: function (amountValue) {
        amount = amountValue;
        return true;
      },
      getAmount: function () {
        return amount;
      },
      setText: function (textValue) {
        text = textValue;
        return true;
      },
      getText: function () {
        return text;
      },
      setDay: function (dayValue) {
        day = dayValue;
        return true;
      },
      getDay: function () {
        return day;
      },
    }
  })

  .factory('PunktZuKomma', function () {
    return {
      parse: function (value) {
        var text = parseFloat(value).toFixed(2).toString().replace(".", ",");
        return text;
      },
    };
  });

