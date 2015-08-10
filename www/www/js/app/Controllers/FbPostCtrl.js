angular
  .module('socialputts')
    .controller('FbPostCtrl', function ($scope, $http, $location) {
        var facebookWallPost = function () {
            alert('facebookWallPost ');
  
            var url = "/me/feed?method=post&message=" + encodeURIComponent('SocialPutts message') + 
                "&picture=http://socialputts.com/Content/images/logo.png" +
                "&description=" + encodeURIComponent('SocialPutts descriptions') +
                "&link=http://socialputts.com";
        //    alert("url " + url);
            facebookConnectPlugin.api(url, ["publish_actions"], function (response) {

                        alert(JSON.stringify(response), 'response');
                            if (response && !response.error) {
                                alert('Successful Post');
                            } else {
                                alert(JSON.stringify(response));
                            }
                        }, function (error) {
                            alert(error);
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