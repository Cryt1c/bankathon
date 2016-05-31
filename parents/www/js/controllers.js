angular.module('starter.controllers', ['ngCordova', 'chart.js'])

  .service('kidsService', function () {
    this.selectedKid;
  })

  .controller('StartCtrl', function ($scope, $state, $ionicModal, $ionicSlideBoxDelegate, Kids, kidsService, $ionicModal) {
    $scope.platform = ionic.Platform;

    $scope.kids = Kids.getAll();


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
      $scope.kids.splice($scope.kids.indexOf(kid), 1);
      //console.log(Kids.getNum($scope.kids));
      //TODO send info to backend
      NumberUpdate();
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
    };

    $scope.openSelectModal = function () {
      $scope.selectModalSlider.slide(0);
      $scope.selectModal.show();
    };

    $scope.addKid = function (addForm) {
      var newItem = {};
      newItem.name = addForm.name.$modelValue;

      // Save new list in scope and factory
      $scope.kids.push(newItem);

      //TODO send to backend

      NumberUpdate();
      $ionicSlideBoxDelegate.$getByHandle('modalSlider').next();
    };

  })


  .controller('DetailCtrl', function ($scope, $state, kidsService, Amount, Stats, PunktZuKomma) {
    $scope.platform = ionic.Platform;
    $scope.kidsService = kidsService;

    $scope.punktZuKomma = PunktZuKomma;

    $scope.available = Amount.getAvailable();

    //TODO select kid and get data from backend - available + last transaction to the kid

  })


  .controller('StatCtrl', function ($scope, $state, Stats, Months) {
    $scope.platform = ionic.Platform;

    $scope.data = {};
    $scope.data.showNeed = false;
    $scope.data.toggleLabel = 'Kategorien';
    $scope.data.months = Months.getAll();
    $scope.data.spent = Stats.getSpent();
    $scope.data.names = Stats.getNames();


    // Line Chart

    $scope.data.labels = ["1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.", "9.", "10.", "11.", "12.", "13.", "14.", "15.", "16.", "17.", "18.", "19.", "20.", "21.", "22.", "23.", "24.", "25.", "26.", "27.", "28.", "29.", "30.", "31."];
    //$scope.data.line = Stats.getMonth(4, 2016);
    //$scope.data.line = [[10, 20, 30, 40, 50, 60, 70, 80]];
    // $scope.onClick = function (points, evt) {
    //   console.log(points, evt);
    // };

    $scope.$watch('data.month', function (value) {
      if (value != undefined) {
        var month = Stats.getMonth(value.getMonth(), value.getFullYear());
        $scope.data.line = month;
        console.log(value.getMonth() + " " + value.getFullYear());
      }
    });

    //Doughnut Chart

    $scope.$watch('data.showNeed', function (value) {
      if (value) {
        //render need chart
        $scope.data.toggleLabel = 'Gewollt/Gebraucht';
        $scope.data.spent = Stats.getNeedWant();
        $scope.data.names = ["Gebraucht", "Gewollt"];
      }
      else {
        //render categories in chart
        $scope.data.toggleLabel = 'Kategorien';
        $scope.data.spent = Stats.getSpent();
        $scope.data.names = Stats.getNames();
      }
    });
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
      $scope.data = {};
      $scope.list = Intervall.getList();
      $scope.data.intervall = Intervall.getDefault();

      //set dropdown either for montly or weekly
      if ($scope.data.intervall.id == 1) {
        $scope.data.days = Days.getMonthdays();
        $scope.data.description = "Tag im Monat";
      }
      else {
        $scope.data.days = Days.getWeekdays();
        $scope.data.description = "Wochentag";
      }

      //Set values with either the default values or with the saved values
      if ($scope.order.getAmount() > 0) {
        $scope.amount = $scope.order.getAmount();
      }
      $scope.reason = $scope.order.getText();
      $scope.selectedDay = $scope.data.days[$scope.order.getDay()];
      $scope.timeValue = $scope.order.getTime();
    });

    $scope.saveOrder = function (orderForm) {

      var intervall = $scope.data.intervall.name;
      $scope.order.setAmount(orderForm.amount.$modelValue);
      $scope.order.setText(orderForm.reason.$modelValue);
      $scope.order.setDay(orderForm.day.$modelValue.id - 1); //-1 weil wir mit 1 zu zählen beginnen, nicht mit 0
      $scope.order.setTime(orderForm.timeValue.$modelValue);

      //TODO: send Order to backend here; when successful, run the next lines of code, otherwise show some error

      //TODO: activate Toast before release (Toast not working in web browser); tested in emulator for ios + android
      var msg = "Dauerauftrag über " + PunktZuKomma.parse($scope.order.getAmount()) + " € " + intervall + " gespeichert";
      console.log(msg);
      //$cordovaToast.show(msg,'long','center');
      $ionicHistory.goBack();
    };
  })

  .controller('IntervallCtrl', function ($scope, $state, $ionicHistory, Intervall) {
    $scope.platform = ionic.Platform;

    $scope.list = Intervall.getList();

    $scope.makeDefault = function (item) {
      removeDefault();
      var newDefaultIndex = $scope.list.indexOf(item);
      $scope.list[newDefaultIndex].useAsDefault = true;
      Intervall.setList($scope.list);

      //TODO send intervall to backend
      $ionicHistory.goBack();
    }

    function removeDefault() {
      //Remove existing default
      for (var i = 0; i < $scope.list.length; i++) {
        if ($scope.list[i].useAsDefault == true) {
          $scope.list[i].useAsDefault = false;
        }
      }
    }
  })

  .controller('HistorieCtrl', function ($scope, $state) {
    $scope.platform = ionic.Platform;

  });
