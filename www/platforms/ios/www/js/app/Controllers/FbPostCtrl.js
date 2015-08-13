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
     
                       /* alert(JSON.stringify(response), 'response');
                            if (response && !response.error) {
                                alert('Successful Post');
                            } else {
                                alert(JSON.stringify(response));
                            }
                        }, function (error) {
                            $.unblockUI();
                            alert(error);*/
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