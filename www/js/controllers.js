angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $state, $ionicPopup, $ionicSlideBoxDelegate, Amount, Stats) {
  $scope.available = Amount.getAvailable();
  $scope.spent = Amount.getSpent();
  // $scope.go = function(state) {
  //   $state.go(state);
  // };

  $scope.go = function() {
    $ionicSlideBoxDelegate.next();
    $state.go('tab.stats');
  };

  $scope.showPlead = function() {
    var myPlead = $ionicPopup.show({
      template: '<label for="amount">Betrag</label>'+
                '<input type="text" id="amount">'+
                '<label for="message">Nachricht</label>'+
                '<input type="text" id="message">',
      title: 'Geld anfordern',
      scope: $scope,
      buttons: [
        { text: 'Abbrechen' },
        {
          text: '<b>OK</b>',
          type: 'button-positive',
          onTap: function(e) {
          }
        }
      ]
    });
  };

  $scope.stats = Stats.all();
  // Triggered on a button click, or some other target
  $scope.showPay = function() {
    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      template: '<ion-list>'+
                '<ion-item ng-repeat="stat in stats">'+
                '{{stat.name}}'+
                '</ion-item>'+
                '</ion-list>',
      title: 'Bezahlung vorbereiten',
      subTitle: 'Eine Kategorie wählen:',
      scope: $scope,
      buttons: [
        { text: 'Abbrechen' },
        {
          text: '<b>OK</b>',
          type: 'button-positive',
          onTap: function(e) {
          }
        }
      ]
    });
  };
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
