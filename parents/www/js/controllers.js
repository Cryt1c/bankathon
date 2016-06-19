angular.module('starter.controllers', ['ngCordova', 'chart.js', 'ti-segmented-control'])
  .service('requestsService', function () {
    var requests;
    this.setRequests = function (requests) {
      this.requests = requests;
    }
  })
  .service('webService', function ($http, transactionsService, Amount, $filter) {
    var runningOnMobile = ionic.Platform.isIOS() || ionic.Platform.isAndroid();
    var url = (runningOnMobile ? "http://pommo-backend.herokuapp.com/" : "/api/");
    var userId = 1;
    this.webSocketsInitialised = false;
    this.getUser = function () {
      return $http.get(url + "getParent?parentId=" + userId);
    };
    // this.getTransactions = function () {
    //   return $http.get(url + "getTransactionsByChild?childId=" + userId);
    // };
    // this.getChildren = function () {
    //   return $http.get(url + "getChildrenForParent?parentId=" + userId);
    // };
    /** WEBSOCKETS
     var wsEventHandler = function(wsData) {
      // handle events incoming via WebSockets
      // the *event* field gives information about the type of event
      if (wsData.event = "NEW_TRANSACTION_REQUEST") {
        // someone requests a payment -- show screen

      }
    }; */

    this.getTransactions = function () {
      return $http.get(url + "getTransactionsByChild?childId=" + userId);
    };

    var webService = this;
    var incomingMessageHandler;
    var initWebSockets = function (incomingEventHandler) {
      var host = "ws://pommo-backend.herokuapp.com/";//"ws://localhost:5000"; // url.replace(/^http/, 'ws');
      var ws = new WebSocket(host);
      this.incomingMessageHandler = incomingEventHandler;
      ws.onmessage = function (msgEvent) {
        var msgData = JSON.parse(msgEvent.data);
        if (msgData.targetId == userId && msgData.targetType == "parent" && msgData.event == "NEW_MONEY_REQUEST")
          webService.incomingMessageHandler(msgData);
      };
      ws.onclose = function () {
        // websocket about to close -- reopen after time
        console.log("ws CLOSE ");
        setTimeout(webService.initWebSockets, 1000);
      };
      ws.onopen = function () {
        console.log("ws OPEN ");
      };
      this.webSocketsInitialised = true;
    };
    this.initWebSockets = initWebSockets;
    this.getMoneyRequests = function () {
      //returns money requests for this parent
      return $http.get(url + "getRequestsForParent?parentId=" + userId);
    };
    this.updateMoneyRequestStatus = function (requestId, newStatus, newResponse) {
      $http.post(url + "updateRequestStatus",
        {
          "requestId": requestId,
          "response": newResponse,
          "newStatus": newStatus
        });
    };
    var waitingForRequest = false;
    this.immediatelyGrantMoneyRequest = function (amount, message, childId) {
      var json = {
        "amount": amount,
        "reason": "(pregranted)" + message,
        "childId": childId,
        "parentId": userId,
        "name": "Michael", //TODO remove
        "status": 1 // granted
      };
      console.log(json);
      waitingForRequest = true;
      $http.post(url + "initRequest", json);//.success({
      //  this.updateMoneyRequestStatus()
      //});
    };
  })

  .service('kidsService', function () {
    this.selectedKid;
  })

  .controller('StartCtrl', function ($scope, requestsService, PunktZuKomma, transactionsService, $state, Stats, $ionicModal, $ionicPopup, $ionicSlideBoxDelegate, Kids, kidsService, webService) {
    $scope.platform = ionic.Platform;

    $scope.kids = Kids.getAll();
    $scope.webService = webService;

    // load requests
    var getMoneyRequestsCallback = function (data) {
      $scope.moneyRequests = data;
      requestsService.setRequests(data);
      //console.log(data);
      // check if there are any pending money requests
      // if so, alert the user to the most recent one
      //var filteredData = $filter('orderBy')(data, "timestamp");
      //filteredData = $filter('filter')({"status": 0}); // filter to only elements with pending status
      $scope.pendingRequests = data;

    };

    //Set List to vertical center depending on how many items are in the list
    NumberUpdate = function () {
      var kidsNum = Kids.getNum($scope.kids);
      if (kidsNum == 1) {
        $('.kids_list .list').css('padding-top', '180px');
      }
      else if (kidsNum == 2) {
        $('.kids_list .list').css('padding-top', '150px');
      }
      else if (kidsNum == 3) {
        $('.kids_list .list').css('padding-top', '100px');
      }
      else {
        $('.kids_list .list').css('padding-top', '50px');
      }
    };
    $scope.webService.getMoneyRequests().error(getMoneyRequestsCallback).success(getMoneyRequestsCallback);


    NumberUpdate();


    $scope.setKid = function (val) {
      kidsService.selectedKid = val;
    };

    //set everything for edit mode
    var editmode = false;
    $scope.editText = 'Bearbeiten';
    $scope.showEditMode = function () {

      if (editmode) {
        $scope.shouldShowDelete = false;
        $scope.shouldShowReorder = false;
        editmode = false;
        $scope.editText = 'Bearbeiten';
        $("#button_logout").show();
        $("#add_kid").hide();
      }
      else {
        $scope.shouldShowDelete = true;
        $scope.shouldShowReorder = true;
        editmode = true;
        $scope.editText = 'Fertig';
        $("#button_logout").hide();
        $("#add_kid").show();
      }
    };

    $scope.onKidDelete = function (kid) {

      console.log(kid);
      var confirmPopup = $ionicPopup.confirm({
        title: kid.name + ' entfernen?',
        template: 'Sind Sie sicher, dass Sie das Konto von ' + kid.name + ' löschen wollen? ' +
        kid.name + ' kann weiterhin über das Geld verfügen, Sie können allerdings kein Geld mehr senden.',
        cancelText: 'Nein',
        cancelType: 'button-default',
        okText: 'Ja',
        OkType: 'button-positive'
      });

      confirmPopup.then(function (res) {
        if (res) {
          $scope.kids.splice($scope.kids.indexOf(kid), 1);
          //TODO send info to backend
          NumberUpdate();
        }
      })
    };

    $scope.reorderKid = function (kid, fromIndex, toIndex) {
      $scope.kids.splice(fromIndex, 1);
      $scope.kids.splice(toIndex, 0, kid);
      //TODO save order in backend?
    };

    // Load the add dialog from the given template URL
    $ionicModal.fromTemplateUrl('templates/dialog-addKid.html', {
      scope: $scope,
      animation: 'slide-in-up',
    }).then(function (modal) {
      $scope.selectModal = modal;
      $scope.selectModalSlider = $ionicSlideBoxDelegate.$getByHandle('modalSlider');
      $scope.selectModalSlider.enableSlide(false);
    });

    $scope.closeSelectModal = function () {
      $scope.selectModal.hide();

      $ionicModal.fromTemplateUrl('templates/dialog-addKid.html', {
        scope: $scope,
        animation: 'slide-in-up',
      }).then(function (modal) {
        $scope.selectModal = modal;
        $scope.selectModalSlider = $ionicSlideBoxDelegate.$getByHandle('modalSlider');
        $scope.selectModalSlider.enableSlide(false);
      });
    };

    $scope.openSelectModal = function () {
      $scope.selectModalSlider.slide(0);
      $scope.selectModal.show();
    };

    $scope.addKid = function (addForm) {
      var newItem = {};
      newItem.name = addForm.name.$modelValue;
      newItem.paired = false;

      // Save new list in scope and factory
      $scope.kids.push(newItem);

      //TODO send to backend

      NumberUpdate();
      $scope.selectModalSlider.slide(1);
    };

    // var userCallback = function (user) {
    // set up WebSockets
    if (!webService.webSocketsInitialised) {
      webService.initWebSockets(function (eventData) {
        if (eventData.event == "NEW_MONEY_REQUEST") {
          if (webService.waitingForRequest) {
            // we're waiting for a request we made ourselves -- auto grant
            $scope.webService.updateMoneyRequestStatus(eventData.requestId, 1, "Zahlung");
            webService.waitingForRequest = false;
          }
          else {
            // incoming request from kid -- let parent decide
            $scope.showConfirm(eventData);
          }
        }
      });
    }

    // load user data
    var userCallback = function (user) {
      $scope.user = user;
      $scope.transactionsService = transactionsService;

      // get transactions from this user since we now know they exist
      var transactionsCallback = function (data) {
        transactionsService.loadTransactionsJSON(data);
        // $scope.$apply();
        var trans = transactionsService.transactions();

        Stats.setTransactions();
      };


      webService.getTransactions().success(transactionsCallback).error(transactionsCallback);

    }
    webService.getUser().success(userCallback).error(userCallback);
    //}


    $scope.showConfirm = function (eventData) {
      $scope.data = {};
      $scope.eventData = eventData;
      var requestPopup = new $ionicPopup.show({ // eventData.requestId enthält requestId
        title: "Geldanfrage von " + eventData.name,
        template: eventData.name + ' hätte gerne ' + PunktZuKomma.parse(eventData.amount) + ' €, weil: "' + eventData.reason + '"',
        buttons: [
          {
            text: 'Zustimmen',
            type: 'button-positive',
            onTap: function (e) {
              var responsePopup = new $ionicPopup.show({
                title: 'Zustimmen',
                scope: $scope,
                template: '<label for="message">Nachricht</label>' +
                '<input type="text" id="message" required="required" ng-model="data.message" ng-change="changeButton()">',
                buttons: [{
                  text: 'Zurück',
                  type: 'button-stable',
                  onTap: function () {
                    responsePopup.close();
                    $scope.showConfirm($scope.eventData);
                  }
                },
                  {
                    text: "Geld und Nachricht abschicken",
                    type: 'button-positive button-hidden button-ok',
                    onTap: function () {
                      // grant request
                      $scope.webService.updateMoneyRequestStatus(eventData.requestId, 1, $("#message").val());
                    }
                  }]
              })
            }
          },
          {
            text: 'Ablehnen',
            type: 'button-positive',
            onTap: function (e) {
              var responsePopup = new $ionicPopup.show({
                title: 'Ablehnen',
                scope: $scope,
                template: '<label for="message">Begründung</label>' +
                '<input type="text" id="message" ng-model="data.message" required="required" ng-change="changeButton()">',
                buttons: [{
                  text: 'Zurück',
                  type: 'button-stable',
                  onTap: function () {
                    responsePopup.close();
                    $scope.showConfirm($scope.eventData);
                  }
                },
                  {
                    text: "Nachricht abschicken",
                    type: 'button-positive button-hidden button-ok',
                    onTap: function () {
                      // deny request
                      $scope.webService.updateMoneyRequestStatus(eventData.requestId, 2, $("#message").val());
                    }
                  }]
              })
            }
          }
        ]
      });
    };

    $scope.changeButton = function () {
      console.log("message " + $scope.data.message);
      if ($scope.data.message) {
        $('.button-ok').removeClass('button-hidden');
      } else {
        $('.button-ok').addClass('button-hidden');
      }
    };


    // // get transactions from this user since we now know they exist
    // var transactionsCallback = function (data) {
    //   transactionsService.loadTransactionsJSON(data);
    //   // $scope.$apply();
    //   var transactions = transactionsService.transactions();
    //
    //   Stats.resetSpent();
    //   Stats.setSpent(transactions);
    //   $scope.spentTotal = Amount.getSpentTotal(Stats.all());
    //
    //
    // };
    // webService.getTransactions().success(transactionsCallback).error(transactionsCallback);
    //}
// webService.getUser().success(userCallback).error(userCallback);

  })

  .controller('DetailCtrl', function ($scope, $state, $ionicHistory, requestsService, $ionicConfig, kidsService, Kids, Amount, Stats, PunktZuKomma) {
    $scope.$on('$ionicView.beforeEnter', function () {
      $ionicConfig.backButton.text("Übersicht");
    });

    $scope.moneyRequests = requestsService.requests;
    $scope.platform = ionic.Platform;
    $scope.kidsService = kidsService;
    $scope.paired = kidsService.selectedKid.paired;

    $scope.punktZuKomma = PunktZuKomma;

    //TODO select kid and get data from backend: get available balance of the kid
    $scope.lastRequest = $scope.moneyRequests[$scope.moneyRequests.length-1];
    $scope.available = Amount.getAvailable();

    $scope.pairingDone = function (kid) {

      //TODO: check ob pairing mit kind passt - wenn ja, nachfolgende Zeile ausführen
      //Kids.setPaired(kid.id, true);

      $ionicHistory.goBack();
    }

  })

  .controller('StatCtrl', function ($document, $scope, $state, $ionicConfig, kidsService, Stats) {
    $scope.platform = ionic.Platform;
    $scope.$on('$ionicView.beforeEnter', function () {
      $ionicConfig.backButton.text(kidsService.selectedKid.name);
    });

    $scope.data = {};
    $scope.data.cat = {};
    $scope.data.nw = {};
    $scope.data.showStat = "lines";

    // initialize categories diagram
    $scope.data.cat.names = Stats.getNames();
    $scope.data.cat.colors = Stats.getColors();

    // initialize need want diagramm
    $scope.data.nw.names = ["Gebraucht", "Gewollt"];
    $scope.data.nw.colors = ["#0D7DBF", "#38D42F"];
    $scope.data.nw.legend = [{
      name: "Gebraucht",
      color: "#0D7DBF",
      icon_ios: "ion-ios-minus-empty"
    }, {name: "Gewollt", color: "#38D42F", icon_ios: "ion-ios-minus-empty"}];
    $scope.data.labels = ["1.", "", "", "", "5.", "", "", "", "", "10.", "", "", "", "", "15.", "", "", "", "", "20.", "", "", "", "", "25.", "", "", "", "", "", "31."];
    $scope.data.month = new Date();

    $scope.data.options = {
      pointDot: false,
      scaleShowHorizontalLines: true,
      pointHitDetectionRadius: 1,
      scaleFontSize: 20
    };

    $scope.data.nw.options = {
      animation: false
    };

    $scope.$watch('data.month', function (value) {
      var month, year;
      if (value != undefined) {
        month = value.getMonth();
        year = value.getFullYear();
        $scope.data.line = Stats.getMonth(month, year);
        if ($scope.data.line) {
          $scope.data.cat.spent = Stats.getSpent(month, year);
          $scope.data.cat.legend = Stats.getLegend(month, year);
          $scope.data.nw.spent = Stats.getNeedWant(month, year);
        }
      }
    });


    $scope.buttonClicked = function (index) {
      switch (index) {
        case 0:
          $scope.data.showStat = "lines";
          break;
        case 1:
          $scope.data.showStat = "categories";
          break;
        case 2:
          $scope.data.showStat = "needWant";
          break;
      };
      $scope.$apply();
    }

  })

  .controller('SendCtrl', function ($scope, $state, $ionicHistory, $cordovaToast, $ionicConfig, PunktZuKomma, webService) {
    $scope.platform = ionic.Platform;
    $scope.$on('$ionicView.beforeEnter', function () {
      $ionicConfig.backButton.text("Abbrechen");
    });

    $scope.sendTransaction = function (form) {

      var newTransaction = {};
      newTransaction.amount = form.amount.$modelValue;
      newTransaction.text = form.reason.$modelValue;

      //TODO: send Transaction to backend here; when successful, run the next lines of code, otherwise show some error
       webService.immediatelyGrantMoneyRequest(parseFloat(newTransaction.amount), newTransaction.text, 1); // Michael TODO make dynamic
      //TODO: activate Toast before release (Toast not working in web browser); tested in emulator for ios + android
      var msg = PunktZuKomma.parse(newTransaction.amount) + " € gesendet";
      //console.log(msg);
      //$cordovaToast.show(msg,'long','center');
      $ionicHistory.goBack();

    }
  })

  .controller('OrderCtrl', function ($scope, $state, $ionicHistory, $ionicConfig, $cordovaToast, PunktZuKomma, Days, Intervall, Order) {
    $scope.platform = ionic.Platform;
    $scope.order = Order;

    $scope.$on('$ionicView.beforeEnter', function () {
      $scope.intervalls = Intervall.getList();
      $ionicConfig.backButton.text("Abbrechen");
      $scope.selectedIntervall = Intervall.getDefault();

      $scope.setDays($scope.selectedIntervall);

      //Set values with either the default values or with the saved values
      if ($scope.order.getAmount() > 0) {
        $scope.amount = $scope.order.getAmount();
      }
      $scope.reason = 'Dauerauftrag Taschengeld';
      $scope.selectedDay = $scope.days[$scope.order.getDay()];
    });

    $scope.setDays = function (selectedIntervall) {
      //set dropdown either for montly or weekly
      if (selectedIntervall.id == 0) {
        $scope.days = Days.getMonthdays();
        $scope.description = "Tag im Monat";
        Intervall.setDefault(0, true);
        Intervall.setDefault(1, false);
      }
      else {
        $scope.days = Days.getWeekdays();
        $scope.description = "Wochentag";
        Intervall.setDefault(0, false);
        Intervall.setDefault(1, true);
      }
    };

    $scope.saveOrder = function (orderForm) {

      var intervall = orderForm.intervall.$modelValue.name;
      $scope.order.setAmount(orderForm.amount.$modelValue);
      $scope.order.setDay(orderForm.day.$modelValue.id - 1); //-1 weil wir mit 1 zu zählen beginnen, nicht mit 0
      //TODO: send Order to backend here; when successful, run the next lines of code, otherwise show some error

      //TODO: activate Toast before release (Toast not working in web browser); tested in emulator for ios + android
      var msg = "Dauerauftrag über " + PunktZuKomma.parse($scope.order.getAmount()) + " € " + intervall + " gespeichert";
      //console.log(msg);
      $cordovaToast.show(msg,'long','center');
      $ionicHistory.goBack();
    };
  })

  .controller('HistorieCtrl', function ($scope, $state, $ionicConfig, kidsService, Amount, PunktZuKomma, requestsService) {

    $scope.$on('$ionicView.loaded', function () {
      $scope.platform = ionic.Platform;
      $scope.filterMonth = new Date();
    });

    $scope.$on('$ionicView.beforeEnter', function () {
      $ionicConfig.backButton.text(kidsService.selectedKid.name);
      $scope.punktZuKomma = PunktZuKomma;
      $scope.changeMonth($scope.filterMonth);
    });

    $scope.$on('$ionicView.enter', function () {});

    $scope.changeMonth = function (filterMonth) {
      $scope.filterMonth = filterMonth;

      $scope.noItems = false;
      var selectedMonth = filterMonth.getMonth();
      var selectedYear = filterMonth.getYear();

      var requests = requestsService.requests;
      console.log(requests);
      $scope.moneyRequests = [];

      //loop through requests and filter for date
      for (var i = 0; i < requests.length; i++) {
        var date = new Date(requests[i].date);
        if (date.getMonth() == selectedMonth && date.getYear() == selectedYear) {
          if(requests[i].child_id == 1 && requests[i].status == 1) {
            $scope.moneyRequests.push(requests[i]);
          }
        }
      }
      if ($scope.moneyRequests.length == 0) {
        $scope.noItems = true;
      }
    };


  });
