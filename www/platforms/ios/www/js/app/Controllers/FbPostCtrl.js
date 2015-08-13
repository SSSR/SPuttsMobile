angular
  .module('socialputts')
    .controller('FbPostCtrl', function ($scope, $http, $location) {
        var facebookWallPost = function () {
        
  
            var url = "/me/feed?method=post&message=" + encodeURIComponent('SocialPutts message') + 
                "&picture=http://socialputts.com/Content/images/logo.png" +
                "&description=" + encodeURIComponent('SocialPutts descriptions') +
                "&link=http://socialputts.com";

            $.blockUI();
            facebookConnectPlugin.api(url, ["publish_actions"], function (response) {
                $.unblockUI();
                        }
            );
        };

        $scope.NotNow = function () {
            $location.path('/allowlocation');
        };

        $scope.PostInFaceBook = function () {
            facebookWallPost();
            $location.path('/allowlocation');
        };
    })