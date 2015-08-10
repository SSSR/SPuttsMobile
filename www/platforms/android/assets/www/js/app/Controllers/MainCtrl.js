angular.module('socialputts.controllers', [])
    .controller('MainCtrl', function($scope, $http, $location) {
        if ($.jStorage.get('user') != null) {
            $scope.Hello = $.jStorage.get('user').name;
        } else {
            $scope.Hello = "";
        }

        $scope.logout = function(event) {
            event.preventDefault();
            $.connection.messageHub.server.logout();
            $location.path("#");
        };

    });

function checkUserLogedOff($location, $scope) {
    if ($.jStorage.get('user') == null) {
        alert("user is null");
        $location.path('/signin');
        return false;
    } else {
       // alert(JSON.stringify($.jStorage.get('user')));
        $scope.Hello = $.jStorage.get("user").name;
        startConnection();
        $scope.SP = socialputtsLink;
        return true;
    }
}

function startConnection() {
    jQuery.support.cors = true;
    $.connection.hub.url = socialputtsLink + "/signalr/hubs";
    $.connection.hub.qs = { "userId": $.jStorage.get("user").userId };
    $.connection.hub.stop();
    $.connection.hub.start();
}