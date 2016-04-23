angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $state, Amount) {
  $scope.available = Amount.getAvailable();
  $scope.spent = Amount.getSpent();
  $scope.stats = function() {
    $state.go('tab.stats');
  };
})

.controller('StatsCtrl', function($scope, $state, Stats) {
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
    $state.go('tab.dash');
  };
});
