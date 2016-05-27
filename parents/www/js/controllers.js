angular.module('starter.controllers', ['chart.js'])

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


    $scope.sendTransactions = function (form) {

    }

  })


  .controller('StatCtrl', function ($scope, $state, Categories, Months) {
    $scope.platform = ionic.Platform;

    $scope.data = {};
    $scope.data.showNeed = false;
    $scope.data.toggleLabel = 'Kategorien';
    $scope.data.months = Months.getAll();
    $scope.categories = Categories.all();

    $scope.$watch('data.showNeed',function(value) {
      if(value) {
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


  .controller('SendCtrl', function ($scope, $state) {
    $scope.platform = ionic.Platform;

  })

  .controller('OrderCtrl', function ($scope, $state) {
    $scope.platform = ionic.Platform;

  })

  .controller('IntervallCtrl', function ($scope, $state) {
    $scope.platform = ionic.Platform;

  })

  .controller('HistorieCtrl', function ($scope, $state) {
    $scope.platform = ionic.Platform;

  });
