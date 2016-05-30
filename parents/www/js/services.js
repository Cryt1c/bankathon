angular.module('starter.services', [])

  .factory('Kids', function() {

    var kids = [{
      id: 0,
      name: 'Michael'
    }, {
      id: 1,
      name: 'Sophie'
    }];
    var kidsNum = kids.length;

    return {
      getAll: function () {
        return kids;
      },
      getNum: function(kids) {
        return kids.length;
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

  .factory('Categories', function () {

    var stats = [{
      id: 0,
      name: 'Essen',
      spent: 15.00
    }, {
      id: 1,
      name: 'Spaß',
      spent: 20.00
    }, {
      id: 2,
      name: 'Sport',
      spent: 30.00
    }, {
      id: 3,
      name: 'Schulsachen',
      spent: 5.00
    }, {
      id: 4,
      name: 'Kleidung',
      spent: 15.00
    }, {
      id: 5,
      name: 'Telefon',
      spent: 10.00
    }, {
      id: 6,
      name: 'Geschenke',
      spent: 20.00
    }];

    return {
      all: function () {
        return stats;
      },
      resetSpent: function () {
        for (var i = 0; i < stats.length; i++) {
          stats[i].spent = 0;
        }
      }
    };
  })

  .factory('Months', function () {

    var months = [
      {id: 1, name: 'Jänner'},
      {id: 2, name: 'Februar'},
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
      getMonth: function (id) {
        return months[id].name;
      },
      getAll: function () {
        return months;
      }
    };

  })


  .factory('Days', function () {

    var monthdays = [];


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
        monthdays = [];
        for(var i = 1; i <= 28; i++) {
          var temp = {};
          temp.id = i;
          temp.label = ' ' + i + '. Tag im Monat';
          monthdays.push(temp);
        }
        return monthdays;
      },
      getWeekdays: function() {
        return weekdays;
      }
    };
  })


  .factory('Intervall', function() {
    var list = [
      {id: 1, name: 'monatlich', useAsDefault: true},
      {id: 2, name: 'wöchentlich', useAsDefault: false}
    ];

    return {
      setList: function (newList) {
        list = newList;
        return true;
      },
      getList: function() {
        return list;
      },
      getDefault: function () {
        for(var i = 0; i < list.length; i++) {
          if(list[i].useAsDefault == true) {
            return list[i];
          }
        }
      }
    }
  })

  .factory('Order', function() {

    var amount = 0;
    var text = "";
    var day = 0;

    return {
      setAmount: function(amountValue) {
        amount = amountValue;
        return true;
      },
      getAmount: function() {
        return amount;
      },
      setText: function(textValue) {
        text = textValue;
        return true;
      },
      getText: function() {
        return text;
      },
      setDay: function(dayValue) {
        day = dayValue;
        return true;
      },
      getDay: function() {
        return day;
      }
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

