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
    var available = 47.00;
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

  .factory('Stats', function () {

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

    transactions = [{
      id: 1,
      amount: 10,
      recipient: "Spar",
      category: 1,
      date: "2016-05-19T00:00:00.000Z",
      is_need: true,
      child_id: 1,
      timestamp: "2016-05-19T12:31:54.624Z"
    },
      {
        id: 2,
        amount: 2.5,
        recipient: "Billa",
        category: 3,
        date: "2016-05-04T00:00:00.000Z",
        is_need: false,
        child_id: 1,
        timestamp: "2016-05-04T12:31:54.624Z"
      }];


    return {
      all: function () {
        return categories;
      },
      getLegend: function () {
        var legend = [];
        for (var i = 0; i < transactions.length; i++) {
          if (legend[transactions.category] == null) {
            var category = {};
            category.name = categories[transactions[i].category].name;
            category.icon_android = categories[transactions[i].category].icon_android;
            category.icon_ios = categories[transactions[i].category].icon_ios;
            category.color = categories[transactions[i].category].color;
            legend.push(category);
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
      getSpent: function () {
        var spent = [0, 0, 0, 0, 0, 0, 0];
        for (var i = 0; i < transactions.length; i++) {
          spent[transactions[i].category] += transactions[i].amount;
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
      getNeedWant: function () {
        var needwant = [0, 0];
        for (var i = 0; i < transactions.length; i++) {
          categories[transactions[i].category].spent += transactions[i].amount;
          if (transactions[i].is_need) needwant[0] += transactions[i].amount;
          else needwant[1] += transactions[i].amount;
        }
        return needwant;
      },
      getMonth: function (month, year) {
        var line = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var hasData = false;
        for (var i = 0; i < transactions.length; i++) {
          var date = new Date(transactions[i].timestamp);
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

