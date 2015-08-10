angular
  .module('socialputts')
    .controller('FbPostCtrl', function ($scope, $http, $location) {
        var facebookWallPost = function () {
            alert('facebookWallPost ');
            //                      var params = {
            //                          method: 'feed',
            //                          name: 'SocialPutts  Dialogs',
            //                          link: 'http://socialputts.com/', //'https://developers.facebook.com/docs/reference/dialogs/',
            //                          picture: 'http://socialputts.com/Content/images/logo.png',
            //                          caption: 'Reference Documentation SocialPutts',
            //                          description: 'SocialPutts post message.'
            //                      };
            //                      //  alert(JSON.stringify(params));
            //                      FB.ui(params, function (obj) { //alert(JSON.stringify(obj)); 
            //                      });
            //encodeURIComponent('Testing 123')  facebookConnectPlugin.api("me/?fields=id,name,last_name,picture,email", ["public_profile"], fbAPIResponse);


            /*var object = {
            method: 'feed',
            name: 'SocialPutts  Dialogs',
            link: 'http://socialputts.com/', //'https://developers.facebook.com/docs/reference/dialogs/',
            picture: 'http://socialputts.com/Content/images/logo.png',
            caption: 'Reference Documentation SocialPutts',
            description: 'SocialPutts post message.'
            };

            alert("object " + JSON.stringify(object));

            facebookConnectPlugin.api('me/objects/[namespace]:[object]?method=post&object=' + JSON.stringify(object), ['permissions'],
            function (response) {
            // Return the id of the created object if successfull !
            alert(response);
            },
            function (error) {
            alert(error);
            }
            );*/


            // var url = "/" + $.jStorage.get('user').userId + "/feed?method=post&message=" + encodeURIComponent('Testing 123');
            var url = "/me/feed?method=post&message=" + encodeURIComponent('SocialPutts message') + 
                "&picture=http://socialputts.com/Content/images/logo.png" +
                "&description=" + encodeURIComponent('SocialPutts descriptions') +
                "&link=http://socialputts.com";
            alert("url " + url);
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


            /* var url = '/me/feed?method=post&message=' + "SocialPutts post message" + '&place=12341232454';
            facebookConnectPlugin.api(url,['publish_actions'],function (response) {
            alert(response);
            },
            function (error) {
            alert(error);
            });*/
        };

        $scope.NotNow = function () {
            $location.path('/allowlocation');
        };

        $scope.PostInFaceBook = function () {
            facebookWallPost();
            $location.path('/allowlocation');
        };
    })