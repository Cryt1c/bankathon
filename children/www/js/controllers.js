angular.module('starter.controllers', ['ngCordova'])

  .service('webService', function ($http, transactionsService, Amount) {
    var runningOnMobile = ionic.Platform.isIOS() || ionic.Platform.isAndroid();
    var url = (runningOnMobile ? "http://pommo-backend.herokuapp.com/" : "/api/"); // change this for production -- gets proxied on to heroku app location
    var userId = 1;
    this.webSocketsInitialised = false;
    this.getUser = function () {
      return $http.get(url + "getChild?childId=" + userId);
    };
    this.getTransactions = function () {
      return $http.get(url + "getTransactionsByChild?childId=" + userId);
    };
    this.getMoneyRequests = function () {
      return $http.get(url + "getRequestsByChild?childId=" + userId);
    };
    this.writeTransactions = function () {
      for (var i = 0; i < transactionsService.transactions().length; i++) {
        var tTrans = transactionsService.transactions()[i];
        if (!tTrans.writtenToServer && !(tTrans.ephemeral)) {
          // not yet written to server
          $http.post(url + "addTransaction",
            {
              "recipient": tTrans.recipient,
              "amount": tTrans.amount,
              "category": tTrans.category,
              "child_id": userId,
              "is_need": tTrans.isNeed,
              "type": (tTrans["type"] || 0),
              "request_id": (tTrans["requestId"] || 0)
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
    this.sendMoneyRequest = function (amount, message, parentId) {
      var json = {
        "amount": amount,
        "reason": message,
        "childId": userId,
        "parentId": parentId,
        "name": "Michael" //TODO remove

      };
      console.log(json);
      $http.post(url + "initRequest", json);
    };
    var wsEventHandler = function (wsData) {
      // handle events incoming via WebSockets
      // the *event* field gives information about the type of event
      if (wsData.event = "NEW_TRANSACTION_REQUEST") {
        // someone requests a payment -- show screen

      }
    };
    var initWebSockets;
    var incomingMessageHandler;
    var webService = this;
    initWebSockets = function (incomingEventHandler) {
      var host = "ws://pommo-backend.herokuapp.com/";
      this.incomingMessageHandler = incomingEventHandler;
      /*"ws://localhost:5000"; // url.replace(/^http/, 'ws');*/
      var ws = new WebSocket(host);
      ws.onmessage = function (msgEvent) {
        var msgData = JSON.parse(msgEvent.data);
        if (msgData.targetType === "child" && msgData.targetId == userId)
          webService.incomingMessageHandler(msgData);

      };
      ws.onopen = function () {
        console.log("ws OPEN ");
      };
      ws.onerror = function () {
        //debugger;
        console.log("es ERROR");
      };
      ws.onclose = function () {
        // websocket about to close -- reopen after time
        console.log("ws CLOSE ");
        setTimeout(initWebSockets, 1000);
      };
      this.webSocketsInitialised = true;
    };
    this.initWebSockets = initWebSockets;

  })

  .controller('DashCtrl', function ($scope, $state, $ionicPopup, $ionicHistory, $ionicSlideBoxDelegate, Amount, Stats, PunktZuKomma, webService, transactionsService, $cordovaToast) {
    $scope.platform = ionic.Platform;
    $scope.handleRequestStatusUpdate = function (eventData) {
      var requestId = eventData.requestId;
      var request = eventData["request"];
      var newStatus = eventData.newStatus;
      var response = eventData.response;
      var amount = eventData.amount;
      switch (newStatus) {
        case 0:
          // pending
          // do nothing
          break;
        case 1:
          // granted
          // show and create associated transaction
          var messageString = (response.substring(0, "(pregranted)".length) == "(pregranted)" ? "Du hast Geld erhalten! Nachricht: <br><br>" + response.substring(12) : "Deine Anfrage über " + PunktZuKomma.parse(amount) + " € wurde angenommen. <strong>Nachricht:<strong><br><br>" + response);
          var alertPopup = $ionicPopup.alert({
            title: messageString,
            template: '<h2 style="color: green"> + ' + PunktZuKomma.parse(amount) + ' € </h2>'
          });
          alertPopup.then(function () {
            Amount.request(amount);
            $scope.available = Amount.getAvailable();
            $scope.webService.writeBalance();

            // show new amount
            $("#available-moneystack").moneystack("setMoney", Amount.getAvailable());
            // TODO create a transaction
            var newT = $scope.transactionsService.createTransaction("Geldanfrage", amount, 7);
            newT.type = 1; // asset
            newT.writtenToServer = true; // do not write to server
            newT.ephemeral = true; // will only exist within this app -- never written to server
            //TODO assign request id
            $scope.transactionsService.addTransaction(newT);
          });
          break;
        case 2:
          // denied
          // show alert
          var alertPopup = $ionicPopup.alert(
            {
              title: "Deine Anfrage über " + PunktZuKomma.parse(amount) + " € wurde abgelehnt. <strong>Begründung:<strong><br><br>" +
              response, template: ""
            });
          alertPopup.then(function () {
          });
          break;
      }
    };
    $scope.$on("$ionicView.loaded", function () {
      // initialise the view
      //'$ionicView.beforeEnter', function () {
      $scope.punktZuKomma = PunktZuKomma;
      $scope.webService = webService;
      $scope.available = 0;

      //TODO move to separate method
      // set up user interface


      // load user data
      var userCallback = function (user) {
        $scope.user = user;
        Amount.setAvailable($scope.user.balance);
        $scope.available = Amount.getAvailable();
        $("#available-moneystack").moneystack("setMoney", Amount.getAvailable());
        $scope.transactionsService = transactionsService;

        // set up WebSockets
        if (!webService.webSocketsInitialised) {
          webService.initWebSockets(function (eventData) {
            if (eventData.event == "NEW_TRANSACTION_REQUEST") {
              // someone requests a payment -- show screen
              //$scope.showPay();
              if ($scope.readyToPay && $scope.pendingTransaction) {
                // update transaction information
                var trans = $scope.pendingTransaction;
                trans.amount = parseFloat(eventData.amount);
                trans.recipient = eventData.vendor;
                // finish payment
                $scope.finishPayment();
              }
            }
            else if (eventData.event == "MONEY_REQUEST_UPDATE") {
              // parents are updating money
              $scope.handleRequestStatusUpdate(eventData);
            }
          });
        }
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

        // also get requests and add them (for now only as ephemeral transactions)
        var moneyRequestCallback = function (data) {
          // data is in json format -- an array

          for (var i = 0; i < data.length; i++) {
            var thisRequest = data[i];
            // if this request was granted, create an ephemeral transaction representation to represent it
            if(thisRequest.status == 1) {
              var newT = transactionsService.createTransaction(thisRequest.reason, thisRequest.amount, 7);
              newT.writtenToServer = true;
              newT.ephemeral = true;
              newT.type = 1; // asset
              newT.date = new Date(thisRequest.timestamp);
              $scope.transactionsService.addTransaction(newT);
            }
          }
          Stats.resetSpent();
          Stats.setSpent($scope.transactionsService.transactions());
        };
        webService.getMoneyRequests().success(moneyRequestCallback).error(moneyRequestCallback);


      }
      webService.getUser().success(userCallback).error(userCallback);
      //}
    });
    //$scope.$on();


    $scope.stats = Stats.all();
    $scope.spentTotal = Amount.getSpentTotal($scope.stats);


    angular.element(document).ready(function () {
      // set up user interface
      var contentView = $("#available-moneystack").closest("ion-content");
      if (contentView) {
        var topArea = $("#top-area");
        var payButton = $("#pay");
        // height of moneystack  = total available height - button height - lower edge of top area
        var moneystackHeight = contentView.height() -
          (topArea.height() + 60) - (payButton.height() + 30) - topArea.offset().top - 15 /*padding*/;
        $("#available-moneystack").css("height", moneystackHeight);
      }

      $("#available-moneystack").moneystack({yShift: 10});
      $("#available-moneystack").moneystack("setMoney", Amount.getAvailable());
    });

    // show money request function:

    $scope.showRequest = function () {
      $scope.data = {};
      $scope.data.amount;
      var myRequest = $ionicPopup.show({
        template: '<label for="amount">Betrag in € *</label>' +
        '<input type="number" step="0.01" min="0" max="1000" id="amount" for="slider" ng-model="data.amount" required="required" ng-change="changeButton()">' +
        '<div class="spacer"></div>' +
        '<label for="message">Grund*</label>' +
        '<input type="text" id="message" ng-model="data.message" required="required" ng-change="changeButton()">',
        title: 'Geld anfordern',
        scope: $scope,
        buttons: [
          {
            text: 'Abbrechen',
            type: 'button-stable',
            onTap: function () {
              myRequest.close();
            }
          },
          {
            text: '<b>OK</b>',
            type: 'button-ok button-hidden button-positive',
            onTap: function (e) {
              var msg = "Deine Bitte um " + PunktZuKomma.parse($scope.data.amount) + " € wurde gesendet";
              console.log(msg);
              //TODO: activate Toast before release (Toast not working in web browser); tested in emulator for ios + android
              //if ($cordovaToast && $cordovaToast.show) $cordovaToast.show(msg,'long','center');
              $scope.webService.sendMoneyRequest(parseFloat($scope.data.amount), $scope.data.message, $scope.user.parent_id);
            }
          }
        ]
      });
    };

    $scope.changeButton = function () {
      if ($scope.data.message && !isNaN(parseFloat($scope.data.amount)) && $scope.data.amount > 0) {
        $('.button-ok').removeClass('button-hidden');
      } else {
        $('.button-ok').addClass('button-hidden');
      }
    };

    $scope.initPayment = function () {
      // create a new pending transaction
      $scope.pendingTransaction = transactionsService.createTransaction("", 0, -1); // create empty transaction
      $scope.showPay();
    };
    // Triggered on a button click, or some other target
    $scope.showPay = function () {
      // An elaborate, custom popup
      $scope.myPopup = $ionicPopup.show({
        template: '<ion-list>' +
        '<ion-item ng-repeat="stat in stats" ng-if="$index < 7" ng-click="chooseCategory(stat)" style="background-color:{{stat.color}};" class="item-icon-left">' +
        '{{stat.name}}' +
        '</ion-item>' +
        '</ion-list>',
        title: 'Bezahlung vorbereiten',
        subTitle: 'Eine Kategorie wählen:',
        scope: $scope,
        buttons: [
          {
            text: 'Abbrechen',
            type: 'button-stable',
            onTap: function () {
              $scope.pendingTransaction = null; // discard current transaction
              $scope.myPopup.close();
            }
          }
        ]
      });
    };
    $scope.chooseCategory = function (category) {
      // choose category for the pending transaction, if there is any
      if ($scope.pendingTransaction) {
        $scope.pendingTransaction.category = category.id;
        $scope.myPopup.close();
        $scope.readyPayment();
      }
    };
    $scope.readyPayment = function () {
      if (!$scope.pendingTransaction) return;
      var trans = $scope.pendingTransaction;
      var payment = true;

      $scope.myPopup.close();
      var payPopup = $ionicPopup.alert({
        title: 'Zahlung bereit',
        template: 'Du kannst jetzt dein Handy ans Terminal halten und ' +
        Stats.get(trans.category).name +
        ' an der Kassa bezahlen.' +
        ' <div class="spacer"></div>' +
        '<img src="img/icon_nfc.png" class="icon icon_nfc"/>',
        buttons: [
          {
            text: 'Zahlung abbrechen',
            type: 'button-stable',
            onTap: function () {
              payment = false;
              $scope.pendingTransaction = null; // discard current transaction
              $scope.payPopup.close();
            }
          }
        ]
      });
      $scope.payPopup = payPopup;
      $scope.currentPopup = payPopup;
      $scope.readyToPay = true;
      /* setTimeout(function () {
       if (payment) {
       payPopup.close();
       $scope.finishPayment();
       }
       }, 1000);*/
    };

    $scope.finishPayment = function () {
      var trans = $scope.pendingTransaction;
      if (!trans) return;
      //add transaction
      if ($scope.currentPopup) $scope.currentPopup.close();
      $scope.readyToPay = false; // no longer available for transaction requests from vendor
      var stat = Stats.get(trans.category);

      var payment = trans.amount;
      var recipientName = trans.recipient;
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
        '<img src="img/icon_check.png" class="icon icon_check"/>' +
        '<div class="spacer"></div>' +
        'Hast du diesen Einkauf gebraucht oder gewollt?',
        buttons: [
          {
            text: 'Gebraucht',
            type: 'button-positive',
            onTap: function () {
              $scope.pendingTransaction.isNeed = true;
              $scope.pendingTransaction.writtenToServer = false;
              $scope.transactionsService.addTransaction($scope.pendingTransaction);
              $scope.pendingTransaction = null;

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
              //trans = $scope.transactionsService.createAndAddTransaction(randomName, payment, stat.id, false);
              $scope.pendingTransaction.isNeed = false;
              $scope.pendingTransaction.writtenToServer = false;
              $scope.transactionsService.addTransaction($scope.pendingTransaction);
              $scope.pendingTransaction = null;

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
  })


  .controller('HistoryCtrl', function ($scope, $state,  $window, $ionicSlideBoxDelegate, Amount, transactionsService, Stats, PunktZuKomma) {
    var selectedCat, selectedDate, dev_height, dev_width;

    $scope.$on('$ionicView.loaded', function () {
      $scope.platform = ionic.Platform;
      $scope.filterMonth = new Date();
      dev_width = $window.innerWidth;
      dev_height = $window.innerHeight;
      $scope.dev_height = dev_height;
      $scope.dev_width = dev_width;
    });


    $scope.$on('$ionicView.beforeEnter', function () {
      selectedCat = -1;

      $scope.punktZuKomma = PunktZuKomma;
      $scope.available = Amount.getAvailable();
      $scope.transactionsService = transactionsService;
      $scope.changeMonth($scope.filterMonth);
      $scope.currentMonth = true;
      $scope.filterOpened = false;
      $scope.resetFilter = true;

      $scope.stats = Stats.all();
      $scope.stats[7].color = "#006B08";
    });


    $scope.$on('$ionicView.enter', function () {
      if (dev_height > 600) {
        var elements = document.getElementsByClassName("transaction_nw");
        for(var i = 0; i < elements.length; i++) {
          elements[i].style.marginLeft = "20%";
        };
      }
    });

    $scope.changeMonth = function (filterMonth) {
      $scope.filterMonth = filterMonth;

      $scope.noItems = false;
      selectedDate = filterMonth;
      var selectedMonth = filterMonth.getMonth();
      var selectedYear = filterMonth.getYear();

      var current = new Date();
      if (selectedMonth == current.getMonth() && selectedYear == current.getYear()) {
        $scope.currentMonth = true;
      }
      else {
        $scope.currentMonth = false;
      }

      var trans = transactionsService.transactions();
      $scope.transactions = [];

      //loop through transaction and filter for date and category
      for (var i = 0; i < trans.length; i++) {
        if (trans[i].date.getMonth() == selectedMonth && trans[i].date.getYear() == selectedYear) {
          if (selectedCat >= 0 && trans[i].category == selectedCat) {
            $scope.transactions.push(trans[i]);
          }
          else if (selectedCat == -1) {
            $scope.transactions.push(trans[i]);
          }
        }
      }
      if ($scope.transactions.length == 0) {
        $scope.noItems = true;
      }
    };

    $scope.openFilter = function () {
      $scope.filterOpened = !$scope.filterOpened;
      if ($scope.filterOpened) {
        document.getElementById('icon_filter').classList.add('on');
      }
      else {
        document.getElementById('icon_filter').classList.remove('on');
      }

    };

    $scope.selectFilter = function (category) {

      $scope.resetFilter = !$scope.resetFilter;

      //change background color of the active category
      var elements = document.getElementsByClassName("category_elem item");
      for (var i = 0; i < elements.length; i++) {
        elements[i].getElementsByClassName('category_span')[0].style.backgroundColor = "transparent";
      }
      ;

      if (selectedCat == category.id) {
        if ($scope.resetFilter) {
          selectedCat = -1;
        }
        else {
          selectedCat = category.id;
          var active = document.getElementById("cat-elem-" + selectedCat);
          active.getElementsByClassName('category_span')[0].style.backgroundColor = category.color;
        }
      }
      else {
        selectedCat = category.id;
        var active = document.getElementById("cat-elem-" + selectedCat);
        active.getElementsByClassName('category_span')[0].style.backgroundColor = category.color;
      }


      $scope.noItems = false;
      var selectedMonth = selectedDate.getMonth();
      var selectedYear = selectedDate.getYear();
      var trans = transactionsService.transactions();
      $scope.transactions = [];

      //loop through transaction and filter for date and category
      for (var i = 0; i < trans.length; i++) {
        if (trans[i].date.getMonth() == selectedMonth && trans[i].date.getYear() == selectedYear) {
          if (selectedCat >= 0 && trans[i].category == selectedCat) {
            $scope.transactions.push(trans[i]);
          }
          else if (selectedCat == -1) {
            $scope.transactions.push(trans[i]);
          }
        }
      }
      if ($scope.transactions.length == 0) {
        $scope.noItems = true;
      }
    };
  })


  .controller('StatsCtrl', function ($scope, $state, $window, Amount, Stats, transactionsService, PunktZuKomma) {
    var dev_width, dev_height, calc_height, height_available;

    $scope.$on('$ionicView.loaded', function () {
      $scope.platform = ionic.Platform;
      $scope.Math = window.Math;
      $scope.filterMonth = new Date();

      //set width + height of statistics depending on device
      dev_width = $window.innerWidth;
      dev_height = $window.innerHeight;
      calc_height = 350;
      $scope.dev_height = dev_height;
      $scope.dev_width = dev_width;

      if (dev_height > 600 && dev_width < 370) { //galaxy S4
        $('.border').css('height', "470px");
        $('.border').css('width', "260px");
        $('.border').css('top', "65px");
        $('#line').css('width', "330px");
        $('#line').css('margin-bottom', "-6px");

        $('.anzeige').css('height', "470px");
        $('.anzeige').css('width', "80px");
        $('.anzeige').css('top', "16px");
        $('.anzeige .total').css('bottom', "440px");
        $('#list .list').css('height', "450px");
        $('#list .list').css('width', "240px");
        $('#list .list').css('top', "20px");
        calc_height = 450;
      }
      if (dev_height > 600 && dev_width > 360) { //iphone 6
        $('.border').css('height', "470px");
        $('.border').css('width', "280px");
        $('.border').css('top', "65px");
        $('#line').css('width', "350px");
        $('#line').css('margin-bottom', "-6px");
        $('.anzeige').css('height', "470px");
        $('.anzeige').css('width', "80px");
        $('.anzeige').css('top', "16px");
        $('.anzeige .total').css('bottom', "440px");
        $('#list .list').css('height', "450px");
        $('#list .list').css('width', "260px");
        $('#list .list').css('top', "20px");
        calc_height = 450;
      }
    })

    $scope.$on('$ionicView.beforeEnter', function () {
      resetPot();
      setup($scope.filterMonth);
    });

    $scope.$on('$ionicView.enter', function () {

      if (dev_height > 600) {
        el = document.getElementById("noItems");
        el.style.fontSize = "14px";
        el = document.getElementById("anzeige");
        el.style.fontSize = "14px";

        var elements = document.getElementsByClassName("child__icon");
        for(var i = 0; i < elements.length; i++) {
          elements[i].style.fontSize = "20px";
          elements[i].style.left = "25px";
        };
        var elements = document.getElementsByClassName("child__name");
        for (var i = 0; i < elements.length; i++) {
          elements[i].style.left = "65px";
          elements[i].style.fontSize = "14px";
        };
        var elements = document.getElementsByClassName("child__betrag");
        for (var i = 0; i < elements.length; i++) {
          elements[i].style.right = "35px";
          elements[i].style.fontSize = "14px";
        };
      }

      if(!$scope.noItems) {
        animate();
      }
    })

    resetPot = function () {
      $("#list .item-elem").each(function (key, bar) {
        /* Hoehe und Startwert (=bottom) muessen jedes Mal zurueck gesetzt werden,
         *  damit die Animation wieder von vorne beginnt, wenn der Tab wieder geoeffnet wird
         */
        $('#line').hide();
        $(".ausgaben").hide();
        $(".total").hide();
        $(this).css("height", "0px");
        $(this).css("bottom", "15px");
        if(key == 0) {
          $(this).css("bottom", "0px");
        }
      });
    }

    setup = function (filterMonth) {
      $scope.punktZuKomma = PunktZuKomma;
      $scope.filterMonth = filterMonth;
      var selectedMonth = $scope.filterMonth.getMonth();
      var selectedYear = $scope.filterMonth.getYear();


      Stats.resetHeights();
      Stats.resetSpent();
      $scope.stats = Stats.all();
      $scope.total = 0;
      $scope.noItems = false;

      var transactions = transactionsService.transactions();

      for (var i = 0; i < transactions.length; i++) {
        if (transactions[i].date.getMonth() == selectedMonth && transactions[i].date.getYear() == selectedYear) {

          $scope.stats[transactions[i].category].spent += transactions[i].amount;

          if (transactions[i].category != 7) { //keine einnahme
            $scope.total += transactions[i].amount;
          }
        }
      }
      if ($scope.total == 0) {
        $scope.noItems = true;
      }


      var current = new Date();
      if (current.getMonth() == selectedMonth && current.getYear() == selectedYear) {
        $scope.stats[7].spent = Amount.getAvailable();
        $scope.stats[7].name = "Taschengeld";
      }
      else {
        $scope.stats[7].name = "Einnahmen";
      }

      $scope.stats[7].color = "#FFFFFF";
      $scope.available = $scope.stats[7].spent;
      $scope.stats = Stats.setHeights($scope.total, $scope.available, calc_height);
    }

    animate = function () {
      var bottom = 0;
      var len = $("#list .item-elem").length;
      var height_ausgaben = 0;

      $("#list .item-elem.item").each(function (index, element) {
        //Hoehe holen
        $(this).css("height", "0px");
        var height = Stats.getHeight(index);

        //Bottom ist der Startwert fuer das Element
        //$(this).css("bottom", bottom);

        if (index == len - 1) {
          $('#line').css("bottom", bottom);
          height_ausgaben = bottom - 10;
          $(".ausgaben").css("bottom", height_ausgaben);
        };

        /* Animation; jede Animation wird verzoegert ausgeloest;
         *  um das linear auszufuehren, wird das mit dem jeweiligen Index multipliziert
         * (bei 400, 800, 1200 sek. eine Animation)
         */
        $(this).delay(200 * index).animate({
            'height': height + "px",
            'bottom': bottom + "px"
          },
          {
            duration: 150,
            complete: function () {
              //Text + Icons werden direkt nach der Animation eingeblendet
              $(this).find(".child").show();

              if (index == len - 2) {
                $('#line').show();
                $(".ausgaben").show();
              };
              if (index == len - 1) {
                $(".total").show();
              };
            },
          });

        //Startwert fuer das naechste Element erhoehen
        bottom += parseFloat(height);
      });

    }

    $scope.changeMonth = function (filterMonth) {
      resetPot();
      setup(filterMonth);
      if(!$scope.noItems) {
        animate();
      }
    }
  });
