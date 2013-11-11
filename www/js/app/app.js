var socialputts = angular.module('socialputts', ['socialputts.controllers', 'socialputts.services', 'ui.router']);

socialputts
.config(function ($compileProvider){
    $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
})
.config(['$routeProvider', function($routeProvider){
	$routeProvider
		.when('/index', {templateUrl: 'partials/main.html', controller: 'HomeCtrl'})
		.when('/signin', {templateUrl: 'partials/signIn.html', controller: 'AccountCtrl'})
		.when('/buddies', {templateUrl: 'partials/Buddies.html', controller: 'BuddiesCtrl'})
		.when('/inviteYourBuddies', {templateUrl: 'partials/InviteYourBuddies.html', controller: 'InviteYourBuddiesCtrl'})
		.when('/courseFinder', {templateUrl: 'partials/CourseFinder.html', controller: 'CourseFinderCtrl'})
		.when('/fillYourFoursome', {templateUrl: 'partials/FillYourFoursome.html', controller: 'FillYourFoursomeCtrl'})
		.when('/manageInvitations', {templateUrl: 'partials/ManageInvitations.html', controller: 'ManageInvitationsCtrl'})
		.when('/favoriteCourses', {templateUrl: 'partials/FavoriteCourses.html', controller: 'FavoriteCoursesCtrl'})
		.when('/settings', {templateUrl: 'partials/Settings.html', controller: 'SettingsCtrl'})
		.when('/oneClickDiscount', {templateUrl: 'partials/OneClickDiscount.html', controller: 'OneClickDiscountCtrl'})
		.when('/courseFinder', {templateUrl: 'partials/CourseFinder.html', controller: 'CourseFinderCtrl'})
		.when('/courseResult', {templateUrl: 'partials/CourseResult.html', controller: 'CourseResultCtrl'})
		.when('/fillYourFoursome', {templateUrl: 'partials/FillYourFoursome.html', controller: 'FillYourFoursomeCtrl'})
		.when('/manageInvitations', {templateUrl: 'partials/ManageInvitations.html', controller: 'ManageInvitationsCtrl'})
		.otherwise({ redirectTo: '/signin'})
}]);
