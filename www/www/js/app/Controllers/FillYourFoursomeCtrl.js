angular
  .module('socialputts')
.controller('FillYourFoursomeCtrl', function ($scope, $http, $location, $route) {
    checkUserLogedOff($location, $scope);

    $scope.isEdit = false;
    $scope.displayBuddiesContaner = false;
    $scope.isUserInRole = $.jStorage.get("user").isUserInCourseAdminRole;
    $scope.mode = "golfer";

    var invitationId = $route.current.params.invitationId;
    var courseId = $route.current.params.courseId;

    if (invitationId != null) {
        $scope.isEdit = true;
        $http.jsonp(socialputtsLink + "/api/FoursomeInvitation/GetInvitation?userId=" + $.jStorage.get('user').userId + "&invitationId=" + invitationId + "&alt=json-in-script&callback=JSON_CALLBACK")
		.success(function (data) {
		    _.each(data.buddies, function (buddyId) {
		        _.each(data.userBuddies, function (buddy) {
		            if (buddy.id == buddyId) {
		                buddy.IsSelected = true;
		                return;
		            }
		        });
		    });

		    if (data.timeframe == null) {
		        data.exactTime = data.exactTimeString;
		    }

		    if (data.golferMatch.state == null)
		        data.golferMatch.state = data.golferMatch.states[0].id;

		    data.golferMatch.agesValues.unshift({ 'id': '0', 'displayValue': 'All' });
		    data.golferMatch.handicapsValues.unshift({ 'id': '0', 'displayValue': 'All' });

		    if (data.golferMatch.ages.length == 0)
		        data.golferMatch.ages.push(data.golferMatch.agesValues[0].id);

		    if (data.golferMatch.handicaps.length == 0)
		        data.golferMatch.handicaps.push(data.golferMatch.handicapsValues[0].Id);

		    data.date = moment(data.date).format("MM/DD/YYYY");

		    $scope.invitation = data;
		    $scope.SetDisplayBuddyContainer();
		});
    } else {
        $http
		.jsonp(socialputtsLink + "/api/FoursomeInvitation/GetInvitation?userId=" + $.jStorage.get('user').userId + "&courseId=" + courseId + "&alt=json-in-script&callback=JSON_CALLBACK")
		.success(function (data) {
		    if (courseId == null) {
		        data.date = "";
		        data.timeframe = null;
		        data.favoriteCourse = null;

		        if (data.golferMatch.state == null)
		            data.golferMatch.state = data.golferMatch.states[0].id;

		        data.golferMatch.agesValues.unshift({ 'id': '0', 'displayValue': 'All' });
		        data.golferMatch.handicapsValues.unshift({ 'id': '0', 'displayValue': 'All' });

		        if (data.golferMatch.ages.length == 0)
		            data.golferMatch.ages.push(data.golferMatch.agesValues[0].id);

		        if (data.golferMatch.handicaps.length == 0)
		            data.golferMatch.handicaps.push(data.golferMatch.handicapsValues[0].id);

		        $scope.invitation = data;
		        $scope.SetDisplayBuddyContainer();
		    } else {
		        data.golferMatch.agesValues.unshift({ 'id': '0', 'displayValue': 'All' });
		        data.golferMatch.handicapsValues.unshift({ 'id': '0', 'displayValue': 'All' });

		        if (data.golferMatch.ages.length == 0) {
		            data.golferMatch.ages.push(data.golferMatch.agesValues[0].id);
		        }

		        if (data.golferMatch.handicaps.length == 0) {
		            data.golferMatch.handicaps.push(data.golferMatch.handicapsValues[0].id);
		        }

		        $scope.invitation = data;
		        $scope.invitation.date = "";
		    }
		});
    }
     
    $scope.ShowSelectBuddiesPopup = function () {
        $scope.IsShowBuddiesPopup = true;

        $("#select-buddies-popup")
            .dialog({
                /*autoOpen: false,*/
                width: $(window).width(),
                height: $(window).height(),
                resizable: false,
                closeOnEscape: false,
                open: function () { $(".ui-dialog-titlebar-close").hide(); },
                buttons: {
                    Close: function () {
                        $(this).dialog("close");
                    }
                }
            });
    };

    $scope.AddBuddy = function () {
        this.buddy.IsSelected = true;
        $scope.displayBuddiesContaner = true;
    };

    $scope.RemoveBuddy = function () {
        this.buddy.IsSelected = false;
        var selectedBuddies = $scope.invitation.userBuddies.filter(function (item) {
            return item.IsSelected;
        });
        $scope.displayBuddiesContaner = selectedBuddies.length > 0;
    };

    $scope.SetDisplayBuddyContainer = function () {
        var selectedBuddies = $scope.invitation.userBuddies.filter(function (item) {
            return item.IsSelected;
        });
        $scope.displayBuddiesContaner = selectedBuddies.length > 0;
    };

    $scope.SendInvitations = function () {

        if ($("#FavoriteCourse").length > 0) {
            if (($scope.invitation.favoriteCourse == null || $scope.invitation.favoriteCourse == '') && $scope.invitation.course != null) {
                $http.get(socialputtsLink + "/api/Course/CheckCourseExist?courseName=" + $scope.invitation.course.courseName)
					.success(function (courseId) {
					    if (courseId != 0) {
					        $scope.invitation.course.id = courseId;
					        $scope.validateFormAndSendInvitations();
					    } else {
					        alert('Course does not exist');
					        return;
					    }
					});
            } else {
                $scope.validateFormAndSendInvitations();
            }
        } else {
            if ($scope.invitation.course.id == 0 && $scope.invitation.course != null) {
                alert('Course is not selected!');
                return;
            } else {
                $scope.validateFormAndSendInvitations();
            }
        }
    };

    $scope.EditInvitation = function () {
        if (($scope.invitation.favoriteCourse == null || $scope.invitation.favoriteCourse == '')
                && $scope.invitation.course != null) {
            $http.get(socialputtsLink + "/api/Course/CheckCourseExist?courseName=" + $scope.invitation.course.courseName)
				.success(function (courseId) {
				    if (courseId != 0) {
				        $scope.invitation.course.id = courseId;
				        $scope.validateFormAndSendInvitations();
				    } else {
				        alert('Course does not exist');
				        return;
				    }
				});
        }

        var invitationId = $route.current.params.invitationId;

        var selectedBuddies = $scope.invitation.userBuddies.filter(function (item) {
            return item.IsSelected;
        });

        $scope.invitation.buddies = _.pluck(selectedBuddies, 'id');
        $scope.invitation.golfersNeeded =
            $scope.invitation.specialOffer == null
                ? 3
                : $scope.invitation.golfersNeeded == 0
                    ? 4
                    : $scope.invitation.golfersNeeded;

        if ($scope.validateForm()) {
            $http.post(socialputtsLink + "/api/FoursomeInvitation/EditInvitation?userId=" + $.jStorage.get('user').userId + "&invitationId=" + invitationId, $scope.invitation)
                    .success(function (data) {
                        $scope.invitationsSent = parseInt(data);
                        $scope.isSentInvitationsMany = $scope.invitationsSent > 1;
                        $scope.dispalyIf0InvitationsSent = data == 0;
                        $(".successfully-sent-invitations").show();
                        if (data != 0) {
                            $("input, select, textarea").not("form .mode-container > input").attr("readonly", true).attr("disabled", "disabled");
                        }
                    });
        }
    };


    $scope.validateFormAndSendInvitations = function () {
        var selectedBuddies = $scope.invitation.userBuddies.filter(function (item) {
            return item.IsSelected;
        });

        $scope.invitation.buddies = _.pluck(selectedBuddies, 'id');
        $scope.invitation.golfersNeeded =
            $scope.invitation.specialOffer == null
                ? 3
                : $scope.invitation.golfersNeeded == 0
                    ? 4
                    : $scope.invitation.golfersNeeded;
        if ($scope.validateForm()) {
            $http.post(socialputtsLink + "/api/FoursomeInvitation/SendInvitations?userId=" + $.jStorage.get('user').userId, $scope.invitation)
                    .success(function (data) {
                        $scope.invitationsSent = parseInt(data);
                        $scope.isSentInvitationsMany = $scope.invitationsSent > 1;
                        $scope.dispalyIf0InvitationsSent = data == 0;
                        $(".successfully-sent-invitations").show();
                        if (data != 0) {
                            $("input, select, textarea").not("form .mode-container > input").attr("readonly", true).attr("disabled", "disabled");
                        }
                    });
        }
    }

    $scope.validateForm = function () {
        if ($scope.invitation.name != null && $scope.invitation.name.length > 0
            && $scope.invitation.date.length > 0
            && (($scope.invitation.exactTime != null && $scope.invitation.exactTime.toString().length > 0) || $scope.invitation.timeframe != null)) {

            if (new Date($("#date").val()).toDateString() == (new Date()).toDateString()) {
                var st = (new Date()).toTimeString();
                var et = $("#exact-time").val();
                if (Date.parse((new Date()).toDateString() + " " + st) > Date.parse((new Date()).toDateString() + " " + et)) {
                    alert("Time can not be earlier than now for today!");
                    return false;
                }
            }

            if ($scope.invitation.golferMatch.activateGolferMatch) {
                if ((($scope.invitation.golferMatch.city != null && $scope.invitation.golferMatch.city.length > 0) || $scope.invitation.golferMatch.zipCode != null && $scope.invitation.golferMatch.zipCode.length > 0)) {
                    if (!$scope.checkGolfersMatch())
                        return false;
                } else {
                    alert("Please complete all required fields");
                    return false;
                }
            }

            if ($("#specialOffer").length > 0 &&
                ($scope.invitation.specialOffer == null
                    || $scope.invitation.specialOffer == ""
                    || $scope.invitation.specialOffer == undefined)) {
                alert("Please complete all required fields");
                return false;
            }

            return true;
        }
        alert("Please complete all required fields");
        return false;
    };

    $scope.checkGolfersMatch = function () {
        if (!$scope.invitation.golferMatch.profileBeginner &&
            !$scope.invitation.golferMatch.profileSerious &&
                !$scope.invitation.golferMatch.justForFun) {
            alert("Please select a 'Golfer profile'.");
            return false;
        }

        if (!$scope.invitation.golferMatch.teesRed &&
            !$scope.invitation.golferMatch.teesWhite &&
                !$scope.invitation.golferMatch.teesBlue &&
                    !$scope.invitation.golferMatch.teesBlack) {
            alert("Please select a 'Tees'.");
            return false;
        }

        if (!$scope.invitation.golferMatch.formatsPlayYourOwnBall &&
            !$scope.invitation.golferMatch.formatsScramble &&
                !$scope.invitation.golferMatch.formatsBestBall &&
                    !$scope.invitation.golferMatch.formatsSkins) {
            alert("Please select a 'Formats'.");
            return false;
        }

        return true;
    };

    $scope.SaveGolferMatchAsDefault = function () {

        if (!$scope.checkGolfersMatch())
            return;

        $http.post(socialputtsLink + '/api/FoursomeInvitation/SaveGolfersMatchDefault?userId=' + $.jStorage.get("user").userId, $scope.invitation.golferMatch)
            .success(function () {
                alert("Golfer Match Successfully saved!");
            });
    };


    $scope.BookaTeeTime = function ($event) {
        $event.preventDefault();
        var invitation = $scope.invitation;

        var url = null;

        if (invitation.favoriteCourse != null && invitation.favoriteCourse != 0) {
            $http.jsonp(socialputtsLink + "/api/Course/GetCourseUrl?courseId=" + invitation.favoriteCourse + "&courseName=&alt=json-in-script&callback=JSON_CALLBACK")
			.success(function (courseBookUrl) {
			    if (courseBookUrl.indexOf("Course does not exist") == 0) {
			        alert("Course does not exist");
			    } else {
			        $scope.OpenBookATeeTimeWindow(courseBookUrl);
			    }
			});
        } else if (invitation.course != null) {
            var course = invitation.course;

            if (course.courseSiteBookingUrl != null && course.courseSiteBookingUrl != '') {
                $scope.OpenBookATeeTimeWindow(course.courseSiteBookingUrl);
            } else if (course.courseName) {
                $http.jsonp(socialputtsLink + "/api/Course/GetCourseUrl?courseId=&courseName=" + course.courseName + "&alt=json-in-script&callback=JSON_CALLBACK")
				.success(function (courseBookUrl) {
				    if (courseBookUrl.indexOf("Course does not exist") == 0) {
				        alert("Course does not exist");
				    } else {
				        $scope.OpenBookATeeTimeWindow(courseBookUrl);
				    }
				});
            }
        }
    };

    $scope.OpenBookATeeTimeWindow = function (url) {
        if (url == "" || url == null) {
            url = "www.golfnow.com";
        }
        if (url.indexOf("http://") == -1) {
            url = "http://" + url;
        }
        window.open(url, "_system");
    }

    $scope.ChangeGolferMatch = function () {
        if (($scope.invitation.golferMatch.zipCode != null && $scope.invitation.golferMatch.zipCode.length != 5) && ($scope.invitation.golferMatch.city == null || $scope.invitation.golferMatch.city.length == 0)) {
            return;
        }

        $scope.IsSearchGolfersMatch = true;
        $scope.IsSearchedGolfersMatch = false;

        $http
            .post(socialputtsLink + "/api/FoursomeInvitation/GetCountMatchedGolfers?userId=" + $.jStorage.get('user').userId, $scope.invitation)
                .success(function (data) {
                    $scope.IsSearchGolfersMatch = false;
                    $scope.IsSearchedGolfersMatch = true;
                    $scope.countInvitationsPending = parseInt(data);
                    $scope.isGreaterThenOne = $scope.countInvitationsPending > 1;
                })
            .error(function () {
                $scope.IsSearchGolfersMatch = false;
                $scope.IsSearchedGolfersMatch = false;
            });
        };

      /*  $scope.getAvatar = function (email) {
            var url = $scope.SP + "/Profile/GetAvatar?username=" + email;
            return url;
        };*/
})