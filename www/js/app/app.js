var socialputts = angular.module('socialputts', ['socialputts.controllers', 'socialputts.services', 'ui.router']);

socialputts
.config(function ($compileProvider){
    $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
})
.config(['$routeProvider', function($routeProvider){
	$routeProvider
		.when('/index', {templateUrl: 'partials/main.html', controller: 'MainCtrl'})
		.when('/signin', {templateUrl: 'partials/signIn.html', controller: 'MainCtrl'})
		.when('/buddies', {templateUrl: 'partials/Buddies.html', controller: 'MainCtrl'})
		.when('/inviteYourBuddies', {templateUrl: 'partials/InviteYourBuddies.html', controller: 'MainCtrl'})
		.when('/courseFinder', {templateUrl: 'partials/CourseFinder.html', controller: 'MainCtrl'})
		.when('/fillYourFoursome', {templateUrl: 'partials/FillYourFoursome.html', controller: 'MainCtrl'})
		.when('/manageInvitations', {templateUrl: 'partials/ManageInvitations.html', controller: 'MainCtrl'})
		.when('/favoriteCourses', {templateUrl: 'partials/FavoriteCourses.html', controller: 'MainCtrl'})
		.when('/settings', {templateUrl: 'partials/Settings.html', controller: 'MainCtrl'})
		.when('/oneClickDiscount', {templateUrl: 'partials/OneClickDiscount.html', controller: 'OneClickDiscountCtrl'})
		.when('/courseFinder', {templateUrl: 'partials/CourseFinder.html', controller: 'CourseFinderCtrl'})
		.when('/fillYourFoursome', {templateUrl: 'partials/FillYourFoursome.html', controller: 'FillYourFoursomeCtrl'})
		.when('/manageInvitations', {templateUrl: 'partials/ManageInvitations.html', controller: 'ManageInvitationsCtrl'})
		.otherwise({ redirectTo: '/signin'})
}]);
