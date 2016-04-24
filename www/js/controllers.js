angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $state, $ionicPopup, $ionicHistory, $ionicSlideBoxDelegate, Amount, Stats) {
  $scope.stats = Stats.all();
  $scope.available = Amount.getAvailable();
  $scope.spentTotal = Amount.getSpentTotal($scope.stats);
  angular.element(document).ready(function() {
  	$("#available-moneystack").moneystack();
  });
  $scope.go = function() {
    $ionicSlideBoxDelegate.next();
    $state.go('tab.stats');
  };

  $scope.showRequest = function() {
    $scope.data = {};
    $scope.data.amount = 10;
    var myRequest = $ionicPopup.show({
      template: '<label for="amount">Betrag {{data.amount}}€</label>'+
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
                  $scope.available = Amount.getAvailable();
                }
                else {
                  answer = false;
                  reason = "Du hast diesen Monat schon genug für " + $scope.data.message + " ausgegeben.";
                }
                var alertPopup = $ionicPopup.alert({
                  title: (answer ? "Du darfst dir " + $scope.data.message + " kaufen." : reason),
                  template: (answer ? "+" + $scope.data.amount + "€" : "")
                });
              }, 3000);
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
                '<ion-item ng-repeat="stat in stats" ng-click="showPayOk(stat)">'+
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
      template: 'Du kannst jetzt ' +
                stat.name +
                ' an der Kassa bezahlen'
    });
    setTimeout(function(){ $scope.showPayResult(stat); }, 3000);
  };
  $scope.showPayResult = function(stat) {
    var payment = 2.50;
    var alertPopup = $ionicPopup.alert({
      title: 'Bezahlt',
      template: 'Du hast ' +
                payment +
                '€ für ' +
                stat.name +
                ' ausgegeben.'
    });
    Amount.spend(payment);
    $scope.available = Amount.getAvailable();
    Stats.spend(stat.id, payment);
    $scope.spentTotal = Amount.getSpentTotal($scope.stats);

  }
})



.controller('StatsCtrl', function($scope, $state, $ionicSlideBoxDelegate,Amount, Stats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  $scope.Math = window.Math;
  $scope.stats = Stats.all();
  $scope.spentTotal = Amount.getSpentTotal($scope.stats);
  $scope.stats = Stats.getHeights($scope.spentTotal);


  $scope.remove = function(stats) {
    Stats.remove(stats);
  };

  $scope.dash = function() {
    $ionicSlideBoxDelegate.previous();
    $state.go('tab.dash');
  };
});
