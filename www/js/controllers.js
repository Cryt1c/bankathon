angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $state, $ionicPopup, $ionicHistory, $ionicSlideBoxDelegate, Amount, Stats) {
  $scope.stats = Stats.all();
  $scope.available = Amount.getAvailable();
  $scope.spentTotal = Amount.getSpentTotal($scope.stats);
  // $scope.go = function(state) {
  //   $state.go(state);
  // };

  $scope.go = function() {
    $ionicSlideBoxDelegate.next();
    $state.go('tab.stats');
  };

  $scope.showRequest = function() {
    $scope.requestAmount = 10;
    var myRequest = $ionicPopup.show({
      template: '<label for="amount">Betrag {{requestAmount}}€</label>'+
                '<input type="range" id="amount" min="0" max="20" ng-model="requestAmount">'+
                '<label for="message">Grund</label>'+
                '<input type="text" id="message">',
      title: 'Geld anfordern',
      scope: $scope,
      buttons: [
        { text: 'Abbrechen' },
        {
          text: '<b>OK</b>',
          type: 'button-positive',
          onTap: function(e) {

            console.log("test");
            $scope.requestAmount = requestAmount;
            var answer;
            var reason;
            if($scope.requestAmount <= 10) {
              answer = true;
              reason = "";
            }
            else {
              answer = false;
              reason = "Du hast diesen Monat schon genug für Spielsachen ausgegeben";
            }
            var alertPopup = $ionicPopup.alert({
              title: (answer ? "Deine Eltern haben zugestimmt" : reason),
              template: (answer ? "+" + $scope.requestAmount: "")
            });
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
    console.log(stat);
    var alertPopup = $ionicPopup.alert({
      title: 'Zahlung bereit',
      template: 'Du kannst jetzt ' +
                stat.name +
                ' an der Kassa bezahlen'
    });
    console.log("start interval");
    setTimeout(function(){ $scope.showPayResult(stat); }, 2000);
    console.log("end interval");
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
    console.log(stat);
    $scope.available = Amount.getAvailable();
    Stats.spend(stat.id, payment);
    $scope.spentTotal = Amount.getSpentTotal($scope.stats);

  }
})


.controller('StatsCtrl', function($scope, $state, $ionicSlideBoxDelegate, Stats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.stats = Stats.all();
  $scope.remove = function(stats) {
    Stats.remove(stats);
  };

  $scope.dash = function() {
    $ionicSlideBoxDelegate.previous();
    $state.go('tab.dash');
  };
});
