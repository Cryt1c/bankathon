angular.module('starter.controllers', [])

.service('webService', function ($http, transactionsService) {
  /*

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
  */
})


.controller('StartCtrl', function ($scope, $state) {
  $scope.platform = ionic.Platform;

})

.controller('DetailCtrl', function ($scope, $state) {
  $scope.platform = ionic.Platform;

})


.controller('StatCtrl', function ($scope, $state) {
  $scope.platform = ionic.Platform;

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
