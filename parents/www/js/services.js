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
    var available = 0.00;
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
      spent: 0.00
    }, {
      id: 1,
      name: 'Spaß',
      spent: 0.00
    }, {
      id: 2,
      name: 'Sport',
      spent: 0.00
    }, {
      id: 3,
      name: 'Schulsachen',
      spent: 0.00
    }, {
      id: 4,
      name: 'Kleidung',
      spent: 0.00
    }, {
      id: 5,
      name: 'Telefon',
      spent: 0.00
    }, {
      id: 6,
      name: 'Geschenke',
      spent: 0.00
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
      getMonth: function (id) {
        return months[id].name;
      },
      getAll: function () {
        return months;
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
  });

