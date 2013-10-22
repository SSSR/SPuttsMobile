var socialputts = socialputts || angular.module('socialputts', ['socialputts.controllers', 'socialputts.services', 'ui.router']);

socialputts.config(['$routeProvider', function($routeProvider){
	$routeProvider
		.when('/index', {templateUrl: 'partials/main.html', controller: 'MainCtrl'})
		.when('/signin', {templateUrl: 'partials/signIn.html', controller: 'MainCtrl'})
		.otherwise({ redirectTo: '/index'})
}]);
