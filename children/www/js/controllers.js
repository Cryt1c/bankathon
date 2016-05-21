angular.module('starter.controllers', [])

.service('webService', function($http, transactionsService, Amount) {
  var url = "/api/"; // change this for production -- gets proxied on to heroku app location
  var userId = 1;
  this.getUser = function() {
    return $http.get(url + "getChild?childId=" + userId);
  };
  this.getTransactions = function() {
    return $http.get(url + "getTransactionsByChild?childId=" + userId);
  };
  this.writeTransactions = function() {
    for (var i = 0; i<transactionsService.transactions().length; i++) {
      var tTrans = transactionsService.transactions()[i];
      if (!tTrans.writtenToServer) {
        // not yet written to server
        $http.post(url + "addTransaction",
          {"recipient": tTrans.recipient,
          "amount": tTrans.amount,
          "category": tTrans.category,
          "child_id": userId,
          "is_need": false
        });
        //flag as already written
        tTrans.writtenToServer = true;
      }
    }

  };
  this.writeBalance = function() {
    // write balance to server
    //var postString = url + "setBalance?childId=" + userId + "&newBalance=" + parseFloat(Amount.getAvailable());
    var json = {
      "childId": userId,
      "newBalance": parseFloat(Amount.getAvailable())
      };
      console.log(json);
    $http.post(url + "setBalance", json);

  };
})

.controller('DashCtrl', function($scope, $state, $ionicPopup, $ionicHistory, $ionicSlideBoxDelegate, Amount, Stats, PunktZuKomma, webService, transactionsService) {
  $scope.platform = ionic.Platform;

  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.punktZuKomma = PunktZuKomma;
    $scope.webService = webService;


    var userCallback = function(user) {
      $scope.user = user;
      Amount.setAvailable($scope.user.balance);
      $scope.available = Amount.getAvailable();
      $("#available-moneystack").moneystack("setMoney", Amount.getAvailable());

      // get transactions from this user since we now know they exist
      var transactionsCallback = function(data) {
        transactionsService.loadTransactionsJSON(data);
        // $scope.$apply();
        var transactions = transactionsService.transactions();

        Stats.resetSpent();
        Stats.setSpent(transactions);
        $scope.spentTotal = Amount.getSpentTotal(Stats.all());


      };
      webService.getTransactions().success(transactionsCallback).error(transactionsCallback);
    }
    webService.getUser().success(userCallback).error(userCallback);
  });

  $scope.transactionsService = transactionsService;
  $scope.stats = Stats.all();
  $scope.spentTotal = Amount.getSpentTotal($scope.stats);



  angular.element(document).ready(function() {
  	$("#available-moneystack").moneystack({yShift: 10});
    $("#available-moneystack").moneystack("setMoney", Amount.getAvailable());
  });

  $scope.showRequest = function() {

    $scope.data = {};
    $scope.data.amount = 10;
    var myRequest = $ionicPopup.show({
      template: '<label for="amount">{{user.name}} {{user.balance}}  Betrag {{data.amount}}€</label>'+
                '<input type="range" id="amount" min="0" max="20"  ng-model="data.amount">'+
                '<label for="message">Grund</label>'+
                '<input type="text" id="message" ng-model="data.message" required="required">',
      title: 'Geld anfordern',
      scope: $scope,
      buttons: [
      { text: 'Abbrechen' },
        {
          text: '<b>OK</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.data.message) {
              e.preventDefault();
            }
            else {
              setTimeout(function () {
                var answer;
                var reason;
                var amount = parseInt($scope.data.amount);
                if (amount <= 10) {
                  answer = true;
                  reason = "";
                  Amount.request(amount);
                  $scope.available = $scope.punktZuKomma.parse(Amount.getAvailable());
                  $("#available-moneystack").moneystack("setMoney", Amount.getAvailable());
                  $scope.webService.writeBalance();
                }
                else {
                  answer = false;
                  reason = '"Hallo Michael, du hast diesen Monat schon genug für ' + $scope.data.message + ' ausgegeben."';
                }
                var alertPopup = $ionicPopup.alert({
                  title: (answer ? '"Hallo Michi, weil du so brav warst, darfst du dir  ' + $scope.data.message + ' kaufen."' : reason),
                  template: (answer ? '<h2 style="color: green"> + € ' + $scope.data.amount + '</h2>' : "")
                });
              }, 1000);
            }
          }
        }
      ]
    });
  };

  // Triggered on a button click, or some other target
  $scope.showPay = function() {
    // An elaborate, custom popup
    $scope.myPopup = $ionicPopup.show({
      template: '<ion-list>'+
                '<ion-item ng-repeat="stat in stats" ng-click="showPayOk(stat)" style="background-color:{{stat.color}};" class="item-icon-left">'+
                '{{stat.name}}'+
                '</ion-item>'+
                '</ion-list>',
      title: 'Bezahlung vorbereiten',
      subTitle: 'Eine Kategorie wählen:',
      scope: $scope,
      buttons: [
        { text: 'Abbrechen',
          type: 'button-positive'
        }
      ]
    });
    };

    $scope.showPayOk = function(stat, myPopup) {
      $scope.myPopup.close();
      var alertPopup = $ionicPopup.alert({
        title: 'Zahlung bereit',
        template: 'Du kannst jetzt dein Handy ans Terminal halten und ' +
                stat.name +
                ' an der Kassa bezahlen.'
    });
    setTimeout(function(){ $scope.showPayResult(stat); }, 1000);
    setTimeout(function(){ alertPopup.close(); }, 2000);
  };
  $scope.showPayResult = function(stat) {
    //add transaction
    var recipientNames = ["Spar", "Billa", "Libro", "Amazon", "Mensa", "Der Mann"];
    var randomName = recipientNames[Math.floor(Math.random() * recipientNames.length)];
    var payment = parseFloat(parseFloat(Math.random() * 17.40).toFixed(2)); //2.50;

    $scope.transactionsService.createAndAddTransaction(randomName, payment, stat.id);
    // write to server immediately
    $scope.webService.writeTransactions();
    // also write new balance -- TODO you'd actually want to postpone this and relegate to a regular sync function

    var alertPopup = $ionicPopup.alert({
      title: 'Bezahlt',
      template: 'Du hast € ' +
                  $scope.punktZuKomma.parse(payment) +
                ' für ' +
                stat.name +
                ' ausgegeben.'
    });
    Amount.spend(payment);

    $scope.available = Amount.getAvailable();
    $scope.webService.writeBalance();
    Stats.spend(stat.id, payment);
    $scope.spentTotal = Amount.getSpentTotal($scope.stats);

    //var x = $(".spentTotal").eq(0).position().left;
    //var y = $(".spentTotal").eq(0).position().top;

    //console.log(x);
    //console.log(y);

    //$("#available-moneystack").moneystack("deductAndSendAmountToLocation", payment, {x: x, y: y});
    $("#available-moneystack").moneystack("setMoney", parseFloat(Amount.getAvailable()));

  }
})


.controller('HistoryCtrl', function($scope, $state, $ionicSlideBoxDelegate, Months, transactionsService) {
   $scope.platform = ionic.Platform;
   var date = new Date();
    $scope.currDate = Months.getMonth(date.getMonth()) + " " + date.getFullYear();
  $scope.transactionsService = transactionsService;

})
.controller('StatsCtrl', function($scope, $state, $ionicSlideBoxDelegate,Amount, Stats, Months, transactionsService, PunktZuKomma) {

  $scope.platform = ionic.Platform;
  $scope.Math = window.Math;

  var date = new Date();
  $scope.currDate = Months.getMonth(date.getMonth()) + " " + date.getFullYear();


  $scope.$on('$ionicView.enter', function() {

    var bottom = 0;
    var len = $("#list .item-elem").length;
    var height_total = 0;
    var height_ausgaben = 0;

    $("#list .item-elem").each(function(index, element) {
      //Hoehe holen
      var height = $(this).data('target');

      //Bottom ist der Startwert fuer das Element
      $(this).css("bottom", bottom);

      if(index == len - 2) {
        $('#line').css("bottom", bottom);
      };


      /* Animation; jede Animation wird verzoegert ausgeloest;
      *  um das linear auszufuehren, wird das mit dem jeweiligen Index multipliziert
      * (bei 400, 800, 1200 sek. eine Animation)
      */
      $(this).delay(400*index).animate({
        'height' : height + "px"
      },
        {
          duration: 500,
          complete: function() {
            //Text + Icons werden direkt nach der Animation eingeblendet
            $(this).find(".child").show();

            if(index == len - 2) {
              $('#line').show();
              $(".ausgaben").show();
            };

            if(index == len - 1) {
              $(".total").show();
            };
          },
        });
      //Startwert fuer das naechste Element erhoehen
      bottom += parseFloat(height);

      if(index == len - 2) {
        height_ausgaben = bottom - 5;
        $(".ausgaben").css("bottom", height_ausgaben);
      };

      if(index == len - 1) {
        height_total = bottom - 5;
        $(".total").css("bottom", height_total);
      };

    });



  });

  $scope.$on('$ionicView.beforeEnter', function() {

    $scope.punktZuKomma = PunktZuKomma;

    $scope.stats = Stats.all();
    $scope.available = Amount.getAvailable();
    $scope.spentTotal = Amount.getSpentTotal($scope.stats);
    $scope.stats = Stats.getHeights($scope.spentTotal, $scope.available);

    $("#list .item-elem").each(function(key, bar) {
          /* Hoehe und Startwert (=bottom) muessen jedes Mal zurueck gesetzt werden,
          *  damit die Animation wieder von vorne beginnt, wenn der Tab wieder geoeffnet wird
          */
          $('#line').hide();
          $(".ausgaben").hide();
          $(".total").hide();
          $(this).css("height", "0px");
          $(this).css("bottom", "0px");
    });
  });

});
