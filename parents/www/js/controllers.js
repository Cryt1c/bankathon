angular.module('starter.controllers', ['ngCordova', 'chart.js', 'ti-segmented-control'])
  .service('webService', function ($http, Amount) {
    var runningOnMobile = ionic.Platform.isIOS() || ionic.Platform.isAndroid();
    var url = (runningOnMobile ? "http://pommo-backend.herokuapp.com/" : "/api/");
     var userId = 1;
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
    this.initWebSockets = function (incomingEventHandler) {
      var host = "ws://pommo-backend.herokuapp.com/";//"ws://localhost:5000"; // url.replace(/^http/, 'ws');
      var ws = new WebSocket(host);
      ws.onmessage = function (msgEvent) {
        var msgData = JSON.parse(msgEvent.data);
        if (msgData.event == "NEW_MONEY_REQUEST")
          incomingEventHandler(msgData);
      };
      ws.onclose = function () {
        // websocket about to close -- reopen after time
        setTimeout(this.initWebSockets, 1000);
      };
    };
    this.getMoneyRequests = function() {
      //returns money requests for this parent
      return $http.get(url + "getRequestsForParent?parentId=" + userId);
    };
    this.updateMoneyRequestStatus = function(requestId, newStatus, newResponse) {
      $http.post(url + "updateRequestStatus",
        {
          "requestId": requestId,
          "response": "Test",
          "newStatus": newStatus
        });
    };
  })

  .service('kidsService', function () {
    this.selectedKid;
  })

  .controller('StartCtrl', function ($scope, $state, $ionicModal, $ionicPopup, $ionicSlideBoxDelegate, Kids, kidsService, webService) {
    $scope.platform = ionic.Platform;

    $scope.kids = Kids.getAll();
    $scope.webService = webService;

    // load requests
    $scope.webService.getMoneyRequests().then(function(data) {
      $scope.moneyRequests = data;

      // check if there are any pending money requests
      // if so, alert the user to the most recent one
      var filteredData = $filter('orderBy')(data, "timestamp");
      filteredData = $filter('filter')({"status": 0}); // filter to only elements with pending status
      $scope.pendingRequests = data;

    });

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
    webService.initWebSockets(function (eventData) {
      if (eventData.event == "NEW_MONEY_REQUEST") {
        $scope.showConfirm(eventData);
      }
    });

    $scope.showConfirm = function (eventData) {
      var requestPopup = new $ionicPopup.show({ // eventData.requestId enthält requestId
        title: " - Geldanfrage von " + eventData.name,
        template: eventData.name + ' hätte gerne ' + eventData.amount + ' €, weil: "' + eventData.reason + '"',
        buttons: [
          {
            text: 'Zustimmen',
            type: 'button-positive',
            onTap: function (e) {
              var responsePopup = new $ionicPopup.show({
                title: 'Zustimmen',
                template: '<label for="message">Nachricht</label>' +
                '<input type="text" id="message">',
                buttons: [{
                  text: "Geld und Nachricht abschicken",
                  type: 'button-positive',
                  onTap: function() {
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
                template: '<label for="message">Begründung</label>' +
                '<input type="text" id="message">',
                buttons: [{
                  text: "Nachricht abschicken",
                  type: 'button-positive',
                  onTap: function() {
                    // deny request
                    $scope.webService.updateMoneyRequestStatus(eventData.requestId, 2, $("#message").val());
                  }
                }]
              })
            }
          }
        ]
      });
    }

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


  .controller('DetailCtrl', function ($scope, $state, $ionicHistory, kidsService, Kids, Amount, Stats, PunktZuKomma) {
    $scope.platform = ionic.Platform;
    $scope.kidsService = kidsService;
    $scope.paired = kidsService.selectedKid.paired;

    $scope.punktZuKomma = PunktZuKomma;

    $scope.available = Amount.getAvailable();

    //TODO select kid and get data from backend - available + last transaction to the kid

    $scope.pairingDone = function (kid) {

      //TODO: check ob pairing mit kind passt - wenn ja, nachfolgende Zeile ausführen
      //Kids.setPaired(kid.id, true);

      $ionicHistory.goBack();
    }

  })


  .controller('StatCtrl', function ($document, $scope, $state, Stats, Months, ChartJsFactory) {
    $scope.platform = ionic.Platform;

    $scope.data = {};
    $scope.data.showStat = "lines";
    $scope.data.showNeed = false;
    $scope.data.toggleLabel = 'Kategorien';
    $scope.data.months = Months.getAll();
    $scope.data.spent = Stats.getSpent();
    $scope.data.names = Stats.getNames();
    $scope.data.legend = Stats.getLegend();
    $scope.data.labels = ["1.", "", "", "", "5.", "", "", "", "", "10.", "", "", "", "", "15.", "", "", "", "", "20.", "", "", "", "", "25.", "", "", "", "", "", "31."];
    $scope.data.month = new Date();

    $scope.data.options = {pointDot: false, scaleShowHorizontalLines: true, pointHitDetectionRadius: 1, scaleFontSize: 20};

    $scope.$watch('data.month', function (value) {
      if (value != undefined) {
        var month = Stats.getMonth(value.getMonth(), value.getFullYear());
        $scope.data.line = month;
      }
    });
    $scope.buttonClicked = function (index) {
      switch (index) {
        case 0:
          $scope.data.showStat = "lines";
          break;
        case 1:
          $scope.data.toggleLabel = 'Kategorien';
          $scope.data.spent = Stats.getSpent();
          $scope.data.names = Stats.getNames();
          $scope.data.colors = Stats.getColors();
          $scope.data.showStat = "doughnut";
          $scope.data.legend = Stats.getLegend();
          break;
        case 2:
          $scope.data.toggleLabel = 'Gewollt/Gebraucht';
          $scope.data.spent = Stats.getNeedWant();
          $scope.data.names = ["Gebraucht", "Gewollt"];
          $scope.data.colors = ["#0D7DBF", "#38D42F"];
          $scope.data.showStat = "doughnut";
          $scope.data.legend = [{
            name: "Gebraucht",
            color: "#0D7DBF",
            icon_ios: "ion-ios-minus-empty"
          }, {name: "Gewollt", color: "#38D42F", icon_ios: "ion-ios-minus-empty"}];

          break;
      }
      ;
      $scope.$apply();
    }

  })

  .controller('SendCtrl', function ($scope, $state, $ionicHistory, $cordovaToast, PunktZuKomma) {
    $scope.platform = ionic.Platform;

    $scope.sendTransaction = function (form) {

      var newTransaction = {};
      newTransaction.amount = form.amount.$modelValue;
      newTransaction.text = form.reason.$modelValue;

      //TODO: send Transaction to backend here; when successful, run the next lines of code, otherwise show some error

      //TODO: activate Toast before release (Toast not working in web browser); tested in emulator for ios + android
      var msg = PunktZuKomma.parse(newTransaction.amount) + " € gesendet";
      console.log(msg);
      //$cordovaToast.show(msg,'long','center');
      $ionicHistory.goBack();

    }
  })


  .controller('OrderCtrl', function ($scope, $state, $ionicHistory, $cordovaToast, PunktZuKomma, Days, Intervall, Order) {
    $scope.platform = ionic.Platform;
    $scope.order = Order;

    $scope.$on('$ionicView.beforeEnter', function () {
      $scope.intervalls = Intervall.getList();
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
      console.log(msg);
      //$cordovaToast.show(msg,'long','center');
      $ionicHistory.goBack();
    };
  })

  .controller('HistorieCtrl', function ($scope, $state, Amount, Months, PunktZuKomma) {
    $scope.platform = ionic.Platform;

    $scope.available = Amount.getAvailable();
    $scope.punktZuKomma = PunktZuKomma;
    $scope.months = Months.getAll();

  });
