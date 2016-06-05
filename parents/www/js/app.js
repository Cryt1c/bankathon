angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova'])

  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.hide();
      }

      $cordovaPlugin.toast().then(sucess, error);
    });
  })

  .config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $ionicConfigProvider.views.transition('ios');
    $stateProvider

      .state('list', {
        url: '/',
        templateUrl: 'templates/start.html',
        controller: 'StartCtrl'
      })

      .state('detail', {
        url: '/detail',
        templateUrl: 'templates/detail.html',
        controller: 'DetailCtrl'
      })


      .state('stat', {
        url: '/stat',
        templateUrl: 'templates/stat.html',
        controller: 'StatCtrl'
      })
      
      .state('send', {
        url: '/send',
        templateUrl: 'templates/send.html',
        controller: 'SendCtrl'
      })

      .state('order', {
        url: '/order',
        templateUrl: 'templates/order.html',
        controller: 'OrderCtrl'
      })

      .state('historie', {
        url: '/historie',
        templateUrl: 'templates/historie.html',
        controller: 'HistorieCtrl'
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/stat');

    $ionicConfigProvider.backButton.previousTitleText(true);
    $ionicConfigProvider.navBar.alignTitle('center');
  });
