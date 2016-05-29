angular.module('starter.controllers', ['ngCordova'])

  .service('kidsService', function () {
    this.selectedKid;
  })

  .controller('StartCtrl', function ($scope, $state, Kids, kidsService, $ionicModal) {
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
      console.log(Kids.getNum($scope.kids));
      NumberUpdate();
    };

    $scope.reorderKid = function (kid, fromIndex, toIndex) {
      $scope.kids.splice(fromIndex, 1);
      $scope.kids.splice(toIndex, 0, kid);
    };

    // Load the add dialog from the given template URL
    $ionicModal.fromTemplateUrl('templates/dialog-addKid.html', function (modal) {
      $scope.addDialog = modal;
    }, {
      scope: $scope,
      animation: 'slide-in-up'
    });

    $scope.showAddChangeDialog = function () {
      $scope.addDialog.show();
    };

    $scope.leaveAddChangeDialog = function () {
      // Remove dialog
      $scope.addDialog.remove();
      // Reload modal template to have cleared form
      $ionicModal.fromTemplateUrl('templates/dialog-addKid.html', function (modal) {
        $scope.addDialog = modal;
      }, {
        scope: $scope,
        animation: 'slide-in-up'
      });
    };

    $scope.addKid = function (form) {
      var newItem = {};
      // Add values from form to object
      newItem.name = form.name.$modelValue;

      // Save new list in scope and factory
      $scope.kids.push(newItem);
      // Close dialog
      $scope.leaveAddChangeDialog();
    };

  })


  .controller('DetailCtrl', function ($scope, $state, kidsService, Amount, Categories) {
    $scope.platform = ionic.Platform;
    $scope.kidsService = kidsService;
  })


  .controller('StatCtrl', function ($scope, $state, Categories, Months) {
    $scope.platform = ionic.Platform;

    $scope.data = {};
    $scope.data.showNeed = false;
    $scope.data.toggleLabel = 'Kategorien';
    $scope.data.months = Months.getAll();
    $scope.categories = Categories.all();

    $scope.$watch('data.showNeed', function (value) {
      if (value) {
        //render need chart
        $scope.data.toggleLabel = 'Gewollt/Gebraucht';
        $scope.data.chartLabels = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];
        $scope.data.chartData = [300, 500, 100];
      }
      else {
        //render categories in chart
        $scope.data.toggleLabel = 'Kategorien';
        $scope.data.chartLabels = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];
        $scope.data.chartData = [300, 500, 100];
      }
    })
  })

  .controller('SendCtrl', function ($scope, $state, $ionicHistory, $cordovaToast, PunktZuKomma) {
    $scope.platform = ionic.Platform;

    $scope.sendTransaction = function(form) {

      var newTransaction = {};
      newTransaction.amount = form.amount.$modelValue;
      newTransaction.text = form.reason.$modelValue;
      console.log(newTransaction.amount);


      //TODO: send Transaction to backend here; when successful, run the next lines of code, otherwise show some error

      //TODO: activate Toast before release (Toast not working in web browser); tested in emulator for ios + android
      var msg = PunktZuKomma.parse(newTransaction.amount) + " € gesendet";
      console.log(msg);
      //$cordovaToast.show(msg,'long','center');
      $ionicHistory.goBack();

    }
  })


  .controller('OrderCtrl', function ($scope, $state, Days, $ionicHistory, $cordovaToast, PunktZuKomma, Intervall) {
    $scope.platform = ionic.Platform;



    $scope.saveOrder = function(orderForm) {

      var newOrder = {};
      newOrder.amount = orderForm.amount.$modelValue;
      newOrder.text = orderForm.reason.$modelValue;
      newOrder.intervall = $scope.data.intervall.name;
      //newOrder.day = orderForm.selectedDay.$modelValue;
      console.log(newOrder.amount + " " + newOrder.text + " " + newOrder.intervall);


      //TODO: send Transaction to backend here; when successful, run the next lines of code, otherwise show some error

      //TODO: activate Toast before release (Toast not working in web browser); tested in emulator for ios + android
      var msg = "Dauerauftrag über " + PunktZuKomma.parse(newOrder.amount) + " € + " + newOrder.intervall +" gespeichert";
      console.log(msg);
      //$cordovaToast.show(msg,'long','center');
      $ionicHistory.goBack();
    }

    $scope.$on('$ionicView.beforeEnter', function () {
      $scope.data = {};
      $scope.list = Intervall.getList();

      $scope.data.intervall = Intervall.getDefault();

      if($scope.data.intervall.id == 1) {
        $scope.data.days = Days.getMonthdays();
        $scope.data.description = "Tag im Monat";
      }
      else {
        $scope.data.days = Days.getWeekdays();
        $scope.data.description = "Wochentag";
      }


    })

  })

  .controller('IntervallCtrl', function ($scope, $state, $ionicHistory, Intervall) {
    $scope.platform = ionic.Platform;

    $scope.list = Intervall.getList();

    $scope.makeDefault = function(item) {
      removeDefault();
      var newDefaultIndex = $scope.list.indexOf(item);
      $scope.list[newDefaultIndex].useAsDefault = true;
      Intervall.setList($scope.list);
      $ionicHistory.goBack();
    }

    function removeDefault() {
      //Remove existing default
      for(var i = 0; i < $scope.list.length; i++) {
        if($scope.list[i].useAsDefault == true) {
          $scope.list[i].useAsDefault = false;
        }
      }
    }
  })

  .controller('HistorieCtrl', function ($scope, $state) {
    $scope.platform = ionic.Platform;

  });
