angular.module('socialputts.controllers', [])
.controller('MainCtrl', function ($scope, $http, $location) {
    if ($.jStorage.get('user') != null) {
        $scope.Hello = $.jStorage.get('user').name;
    } else {
        $scope.Hello = "";
    }
})
.controller('HomeCtrl', function ($scope, $http, $location) {
    checkUserLogedOff($location, $scope);

    $scope.$on('$locationChangeStart', function (event, next, current) {
        if (next.search("#/signin") !== -1) {
            event.preventDefault();
        }
    });

    $http.jsonp(socialputtsLink + "/api/email/getTinyUrl?email=" + $.jStorage.get('user').userName + "&alt=json-in-script&callback=JSON_CALLBACK")
	.success(function (tinyUrl) {
	    $scope.tinyUrl = tinyUrl;
	});

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
})
.controller('AccountCtrl', function ($scope, $http, $location) {
    if ($.jStorage.get("user") != null) {
        jQuery.support.cors = true;
        $.connection.hub.url = socialputtsLink + "/signalr/hubs";
        $.connection.hub.qs = { "userId": $.jStorage.get("user").userId };
        $.jStorage.deleteKey('user');
        $.connection.hub.start().done(function () {
            console.log("connected");
        });
        $.connection.messageHub.server.logout();
    }



    $scope.logIn = function () {
        $scope.invalidForm = false;
        var data = $("#sign-in-form").serializeObject();
        var url = socialputtsLink + "/api/account/PostSignIn";

        $http.post(url, data).success(function (data) {
            if (data.loginStatus) {
                $.jStorage.set('user', data);
                $location.path('/index');
            } else {
                $scope.invalidForm = true;
            }
        });

    };

})
.controller('BuddiesCtrl', function ($scope, $http, $location) {
    checkUserLogedOff($location, $scope);

    $http.get(socialputtsLink + "/api/Buddies/Get?userId=" + $.jStorage.get("user").userId)
	.success(function (buddies) {
	    $scope.buddies = buddies;
	});

    $.connection.messageHub.client.userLoggedIn = function (userId) {
        var buddy = _.find($scope.buddies, function (buddyItem) {
            return buddyItem.id == userId;
        });
        buddy.isOnline = true;

        $scope.buddies = _.sortBy($scope.buddies, function (buddy) {
            return !buddy.isOnline == true;
        });

        $scope.$apply();
    };

    $.connection.messageHub.client.userLoggedOut = function (userId) {
        var buddy = _.find($scope.buddies, function (buddyItem) {
            return buddyItem.id == userId;
        });
        buddy.isOnline = false;

        $scope.buddies = _.sortBy($scope.buddies, function (buddy) {
            return !buddy.isOnline == false;
        });

        $scope.$apply();
    };
})
.controller('ChatCtrl', function ($scope, $http, $location, $route) {
    checkUserLogedOff($location, $scope);
    var userId = $route.current.params.userId
    $scope.firstName = $route.current.params.firstName;
    $scope.lastName = $route.current.params.lastName;

    $http.post(socialputtsLink + "/api/Chat/MarkAllMessagesAsRead?userId=" + userId + "&toUserId=" + $.jStorage.get("user").userId)
			.success(function () {
			});

    $.connection.messageHub.client.sendMessage = function (message) {
        $scope.messageText = "";
        $scope.history.unshift({
            dateTime: moment.utc(message.DateTime).local().format('MM/DD/YYYY hh:mm A'),
            fromUserEmail: message.FromUserEmail,
            fromUserId: message.FromUserId,
            fromUserName: message.FromUserName,
            message: message.Message,
            toUserId: message.ToUserId
        });
        $scope.$apply();

        if (message.FromUserId != $.jStorage.get("user").userId) {
            $http.post(socialputtsLink + "/api/Chat/MarkAllMessagesAsRead?userId=" + message.FromUserId + "&toUserId=" + message.ToUserId)
			.success(function () {
			});
        }

    };

    $http.get(socialputtsLink + "/api/Chat/get?userId=" + $.jStorage.get("user").userId + "&buddyId=" + userId)
	.success(function (history) {
	    _.each(history, function (message) {
	        message.dateTime = moment.utc(message.dateTime).local().format('MM/DD/YYYY hh:mm A');
	    });

	    $scope.history = history;
	});

    $scope.sendMessage = function () {

        $.connection.messageHub.server.sendPrivateMessage($.jStorage.get("user").userId, userId, $scope.messageText);
    }
})
.controller('InviteYourBuddiesCtrl', function ($scope, $http, $location, $route) {
    checkUserLogedOff($location, $scope);

    $scope.pattern = "^[_A-Za-z0-9-]+(\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*(\.[A-Za-z]{2,4})$";
    $scope.inviteBuddiesList = [];
    $scope.inviteBuddiesList.push({ fullName: "", email: "" });

    $scope.addNewItem = function () {
        $scope.inviteBuddiesList.push({ name: "", email: "" });
    };
    $scope.removeItem = function (index) {
        $scope.inviteBuddiesList.splice(index, 1);
    };

    $scope.validateInvitations = function () {
        var result = true;
        _.each($scope.inviteBuddiesList, function (item) {
            if (result) {
                if (item.name == undefined || item.name == "") {

                    result = false;
                    alert("The Full Name and Email fields are required. Please fill them all");
                    return;

                }
                if (item.email == undefined || item.email == "") {

                    result = false;
                    alert("The Full Name and Email fields are required. Please fill them all");
                    return;
                }
                if (item.email != undefined && !item.email.match($scope.pattern)) {

                    result = false;
                    alert("One of emails you entered has wrong format.");
                    return;
                }
            }


        });

        _.each($scope.inviteBuddiesList, function (item) {

            var userExist = _.find($scope.inviteBuddiesList, function (invitation) {
                if (item != invitation) {
                    return item.email == invitation.email;
                }
            });
            if (userExist) {
                var repetedEmails = $(".email input").filter(function () { return $(this).val() == item.email; });
                _.each(repetedEmails, function (item) {
                    $(item).addClass("input-validation-error");
                });

                result = false;
            }
        });

        return result;
    };

    $scope.resetErrors = function () {
        var errors = $(".input-validation-error");
        _.each(errors, function (item) {
            $(item).removeClass("input-validation-error");
        });
    };

    $scope.sendInvites = function () {
        $scope.resetErrors();
        var validate = $scope.validateInvitations();
        if (validate) {
            $http.post(socialputtsLink + "/api/Invitation/SendInviteToFriendsViaEmail?userId=" + $.jStorage.get("user").userId, $scope.inviteBuddiesList)
			.success(function () {
			    alert("Invitations has been sent");
			    $route.reload();
			});
        }
    };
})
.controller('CourseFinderCtrl', function ($scope, $http, $location, courseFinderService) {
    checkUserLogedOff($location, $scope);

    $scope.favCourses = [];
    $scope.searchCourseModel = [];
    $scope.autocompleteItem = {};

    $scope.selected = undefined;

    $scope.startsWith = function (state, viewValue) {
        return state.substr(0, viewValue.length).toLowerCase() == viewValue.toLowerCase();
    };


    courseFinderService.clearFavoriteCoursesArray();

    $http.jsonp(socialputtsLink + "/api/Course/GetFavoriteCoursesForUser?userId=" + $.jStorage.get('user').userId + "&alt=json-in-script&callback=JSON_CALLBACK")
        .success(function (result) {
            _.each(result, function (course) {
                $scope.favCourses.push(course);
            });
        });

    $http.jsonp(socialputtsLink + "/api/Course/GetCountriesAndStatesForAutoCompleat?email=" + $.jStorage.get('user').userName + "&alt=json-in-script&callback=JSON_CALLBACK")
        .success(function (result) {

            $scope.searchCourseModel = result;

            var namesStates = [];

            _.each($scope.searchCourseModel.states, function (state) {
                namesStates.push(state.name);
            });

            $("#statesId").autocomplete({
                source: namesStates
            });

        });

    $scope.searchCourse = function ($event) {

        $event.preventDefault();

        $("#country").removeAttr("disabled");

        var courseForm = $('#course-finder-form'); //form course
        var courseFormModel = $(courseForm).serializeObject();

        courseFinderService.setObject(courseFormModel);
        courseFinderService.setCountry($('#country option:selected').text());



        $location.path("/courseResult");
    };

    $scope.addToSearch = function ($event, id) {
        $event.preventDefault();

        _.each($scope.favCourses, function (course) {
            if (course.id == id) {
                course.isAdded = true;
            }
        });

        $scope.getFavoriteCourseForUser(id);
    };

    $scope.removeFromSearch = function ($event, id) {
        $event.preventDefault();

        _.each($scope.favCourses, function (course) {
            if (course.id == id) {
                course.isAdded = false;
            }
        });

        courseFinderService.removeFavoriteCourse(id);
    }

    $scope.getFavoriteCourseForUser = function (id) {
        $http.jsonp(socialputtsLink + "/api/Course/GetFavoriteCourseForUser?email=" + $.jStorage.get('user').userName + "&courseId=" + id + "&alt=json-in-script&callback=JSON_CALLBACK")
		.success(function (course) {
		    var courseToAdd = new Course(course);
		    courseToAdd.isAdded
		    courseFinderService.setFavoriteCourses(courseToAdd);
		})
    };
})
.controller('CourseResultCtrl', function ($scope, $http, $location, courseFinderService) {
    checkUserLogedOff($location, $scope);

    $scope.coursesOnMap = [];
    $scope.allMarkers = [];
    $scope.coursesToSort = [];
    $scope.coordsArray = [];
    $scope.favsCoordArray = [];
    $scope.markers = [];
    $scope.infoWindows = [];
    $scope.popupInfo = {};

    var formObject = courseFinderService.getObject();

    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': courseFinderService.getAddress() }, function (results, status) {
        initializeMap();
        var zoom = 17;
        if (status == google.maps.GeocoderStatus.OK) {
            switch (results[0].address_components[0].types[0]) {

                case "route":
                    break;
                case "administrative_area_level_2":
                    zoom = 6;
                    break;
                case "administrative_area_level_1":
                    zoom = 7;
                    break;
                case "locality":
                    zoom = 10;
                    break;
                case "country":
                    zoom = 4;
                    break;
            }

            var mileage = formObject.form.Mileage;
            if (mileage != "0") {
                switch (mileage) {
                    case "15":
                        zoom = 11; break;
                    case "30":
                        zoom = 10; break;
                    case "50":
                        zoom = 8; break;
                    case "75":
                        zoom = 7; break;
                }
            } else if ((formObject.form.City != "") || (formObject.form.Zip != "")) {
                zoom = 10;
                formObject.form.Mileage = "30"
            }
            map.setZoom(zoom);
            map.setCenter(results[0].geometry.location);
        }



        var center = map.getCenter();
        var packet = {
            CourseModel: formObject.form,
            LatLng: {
                Latitude: center.lat(),
                Longitude: center.lng()
            }
        };

        $http.post(socialputtsLink + "/api/Course/GetSearchedCourses?email=" + $.jStorage.get('user').userName, packet)
			.success(function (courses) {
			    var myOptions = {
			        zoom: map.getZoom(),
			        center: map.getCenter(),
			        mapTypeId: google.maps.MapTypeId.ROADMAP
			    };

			    $.each(formObject.favCourses, function (index, course) {
			        $scope.coursesToSort.push(course);
			    });
			    $.each($scope.favsCoordArray, function (index, coord) {
			        $scope.coordsArray.push(coord);
			    });

			    $.each(courses, function (index, value) {
			        var courseToAdd = new Course(value);

			        $scope.coursesToSort.push(courseToAdd);

			        var coord = new Coords(value);
			        $scope.coordsArray.push(coord);

			    });

			    markMap(myOptions, $scope, $http);

			    $scope.coursesToSort.sort(function (first, seccond) {
			        if (first.discount > seccond.discount) {
			            return -1;
			        } else if (first.discount < seccond.discount) {
			            return 1;
			        } else if (first.mileage < seccond.mileage) {
			            return -1;
			        } else if (first.mileage > seccond.mileage) {
			            return 1;
			        } else {
			            return 0;
			        }
			    });

			    $scope.coursesToSort = $scope.coursesToSort.removeDuplicates();

			    $.each($scope.coursesToSort, function (index, course) {
			        $scope.coursesOnMap.push(course);
			    });
			});
    });

    $scope.addToFavorite = function ($event) {
        $event.preventDefault();
        var id = $($event.target).attr("courseId");
        $http.post(socialputtsLink + "/api/Course/AddCourseToFavorite?userId=" + $.jStorage.get('user').userId + "&id=" + id)
		.success(function (result) {
		    if (result) {
		        var courseToFav = _.find($scope.coursesOnMap, function (course) {
		            return course.id == id;
		        });
		        courseToFav.isNotFavorite = false;
		        courseToFav.isFavourite = false;
		        alert("Course has been added!");
		    } else {
		        alert("Error!");
		    }
		});
    };
    $scope.removeFromFavorite = function ($event) {
        $event.preventDefault();
        var id = $($event.target).attr("courseId");
        $http.post(socialputtsLink + "/api/Course/RemoveFromFavorite?userId=" + $.jStorage.get('user').userId + "&id=" + id)
		.success(function (courseId) {
		    var courseToRemove = _.find($scope.coursesOnMap, function (course) {
		        return course.id == id;
		    });
		    courseToRemove.isNotFavorite = true;

		    $(".not-fav[courseid=" + courseId + "]").hide();
		    $(".list-as-fav[courseid=" + courseId + "]").show();
		});
    };
    $scope.mapRoute = function (data) {
        map.setZoom(14);
        var latlng = new google.maps.LatLng(data.latitude, data.longitude);
        map.setCenter(latlng);
    };
})
.controller('OneClickDiscountCtrl', function ($scope, $http, $location, courseFinderService) {
    checkUserLogedOff($location, $scope);

    var courseFormModel = {City: "", CountryId: "1", CourseName: "", Mileage: "30", NumberOfHoles: "0", Zip: "78664"};

    courseFinderService.setObject(courseFormModel);
    courseFinderService.setCountry("United States");

    $location.path("/courseResult");
})
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
})
.controller('ManageInvitationsCtrl', function ($scope, $http, $location, $filter) {
    checkUserLogedOff($location, $scope);

    $scope.IsUpcoming = "upcoming"; //  "past";
    $scope.ManageInvitationModel = null;
    $scope.InvitationRespons = null;
    $scope.IsShowManageResponsesForm = false;
    $scope.IsShowAcceptedUser = { cssClass: "arrow-right", value: false };
    $scope.IsShowDeclinedUser = { cssClass: "arrow-right", value: false };
    $scope.IsShowNotRepliedUser = { cssClass: "arrow-right", value: false };
    $scope.IsUpdateTeeTime = { cssClass: "btn-default", value: false, countClick: 0 };
    $scope.IsDisabledTime = false;


    $scope.ChangeFlag = function (flagObject) {

        if (flagObject.value) {
            flagObject.value = false;
            flagObject.cssClass = "arrow-right";
        } else {
            flagObject.value = true;
            flagObject.cssClass = "arrow-down";
        }
    };

    $scope.UpdateTeeTime = function () {

        if ($scope.IsUpdateTeeTime.countClick == 0) {
            $scope.IsUpdateTeeTime.countClick++;
            $scope.IsUpdateTeeTime.cssClass = "btn-success";
            $scope.IsUpdateTeeTime.value = true;
            $scope.InvitationRespons.dateTime = $filter('date')($scope.InvitationRespons.dateTime, 'MM/dd/yyyy');

        }
    };

    $scope.CheckTimeRange = function () {

        if ($scope.InvitationRespons.timeFrameValue == null || $scope.InvitationRespons.timeFrameValue == "Select timeframe") {
            $scope.IsDisabledTime = false;
        } else {
            $scope.IsDisabledTime = true;
        }
    };

    $scope.CloseManageResponsesForm = function () {

        $scope.IsShowManageResponsesForm = false;
    };

    $scope.isContainsHttp = function (url) {

        if (url.indexOf('http://') != -1) {
            return true;
        }
        return false;
    };

    $scope.ManageResponse = function (invitation) {
        $(".active-manage-invitation").removeClass("active-manage-invitation");
        $("#" + invitation.id).addClass("active-manage-invitation");
        $(".invitations").css("background-color", "#f6f6f6");

        $scope.IsShowManageResponsesForm = true;

        $http.jsonp(socialputtsLink + "/api/ManageInvitation/ManageResponses?foursomeInvitationId=" + invitation.invitationId + "&alt=json-in-script&callback=JSON_CALLBACK")
            .success(function (result) {

                $scope.InvitationRespons = result;
                $scope.InvitationRespons.hours = $scope._parseStringToInt($scope.InvitationRespons.hours);
                $scope.InvitationRespons.minutes = $scope._parseStringToInt($scope.InvitationRespons.minutes);
                $scope.CheckTimeRange();
            });
    };

    $scope._parseStringToInt = function (arrayString) {

        var arrayInt = new Array();

        for (var stringValue in arrayString) {
            var intValue = parseInt(stringValue);
            arrayInt.push(intValue);
        }
        return arrayInt;
    };

    $scope.AcceptInvitation = function (manageInvitation) {

            $http.post(socialputtsLink + "/api/ManageInvitation/AcceptInvitation?userInvitationId=" + manageInvitation.id + "&userId=" + $.jStorage.get("user").userId )
            .success(function () {
               
                    manageInvitation.status = 1;
            });
    };

    $scope.getUserIdFromjStorage = function () {
               
        return $.jStorage.get('user').userId;
    };

    $scope.DeclineInvitation = function (manageInvitation) {

        $http.post(socialputtsLink + "/api/ManageInvitation/DeclineInvitation?userInvitationId=" + manageInvitation.id + "&userId=" + $.jStorage.get("user").userId)
            .success(function () { 
                
                    manageInvitation.status = 3;
            });
    };

    $scope.ConfirmGolfers = function (invitationId) {
        if ($scope.InvitationRespons.usersConfirmed.length < 4) {
                $(".confirm-event-popup").dialog({
                    modal: true,
                    buttons: {
                        "Yes, Lock It In": function () {
                            
                            $http.post(socialputtsLink + "/api/ManageInvitation/ConfirmFoursomeUserForInvitation?invitationId=" + invitationId)
                            .success(function(){
                                var invitation = _.findWhere($scope.ManageInvitationModel, {invitationId:invitationId});
                                invitation.isConfirmed = true;
                                $scope.CloseManageResponsesForm();
                                $(".confirm-event-popup").dialog("close");
                            });
                            
                        },
                        "Cancel": function () {
                            $(".confirm-event-popup").dialog("close");
                        }
                    }
                });
            } else {
                
               $http.post(socialputtsLink + "/api/ManageInvitation/ConfirmFoursomeUserForInvitation?invitationId=" + invitationId)
                .success(function(){
                    var invitation = _.findWhere($scope.ManageInvitationModel, {invitationId:invitationId});
                    invitation.isConfirmed = true;
                    $scope.CloseManageResponsesForm();
                    $(".confirm-event-popup").dialog("close");
                });
            }
    };

    $scope.GetManageInvitations = function () {

        $scope.CloseManageResponsesForm();

        $http.jsonp(socialputtsLink + "/api/ManageInvitation/ManageInvitations?userId=" + $.jStorage.get('user').userId + "&invitation=" + $scope.IsUpcoming + "&alt=json-in-script&callback=JSON_CALLBACK")
            .success(function (result) {

                $scope.ManageInvitationModel = result.invitationViewModels;
            });
        
    };

    $scope.GetManageInvitations();

    $scope.removeFromConfirmed = function(user, invitationId){
        $http.post(socialputtsLink + "/api/ManageInvitation/RemoveFromConfirmed?userId=" + user.userId + "&invitationId=" + invitationId)
            .success(function(){
                $scope.InvitationRespons.usersConfirmed = _.without($scope.InvitationRespons.usersConfirmed, _.findWhere($scope.InvitationRespons.usersConfirmed, {userId : user.userId}));
                $scope.InvitationRespons.usersAccepted.push(user);
                $scope.InvitationRespons.golfersLeft++;
                var invitation = _.findWhere($scope.ManageInvitationModel, {invitationId:invitationId});
                invitation.openSlots++;
            });
    };

    $scope.addToFrousome = function(user, invitationId){
        if ($scope.InvitationRespons.usersConfirmed.length <= 3) {
            
            $http.post(socialputtsLink + "/api/ManageInvitation/AddToFoursome?userId=" + user.userId + "&invitationId=" + invitationId)
            .success(function(){
                $scope.InvitationRespons.usersAccepted = _.without($scope.InvitationRespons.usersAccepted, _.findWhere($scope.InvitationRespons.usersAccepted, {userId : user.userId}));
                $scope.InvitationRespons.usersConfirmed.push(user);
                $scope.InvitationRespons.golfersLeft--;
                var invitation = _.findWhere($scope.ManageInvitationModel, {invitationId:invitationId});
                invitation.openSlots--;
            });
            
        }else{
            alert("You have already confirmed the maximum four people for your tee time");
        }
    };

    $scope.declineUserByOwner = function(user,invitationId){
        $http.post(socialputtsLink + "/api/ManageInvitation/DeclineUserByOwner?userId=" + user.userId + "&invitationId=" + invitationId)
            .success(function(){
                $scope.InvitationRespons.usersAccepted = _.without($scope.InvitationRespons.usersAccepted, _.findWhere($scope.InvitationRespons.usersAccepted, {userId : user.userId}));
            });
    };

    $scope.sendAMessage = function(invitationId){
        var invitation = _.findWhere($scope.ManageInvitationModel, {invitationId:invitationId});
        $(".send-message-popup").dialog({
            title: "" + invitation.invitationName + invitation.course.courseName + invitation.dateTime,
            modal: true,
            resizable: false,
            buttons: {
                "Send Message": function () {
                    var body = $(".message-body").val();
                    var usersType = $(".users-types").val();
                    var invitationId = invitation.invitationId;
                    var model = {Body:body};

                    $http.post(socialputtsLink + "/api/News/AddPost?userId=" + $.jStorage.get('user').userId + "&isFromManageResponsesPage=true", model)
                    .success(function(){
                        $(".message-body").val("");
                        $(".users-types option:first").attr("selected", "selected");
                    });

                    $http.post(socialputtsLink + "/api/ManageInvitation/SendMessages?usersType=" + usersType + "&invitationId=" + invitationId + "&body=" + body)
                    .success(function(){
                    });

                    $(this).dialog("close");
                },
                Cancel: function () {
                    $(".message-body").val("");
                    $(".users-types option:first").attr("selected", "selected");
                    $(this).dialog("close");
                }
            }
        });
    };

    $scope.cancelEvent = function(invitationId){
        $(".cancel-event-popup").dialog({
            modal: true,
            resizable: false,
            buttons: {
                "[ Yes, Cancel It ]": function () {
                    $(".cancel-event-popup").dialog("close");
                    $scope.ManageInvitationModel = _.without($scope.ManageInvitationModel, _.findWhere($scope.ManageInvitationModel, {invitationId : invitationId}));
                    $scope.CloseManageResponsesForm();
                    
                    $http.post(socialputtsLink + "/api/ManageInvitation/CancelInvitation?invitationId=" + invitationId)
                    .success(function(){                        
                    });
                },
                "[ No, Keep It ]": function () {
                    $(this).dialog("close");
                }
            }
        });
    }
})
.controller('InvitationDetailsCtrl', function($scope, $http, $location, $route){
    checkUserLogedOff($location, $scope);

    $http.jsonp(socialputtsLink + "/api/FoursomeInvitation/InvitationDetails?userId=" + $.jStorage.get('user').userId + "&invitationId=" + $route.current.params.invitationId + "&alt=json-in-script&callback=JSON_CALLBACK")
    .success(function(data){
        $scope.invitation = data;
    });
})
.controller('FavoriteCoursesCtrl', function ($scope, $http, $location) {
    checkUserLogedOff($location, $scope);
    $http.jsonp(socialputtsLink + "/api/Course/GetFavoriteCoursesForUser?userId=" + $.jStorage.get('user').userId + "&alt=json-in-script&callback=JSON_CALLBACK")
        .success(function (result) {
            $scope.favCourses = result;
        });

    $scope.removeFromFav = function (index, course) {
        $http.post(socialputtsLink + "/api/Course/RemoveFromFavorite?userId=" + $.jStorage.get("user").userId + "&id=" + course.id)
            .success(function () {
                $scope.favCourses.splice(index, 1);
            });
    };
})
.controller('SettingsCtrl', function ($scope, $http, $location) {
    checkUserLogedOff($location, $scope);
});

function checkUserLogedOff($location, $scope) {
    if ($.jStorage.get('user') == null) {
        $location.path('#/signin');
    }
	$scope.Hello = $.jStorage.get("user").name;
	startConnection();
    $scope.SP = socialputtsLink;
}

function startConnection(){
	jQuery.support.cors = true;
	$.connection.hub.url = socialputtsLink + "/signalr/hubs";
	$.connection.hub.qs = { "userId" : $.jStorage.get("user").userId };
	$.connection.hub.stop();
	$.connection.hub.start();
}