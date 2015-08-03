var socialputts = angular.module('socialputts', ['socialputts.controllers', 'socialputts.services', 'ui.router', 'ui.bootstrap']);

socialputts
.config(function ($compileProvider) {
    $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
})
.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/index', { templateUrl: 'partials/main.html', controller: 'HomeCtrl' })
        .when('/signin', { templateUrl: 'partials/signIn.html', controller: 'AccountCtrl' })
        .when('/buddies', { templateUrl: 'partials/Buddies.html', controller: 'BuddiesCtrl' })
        .when('/chat', { templateUrl: 'partials/Chat.html', controller: 'ChatCtrl' })
        .when('/inviteYourBuddies', { templateUrl: 'partials/InviteYourBuddies.html', controller: 'InviteYourBuddiesCtrl' })
        .when('/courseFinder', { templateUrl: 'partials/CourseFinder.html', controller: 'CourseFinderCtrl' })
        .when('/fillYourFoursome', { templateUrl: 'partials/FillYourFoursome.html', controller: 'FillYourFoursomeCtrl' })
        .when('/manageInvitations', { templateUrl: 'partials/ManageInvitations.html', controller: 'ManageInvitationsCtrl' })
        .when('/invitationDetails', { templateUrl: 'partials/InvitationDetails.html', controller: 'InvitationDetailsCtrl' })
        .when('/favoriteCourses', { templateUrl: 'partials/FavoriteCourses.html', controller: 'FavoriteCoursesCtrl' })
        .when('/settings', { templateUrl: 'partials/Settings.html', controller: 'SettingsCtrl' })
        .when('/oneClickDiscount', { templateUrl: 'partials/OneClickDiscount.html', controller: 'OneClickDiscountCtrl' })
        .when('/courseFinder', { templateUrl: 'partials/CourseFinder.html', controller: 'CourseFinderCtrl' })
        .when('/courseResult', { templateUrl: 'partials/CourseResult.html', controller: 'CourseResultCtrl' })
        .when('/fillYourFoursome', { templateUrl: 'partials/FillYourFoursome.html', controller: 'FillYourFoursomeCtrl' })
        .when('/manageInvitations', { templateUrl: 'partials/ManageInvitations.html', controller: 'ManageInvitationsCtrl' })
        .when('/aproveaccess', { templateUrl: 'partials/AproveAccess.html', controller: 'ApproveCtrl' })
        .when('/postfacebook', { templateUrl: 'partials/Postfacebook.html', controller: 'FbPostCtrl' })
        .when('/allowlocation', { templateUrl: 'partials/AllowLocation.html', controller: 'AllowLocationCtrl' })
        .when('/pushnotification', { templateUrl: 'partials/PushNotification.html', controller: 'PushNotificationCtrl' })
        .when('/recommendcourses', { templateUrl: 'partials/RecommendCourses.html', controller: 'RecommendCoursesCtrl' })
        .when('/recommendgroup', { templateUrl: 'partials/RecommendGroup.html', controller: 'GroupCoursesCtrl' })
        .when('/recommendbuddy', { templateUrl: 'partials/RecommendBuddy.html', controller: 'BuddyCoursesCtrl' })
       .otherwise({ redirectTo: '/signin' });
} ]);


