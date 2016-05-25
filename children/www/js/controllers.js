angular.module('starter.controllers', [])

  .service('webService', function ($http, transactionsService, Amount) {
    var url = "/api/"; // change this for production -- gets proxied on to heroku app location
    var userId = 1;
    this.getUser = function () {
      return $http.get(url + "getChild?childId=" + userId);
    };
    this.getTransactions = function () {
      return $http.get(url + "getTransactionsByChild?childId=" + userId);
    };
    this.writeTransactions = function () {
      for (var i = 0; i < transactionsService.transactions().length; i++) {
        var tTrans = transactionsService.transactions()[i];
        if (!tTrans.writtenToServer) {
          // not yet written to server
          $http.post(url + "addTransaction",
            {
              "recipient": tTrans.recipient,
              "amount": tTrans.amount,
              "category": tTrans.category,
              "child_id": userId,
              "is_need": tTrans.is_need
            });
          //flag as already written
          tTrans.writtenToServer = true;
        }
      }

    };
    this.writeBalance = function () {
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

  .controller('DashCtrl', function ($scope, $state, $ionicPopup, $ionicHistory, $ionicSlideBoxDelegate, Amount, Stats, PunktZuKomma, webService, transactionsService) {
      $scope.platform = ionic.Platform;

      $scope.$on('$ionicView.beforeEnter', function () {
        $scope.punktZuKomma = PunktZuKomma;
        $scope.webService = webService;


        var userCallback = function (user) {
          $scope.user = user;
          Amount.setAvailable($scope.user.balance);
          $scope.available = Amount.getAvailable();
          $("#available-moneystack").moneystack("setMoney", Amount.getAvailable());

          // get transactions from this user since we now know they exist
          var transactionsCallback = function (data) {
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


      angular.element(document).ready(function () {
        $("#available-moneystack").moneystack({yShift: 10});
        $("#available-moneystack").moneystack("setMoney", Amount.getAvailable());
      });

      $scope.showRequest = function () {

        $scope.data = {};
        $scope.data.amount = 10;
        var myRequest = $ionicPopup.show({
          template: '<label for="amount">Betrag in €</label>' +
          '<input type="number" id="amount" for="slider" ng-model="data.amount">' +
          '<div class="spacer"></div>' +
          '<label for="message">Grund</label>' +
          '<input type="text" id="message" ng-model="data.message" required="required" ng-change="changeButton()">',
          title: 'Geld anfordern',
          scope: $scope,
          buttons: [
            {
              text: 'Abbrechen',
              type: 'button-positive'
            },
            {
              text: '<b>OK</b>',
              type: 'button-ok button-hidden button-positive',
              onTap: function (e) {
                setTimeout(function () {
                  var answer;
                  var reason;
                  var amount = parseInt($scope.data.amount);
                  if (amount <= 200) {
                    answer = true;
                    reason = "";
                    Amount.request(amount);
                    $scope.available = Amount.getAvailable();
                    $scope.webService.writeBalance();
                  }
                  else {
                    answer = false;
                    reason = '"Hallo Michael, du hast diesen Monat schon genug für ' + $scope.data.message + ' ausgegeben."';
                  }
                  var alertPopup = $ionicPopup.alert({
                    title: (answer ? '"Hallo Michi, weil du so brav warst, darfst du dir  ' + $scope.data.message + ' kaufen."' : reason),
                    template: (answer ? '<h2 style="color: green"> + ' + $scope.data.amount + '€ </h2>' : "")
                  });
                  alertPopup.then(function () {
                    $("#available-moneystack").moneystack("setMoney", Amount.getAvailable());
                  });
                }, 1000);
              }
            }
          ]
        });
      };

      $scope.changeButton = function () {
        if ($scope.data.message) {
          $('.button-ok').removeClass('button-hidden');
        } else {
          $('.button-ok').addClass('button-hidden');
        }
      };

      // Triggered on a button click, or some other target
      $scope.showPay = function () {
        // An elaborate, custom popup
        $scope.myPopup = $ionicPopup.show({
          template: '<ion-list>' +
          '<ion-item ng-repeat="stat in stats" ng-click="showPayOk(stat)" style="background-color:{{stat.color}};" class="item-icon-left">' +
          '{{stat.name}}' +
          '</ion-item>' +
          '</ion-list>',
          title: 'Bezahlung vorbereiten',
          subTitle: 'Eine Kategorie wählen:',
          scope: $scope,
          buttons: [
            {
              text: 'Abbrechen',
              type: 'button-positive'
            }
          ]
        });
      };

      $scope.showPayOk = function (stat, myPopup) {
        var payment = true;
        $scope.myPopup.close();
        var payPopup = $ionicPopup.alert({
          title: 'Zahlung bereit',
          template: 'Du kannst jetzt dein Handy ans Terminal halten und ' +
          stat.name +
          ' an der Kassa bezahlen.' +
          ' <div class="spacer"></div>' +
          '<img src="../img/icon_nfc.png" class="icon icon_nfc"/>',
          buttons: [
            {
              text: 'Zahlung abbrechen',
              type: 'button-positive',
              onTap: function () {
                payment = false;
                $scope.myPopup.close();
              }
            }
          ]
        });
        setTimeout(function () {
          if (payment) {
            payPopup.close();
            $scope.showPayResult(stat);
          }
        }, 1000);
      };

      $scope.showPayResult = function (stat) {
        //add transaction
        var recipientNames = ["Spar", "Billa", "Libro", "Amazon", "Mensa", "Der Mann"];
        var randomName = recipientNames[Math.floor(Math.random() * recipientNames.length)];
        var payment = parseFloat(parseFloat(Math.random() * 17.40).toFixed(2)); //2.50;

        $scope.available = Amount.getAvailable();
        if (payment > $scope.available) {
          var alertPopup = $ionicPopup.alert({title: 'Du hast nicht mehr genug Taschengeld übrig.'});
          return;
        }


        var resultPopup = $ionicPopup.alert({
          title: 'Bezahlt',
          template: 'Du hast ' +
          $scope.punktZuKomma.parse(payment) +
          ' € für ' +
          stat.name +
          ' ausgegeben.' +
          '<div class="spacer"></div>' +
          '<img src="../img/icon_check.png" class="icon icon_check"/>' +
          '<div class="spacer"></div>' +
          'Hast du diesen Einkauf gebraucht oder gewollt?',
          buttons: [
            {
              text: 'Gebraucht',
              type: 'button-positive',
              onTap: function () {
                $scope.transactionsService.createAndAddTransaction(randomName, payment, stat.id, true);
                console.log("is_need true");
                // write to server immediately
                $scope.webService.writeTransactions();
                // also write new balance -- TODO you'd actually want to postpone this and relegate to a regular sync function

              }
            },
            {
              text: 'Gewollt',
              type: 'button-positive',
              onTap: function () {
                $scope.transactionsService.createAndAddTransaction(randomName, payment, stat.id, false);
                console.log("is_need false");
                // write to server immediately
                $scope.webService.writeTransactions();
                // also write new balance -- TODO you'd actually want to postpone this and relegate to a regular sync function
              }
            }
          ]
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

        resultPopup.then(function () {
          $("#available-moneystack").moneystack("setMoney", Amount.getAvailable());
        });
      }
    }
  )


  .controller('HistoryCtrl', function ($scope, $state, $ionicSlideBoxDelegate, Amount, Stats, Months, transactionsService, PunktZuKomma) {
    $scope.platform = ionic.Platform;
    var date = new Date();
    $scope.currDate = Months.getMonth(date.getMonth()) + " " + date.getFullYear();
    $scope.transactionsService = transactionsService;
    $scope.available = Amount.getAvailable();


    $scope.$on('$ionicView.beforeEnter', function () {
      $scope.punktZuKomma = PunktZuKomma;
      $scope.available = Amount.getAvailable();
    });

  })


  .controller('StatsCtrl', function ($scope, $state, $ionicSlideBoxDelegate, Amount, Stats, Months, transactionsService, PunktZuKomma) {

    $scope.platform = ionic.Platform;
    $scope.Math = window.Math;

    var date = new Date();
    $scope.currDate = Months.getMonth(date.getMonth()) + " " + date.getFullYear();


    $scope.$on('$ionicView.enter', function () {

      var bottom = 0;
      var len = $("#list .item-elem").length;
      var height_total = 0;
      var height_ausgaben = 0;

      $("#list .item-elem").each(function (index, element) {
        //Hoehe holen
        var height = $(this).data('target');

        //Bottom ist der Startwert fuer das Element
        $(this).css("bottom", bottom);

        if (index == len - 1) {
          $('#line').css("bottom", bottom);
        }
        ;


        /* Animation; jede Animation wird verzoegert ausgeloest;
         *  um das linear auszufuehren, wird das mit dem jeweiligen Index multipliziert
         * (bei 400, 800, 1200 sek. eine Animation)
         */
        $(this).delay(400 * index).animate({
            'height': height + "px"
          },
          {
            duration: 500,
            complete: function () {
              //Text + Icons werden direkt nach der Animation eingeblendet
              $(this).find(".child").show();

              if (index == len - 2) {
                $('#line').show();
                $(".ausgaben").show();
              }
              ;

              if (index == len - 1) {
                $(".total").show();
              }
              ;
            },
          });
        //Startwert fuer das naechste Element erhoehen
        bottom += parseFloat(height);

        if (index == len - 2) {
          height_ausgaben = bottom - 5;
          $(".ausgaben").css("bottom", height_ausgaben);
        }
        ;
      });
    });

    $scope.$on('$ionicView.beforeEnter', function () {

      $scope.punktZuKomma = PunktZuKomma;

      $scope.stats = Stats.all();
      $scope.available = Amount.getAvailable();
      $scope.spentTotal = Amount.getSpentTotal($scope.stats);
      $scope.stats = Stats.getHeights($scope.spentTotal, $scope.available);

      var height_available = $scope.available / ($scope.available + $scope.spentTotal) * 480;

      if (height_available < 25) {
        $scope.height_available = 25;
      }
      else {
        $scope.height_available = height_available;
      }


      $("#list .item-elem").each(function (key, bar) {
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
