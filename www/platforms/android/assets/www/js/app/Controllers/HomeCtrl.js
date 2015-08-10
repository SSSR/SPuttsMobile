angular
  .module('socialputts')
    .controller('HomeCtrl', function ($scope, $http, $location) {
    if (checkUserLogedOff($location, $scope)) {
        $scope.useriduser = $.jStorage.get('user').userId;
        $scope.$on('$locationChangeStart', function (event, next, current) {
            if (next.search("#/signin") !== -1) {
                event.preventDefault();
            }
        });

        $http.jsonp(socialputtsLink + "/api/email/getTinyUrl?email=" + $.jStorage.get('user').userName + "&alt=json-in-script&callback=JSON_CALLBACK")
	.success(function (tinyUrl) {
	    $scope.tinyUrl = tinyUrl;
	});

        $scope.numberPage = 1;
        $scope.countPages = 0;
        getAllPostAndComment(1);

        $http.get(socialputtsLink + "/api/News/InvitaitionCount/?UserId=" + $.jStorage.get('user').userId)
    .success(function (countInvitation) {
        $scope.countRequiredResponses = countInvitation.countReqiuredResponses;
        $scope.countTotalInvitation = countInvitation.countTotalInvitation;
    });

    }

    function getAllPostAndComment(numberPage) {
        $scope.numberPage = numberPage;
        document.getElementById('nextButton').disabled = true;
        document.getElementById('previousButton').disabled = true;
        $http.get(socialputtsLink + "/api/News/GetNewsForUser?targetUserId=" + $.jStorage.get('user').userId + "&page=" + numberPage)
           .success(function (model) {
               _.each(model.postAndNewsCollection, function (post) {
                   post.createdAt = moment.utc(post.createdAt).local().format('MM/DD/YYYY hh:mm A');
                   _.each(post.comments, function (comment) {
                       comment.createdAt = moment.utc(comment.createdAt).local().format('MM/DD/YYYY hh:mm A');
                   });
               });
               $scope.model = model;
               $scope.countPages = model.count;
               checkElement();
           });
    }


    $scope.inviteFbFriends = function ($event) {
        $event.preventDefault();
        var windowSize = "width=" + window.innerWidth + ",height=" + window.innerHeight + ",scrollbars=no";
        url = "https://facebook.com/dialog/feed?client_id=1382806861962418&link=http://socialputts.com&redirect_uri=http://facebook.com&display=touch";
        window.open(url, 'popup', windowSize);

        return false;
    };

    $scope.inviteTwitterFriends = function ($event) {
        $event.preventDefault();
        var width = 575,
		height = 400,
		url = "http://twitter.com/share?text=%23Join%20me%20for%20%23FREE%20on%20%23SocialPutts%2C%20the%20World's%20First%20%23Golf%20Social%20Network!%20%23Connect%2C%20play%20golf%20%26%20have%20more%20%23fun!%20 " + $scope.tinyUrl + "&url=",
		opts = 'status=1' +
				 ',width=' + width +
				 ',height=' + height;
        var windowSize = "width=" + window.innerWidth + ",height=" + window.innerHeight + ",scrollbars=no";

        window.open(url, 'twitter', windowSize);

        return false;
    };

    $scope.postMessageToNewsFeed = function () {
        var body = $("#news-feed-message").val();

        var model = { Body: body };

        $http.post(socialputtsLink + "/api/News/AddPost?userId=" + $.jStorage.get('user').userId + "&isFromManageResponsesPage=true", model)
            .success(function () {
                $("#news-feed-message").val("");
                getAllPostAndComment(1);
                /* alert("Message has been posted to News Feed!");*/
            });
    };
    //$http.jsonp(socialputtsLink + "/api/Course/GetCourseUrl?courseId=" + invitation.favoriteCourse + "&courseName=&alt=json-in-script&callback=JSON_CALLBACK")


    $scope.next = function () {

        if ($scope.numberPage < $scope.countPages) {
            $scope.numberPage = $scope.numberPage + 1;
            getAllPostAndComment($scope.numberPage)
        }
    };

    $scope.previous = function () {
        if ($scope.numberPage > 1) {
            $scope.numberPage = $scope.numberPage - 1;
            getAllPostAndComment($scope.numberPage)
        }

    };

    function checkElement() {
        if ($scope.numberPage < $scope.countPages && $scope.numberPage > 1) {
            document.getElementById('nextButton').disabled = false;
            document.getElementById('previousButton').disabled = false;
        }
        if ($scope.numberPage == $scope.countPages) {
            document.getElementById('nextButton').disabled = true;
            document.getElementById('previousButton').disabled = false;
        }
        if ($scope.numberPage == 1 && $scope.numberPage < $scope.countPages) {
            document.getElementById('nextButton').disabled = false;
            document.getElementById('previousButton').disabled = true;
        }
    }

    $scope.commentBody = "";
    $scope.addComment = function AddComment(commentBody, postIdForComment) {

        $http.get(socialputtsLink + "/api/News/AddComment/?authorId=" + $.jStorage.get('user').userId + "&body=" + commentBody + "&postId=" + postIdForComment)
            .success(function (commentsForPost) {
                angular.forEach($scope.model.postAndNewsCollection, function (post) {
                    if (post.id === postIdForComment) {
                        var today = new Date()
                        var author = { 'email': commentsForPost.author.email };
                        post.comments.push({
                            'id': commentsForPost.id,
                            'authorId': commentsForPost.authorId,
                            'lastName': $.jStorage.get('user').name,
                            'postId': commentsForPost.postId,
                            'body': commentsForPost.body,
                            'createdAt': moment.utc(commentsForPost.createdAt).local().format('MM/DD/YYYY hh:mm A'),
                            'author': author
                        });

                        return;
                    }
                });
            });

    };

    $scope.isShowRemoveButton = function (post) {
        if (post.targetUserId == $.jStorage.get('user').userId ||
            post.authorId == $.jStorage.get('user').userId) {
            return true;
        }
        return false;
    };
    /*  $scope.checkingCurent = function (authorUser) {
    if ($.jStorage.get('user').userId == authorUser) {
    return true;
    }

    };*/

    $scope.editCommentforPost = function (editCommentBody, commentId) {

        $http.get(socialputtsLink + "/api/News/EditComment/?authorId=" + $.jStorage.get('user').userId + "&text=" + editCommentBody + "&commentId=" + commentId)
            .success(function () {
                angular.forEach($scope.model.postAndNewsCollection, function (post) {
                    angular.forEach(post.comments, function (comment) {
                        if (comment.id === commentId) {

                            comment.body = editCommentBody;
                        }
                    });
                });
            });
    };

    $scope.editpost = function (editPostBody, postId) {

        $http.get(socialputtsLink + "/api/News/EditPost/?authorId=" + $.jStorage.get('user').userId + "&text=" + editPostBody + "&postId=" + postId)
            .success(function () {
                angular.forEach($scope.model.postAndNewsCollection, function (post) {

                    if (post.id === postId) {
                        post.body = editPostBody;
                        return;
                    }
                });


            });
    };

    $scope.removePost = function (postIdForRemove) {
        $http.get(socialputtsLink + "/api/News/RemovePost/?postId=" + postIdForRemove)
            .success(function () {
                angular.forEach($scope.model.postAndNewsCollection, function (post) {

                    if (post.id === postIdForRemove) {
                        var indexPost = $scope.model.postAndNewsCollection.indexOf(post);
                        $scope.model.postAndNewsCollection.splice(indexPost, 1);
                        return;
                    }
                });
            });
    };

    $scope.removeComment = function (commentId) {
        $http.get(socialputtsLink + "/api/News/RemoveComment/?commentId=" + commentId)
            .success(function () {
                angular.forEach($scope.model.postAndNewsCollection, function (post) {
                    angular.forEach(post.comments, function (comment) {
                        if (comment.id === commentId) {
                            var index = post.comments.indexOf(comment);
                            post.comments.splice(index, 1);
                            return;
                        }
                    });
                });
            });
    };



    $scope.daterminateLogo = function (body) {
        if (body !== undefined) {
            if (body.indexOf("Socialputts-logo") !== -1) {
                return "SocialputtsLogo";
            }
            if (body.indexOf("Course-logo") !== -1) {
                return "courseAvatar";
            }
        }

        return "default";
    };

    $scope.daterminateCourseId = function (body) {
        var tempStr = body.split('[')[1];
        var courseId = tempStr.split(']')[0];
        return courseId;
    };

    $scope.getAvatar = function (email) {
        var url = $scope.SP + "/Profile/GetAvatar/" + email;
        return url;
    };

})