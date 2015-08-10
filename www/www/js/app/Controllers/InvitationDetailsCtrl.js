angular
  .module('socialputts')
  .controller('InvitationDetailsCtrl', function ($scope, $http, $location, $route) {
      checkUserLogedOff($location, $scope);

      $http.jsonp(socialputtsLink + "/api/FoursomeInvitation/InvitationDetails?userId=" + $.jStorage.get('user').userId + "&invitationId=" + $route.current.params.invitationId + "&alt=json-in-script&callback=JSON_CALLBACK")
    .success(function (data) {
        $scope.invitation = data;
    });
  })