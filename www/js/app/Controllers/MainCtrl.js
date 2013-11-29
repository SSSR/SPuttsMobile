angular.module('socialputts.controllers', [])
.controller('MainCtrl', function ($scope, $http, $location) {
    if ($.jStorage.get('user') != null) {
        $scope.Hello = $.jStorage.get('user').name;
    } else {
        $scope.Hello = "";
    }
})


.controller('HomeCtrl', function ($scope, $http, $location) {
    checkUserLogedOff($location);

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
    $.jStorage.deleteKey('user');

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
    checkUserLogedOff($location);
})
.controller('InviteYourBuddiesCtrl', function ($scope, $http, $location) {
    checkUserLogedOff($location);
})


.controller('CourseFinderCtrl', function ($scope, $http, $location, courseFinderService) {
    checkUserLogedOff($location);

    $scope.favCourses = [];
    $scope.searchCourseModel = [];
    $scope.autocompleteItem = {};
    
    $scope.selected = undefined;

    $scope.startsWith = function(state, viewValue) {
        return state.substr(0, viewValue.length).toLowerCase() == viewValue.toLowerCase();
    };


    courseFinderService.clearFavoriteCoursesArray();

    $http.jsonp(socialputtsLink + "/api/Course/GetFavoriteCoursesForUser?email=" + $.jStorage.get('user').userName + "&alt=json-in-script&callback=JSON_CALLBACK")
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
    checkUserLogedOff($location);

    $scope.coursesOnMap = [];
    $scope.allMarkers = [];
    $scope.coursesToSort = [];
    $scope.coordsArray = [];
    $scope.favsCoordArray = [];
    $scope.markers = [];
    $scope.infoWindows = [];

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

			    markMap($scope.coordsArray, myOptions, $scope);

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
        var id = $($event.target).attr("id");
        $http.post(socialputtsLink + "/api/Course/AddCourseToFavorite?email=" + $.jStorage.get('user').userName + "&id=" + id)
		.success(function (result) {
		    if (result) {
		        var courseToFav = _.find($scope.coursesOnMap, function (course) {
		            return course.id == id;
		        });
		        courseToFav.isNotFavorite = false;
		        alert("Course has been added!");
		    } else {
		        alert("Error!");
		    }
		});
    };
})

.controller('FillYourFoursomeCtrl', function ($scope, $http, $location, $route) {
    checkUserLogedOff($location);
	var invitationId = $route.current.params.invitationId;
    var declinedInvitationId = $route.current.params.declinedInvitationId;
    var mode = $route.current.params.mode ? $route.current.params.mode : "golfer";
    $scope.displayBuddiesContaner = false;

    if (invitationId != null) {
        $http
            .get("/profile/GetFillYourFoursome?invitationId=" + invitationId + "&mode=" + mode)
            .success(function (data) {
                _.each(data.Buddies, function (buddyId) {
                    _.each(data.UserBuddies, function (buddy) {
                        if (buddy.Id == buddyId) {
                            buddy.IsSelected = true;
                            return;
                        }
                    });
                });

                if (data.Timeframe == null) {
                    data.ExactTime = data.ExactTimeString; //convertTime(data.Date);
                }

                if (data.GolferMatch.State == null)
                    data.GolferMatch.State = data.GolferMatch.States[0].Id;

                data.GolferMatch.AgesValues.unshift({ 'Id': '0', 'DisplayValue': 'All' });
                data.GolferMatch.HandicapsValues.unshift({ 'Id': '0', 'DisplayValue': 'All' });

                if (data.GolferMatch.Ages.length == 0)
                    data.GolferMatch.Ages.push(data.GolferMatch.AgesValues[0].Id);

                if (data.GolferMatch.Handicaps.length == 0)
                    data.GolferMatch.Handicaps.push(data.GolferMatch.HandicapsValues[0].Id);

                data.Date = convertDate(data.Date);

                $scope.invitation = data;
                $scope.SetDisplayBuddyContainer();
            });
    } else if (declinedInvitationId != null) {
        
        $http
            .get("/profile/GetDeclinedInvitation?declinedInvitationId=" + declinedInvitationId)
            .success(function (data) {
                data.Buddies = null;

                if (data.GolferMatch.State == null)
                    data.GolferMatch.State = data.GolferMatch.States[0].Id;

                data.GolferMatch.AgesValues.unshift({ 'Id': '0', 'DisplayValue': 'All' });
                data.GolferMatch.HandicapsValues.unshift({ 'Id': '0', 'DisplayValue': 'All' });

                if (data.GolferMatch.Ages.length == 0)
                    data.GolferMatch.Ages.push(data.GolferMatch.AgesValues[0].Id);

                if (data.GolferMatch.Handicaps.length == 0)
                    data.GolferMatch.Handicaps.push(data.GolferMatch.HandicapsValues[0].Id);

                data.Date = convertDate(data.Date);
                $scope.invitation = data;
                $scope.invitation.Name = "";
                $scope.SetDisplayBuddyContainer();
            });
    } else {
        var courseId = $route.current.params.courseId;

        $http
            .jsonp(socialputtsLink + "/api/FoursomeInvitation/GetInvitation?userId=" + $.jStorage.get('user').userId + "&courseId=" + courseId + "&mode=" + mode + "&alt=json-in-script&callback=JSON_CALLBACK")
            .success(function (data) {
                if (courseId == null) {
                    data.Date = "";
                    data.Timeframe = null;
                    data.FavoriteCourse = null;

                    if (data.GolferMatch.State == null)
                        data.GolferMatch.State = data.GolferMatch.States[0].Id;

                    data.GolferMatch.AgesValues.unshift({ 'Id': '0', 'DisplayValue': 'All' });
                    data.GolferMatch.HandicapsValues.unshift({ 'Id': '0', 'DisplayValue': 'All' });

                    if (data.GolferMatch.Ages.length == 0)
                        data.GolferMatch.Ages.push(data.GolferMatch.AgesValues[0].Id);

                    if (data.GolferMatch.Handicaps.length == 0)
                        data.GolferMatch.Handicaps.push(data.GolferMatch.HandicapsValues[0].Id);

                    $scope.invitation = data;
                    $scope.SetDisplayBuddyContainer();
                } else {
                    if ($.jStorage.get('fill-your-foursome-model') != null) {
                        var model = $.jStorage.get('fill-your-foursome-model');
                        $.jStorage.deleteKey('fill-your-foursome-model');
                        model.Date = new Date(model.Date);
                        $scope.invitation = model;
                        $scope.invitation.Course = data.Course;
                    } else {
                        $scope.invitation = data;
                        $scope.invitation.date = "";
                    }
                }

            });
    }

    $scope.CourseFinder = function () {
        $scope.invitation.FavoriteCourse = null;

        $.jStorage.set('fill-your-foursome-model', $scope.invitation);

        window.location.href = "/course/courses";
    };

    $scope.ShowSelectBuddiesPopup = function () {
        $scope.IsShowBuddiesPopup = true;

        $("#select-buddies-popup")
            .dialog({
                /*autoOpen: false,*/
                width: $(window).width(),
                height: $(window).height(),
                resizable: false,
				closeOnEscape: false,
				open: function() { $(".ui-dialog-titlebar-close").hide(); },
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
        var selectedBuddies = $scope.invitation.UserBuddies.filter(function (item) {
            return item.IsSelected;
        });
        $scope.displayBuddiesContaner = selectedBuddies.length > 0;
    };

    $scope.SetDisplayBuddyContainer = function() {
        var selectedBuddies = $scope.invitation.UserBuddies.filter(function(item) {
            return item.IsSelected;
        });
        $scope.displayBuddiesContaner = selectedBuddies.length > 0;
    };

    $scope.SendInvitations = function () {
        
        if ($("#FavoriteCourse").length > 0) {
            if (
            ($scope.invitation.FavoriteCourse == null || $scope.invitation.FavoriteCourse == '')
                && $scope.invitation.Course != null) {
                if (!$scope.CheckCourseIfExist($scope.invitation.Course)) {
                    alert('Course does not exist');
                    return;
                }
            }
        } else {
            if ($scope.invitation.Course.Id == 0 && $scope.invitation.Course != null) {
                alert('Course is not selected!');
                return;
            }
        }

        

        var selectedBuddies = $scope.invitation.UserBuddies.filter(function (item) {
            return item.IsSelected;
        });

        $scope.invitation.Buddies = _.pluck(selectedBuddies, 'Id');
        $scope.invitation.GolfersNeeded =
            $scope.invitation.SpecialOffer == null
                ? 3
                : $scope.invitation.GolfersNeeded == 0
                    ? 4
                    : $scope.invitation.GolfersNeeded;
        if ($scope.validateForm()) {
            $http
                .post("/profile/SendInvitations/", $scope.invitation)
                    .success(function (data) {
                        $scope.invitationsSent = parseInt(data);
                        $scope.isSentInvitationsMany = $scope.invitationsSent > 1;
                        $scope.dispalyIf0InvitationsSent = data == 0;
                        $(".successfully-sent-invitations").show();
                        $("input, select, textarea").not("form#view-mode>input").attr("readonly", true).attr("disabled", "disabled");
                    });
        } else {
            $scope.markInvalidFields();
        }
    };

    $scope.validateForm = function () {
        $(".required-text-warning").hide();
        if ($scope.invitation.Name != null && $scope.invitation.Name.length > 0
            && $scope.invitation.Date.length > 0
            && (($scope.invitation.ExactTime != null && $scope.invitation.ExactTime.toString().length > 0) || $scope.invitation.Timeframe != null)) {

            if (new Date($("#Date").val()).toDateString() == (new Date()).toDateString()) {
                var st = (new Date()).toTimeString();
                var et = $("#exacttime").val();
                if (Date.parse((new Date()).toDateString() + " " + st) > Date.parse((new Date()).toDateString() + " " + et)) {
                    alert("Time can not be earlier than now for today!");
                    return false;
                }
            }

            if ($scope.invitation.GolferMatch.ActivateGolferMatch) {
                if ((($scope.invitation.GolferMatch.City != null && $scope.invitation.GolferMatch.City.length > 0) || $scope.invitation.GolferMatch.ZipCode != null && $scope.invitation.GolferMatch.ZipCode.length > 0)) {
                    if (!$scope.checkGolfersMatch())
                        return false;
                } else {
                    $(".required-text-warning").show();
                    return false;
                }
            }

            if ($("#specialOffer").length > 0 && 
                ($scope.invitation.SpecialOffer == null
                    || $scope.invitation.SpecialOffer == ""
                    || $scope.invitation.SpecialOffer == undefined)) {
                $(".required-text-warning").show();
                return false;
            }

            return true;
        }
        $(".required-text-warning").show();
        return false;
    };

    $scope.checkGolfersMatch = function () {
        if (!$scope.invitation.GolferMatch.ProfileBeginner &&
            !$scope.invitation.GolferMatch.ProfileSerious &&
                !$scope.invitation.GolferMatch.JustForFun) {
            alert("Please select a 'Golfer profile'.");
            return false;
        }

        if (!$scope.invitation.GolferMatch.TeesRed &&
            !$scope.invitation.GolferMatch.TeesWhite &&
                !$scope.invitation.GolferMatch.TeesBlue &&
                    !$scope.invitation.GolferMatch.TeesBlack) {
            alert("Please select a 'Tees'.");
            return false;
        }

        if (!$scope.invitation.GolferMatch.FormatsPlayYourOwnBall &&
            !$scope.invitation.GolferMatch.FormatsScramble &&
                !$scope.invitation.GolferMatch.FormatsBestBall &&
                    !$scope.invitation.GolferMatch.FormatsSkins) {
            alert("Please select a 'Formats'.");
            return false;
        }

        return true;
    };

    $scope.markInvalidFields = function () {
        if ($scope.invitation.Name == null || $scope.invitation.Name.length == 0) {
            $("#InvitationName").addClass("error-input");
        } else {
            $("#InvitationName").removeClass("error-input");
        }

        if ($scope.invitation.Date.length == 0) {
            $("#Date").addClass("error-input");
        } else {
            $("#Date").removeClass("error-input");
        }

        if (($scope.invitation.ExactTime == null || $scope.invitation.ExactTime.length == 0) && $scope.invitation.Timeframe == null) {
            $("#exacttime").addClass("error-input");
            $("#timeframe").addClass("error-input");
        } else {
            $("#exacttime").removeClass("error-input");
            $("#timeframe").removeClass("error-input");
        }

        if (($scope.invitation.GolferMatch.City == null || $scope.invitation.GolferMatch.City.length == 0) && ($scope.invitation.GolferMatch.ZipCode == null || $scope.invitation.GolferMatch.ZipCode.length == 0)) {
            $("#city-name").addClass("error-input");
            $("#zip-code").addClass("error-input");
        } else {
            $("#city-name").removeClass("error-input");
            $("#zip-code").removeClass("error-input");
        }

        if (new Date($("#Date").val()).toDateString() == (new Date()).toDateString()) {
            var st = (new Date()).toTimeString();
            var et = $("#exacttime").val();
            if (Date.parse((new Date()).toDateString() + " " + st) > Date.parse((new Date()).toDateString() + " " + et)) {
                $("#Date").addClass("error-input");
                $("#exacttime").addClass("error-input");
            } else {
                $("#Date").removeClass("error-input");
                $("#exacttime").removeClass("error-input");
            }
        }
        if ($("#specialOffer").length > 0 &&
                ($scope.invitation.SpecialOffer == null
                    || $scope.invitation.SpecialOffer == ""
                    || $scope.invitation.SpecialOffer == undefined)) {

            $("#specialOffer").addClass("error-input");
        } else {
            $("#specialOffer").removeClass("error-input");
        }
    };

    $scope.SaveGolferMatchAsDefault = function () {

        if (!$scope.checkGolfersMatch())
            return;

        $http.post('/profile/SaveGolfersMatchDefault', $scope.invitation.GolferMatch)
            .success(function (data) {
                
            });
    };

    $scope.ChangeDate = function (e) {
        
    };

    $scope.BookaTeeTime = function () {
        var invitation = $scope.invitation;

        var url = null;

        if (invitation.FavoriteCourse != null && invitation.FavoriteCourse != 0) {
            url = GetCourseUrlByCourseId(invitation.FavoriteCourse);
        } else if (invitation.Course != null) {
            var course = invitation.Course;

            if (course.CourseSiteBookingUrl != null && course.CourseSiteBookingUrl != '') {
                url = course.CourseSiteBookingUrl;
            } else if (course.CourseName) {
                url = GetCourseUrlByCourseName(course.CourseName);
            }
        }
        if (url != null) {
            OpenBookATeeTimeWindow(url);
        } else {
            alert("Course does not exist");
        }
    };

    $scope.EditInvitation = function () {
        if (($scope.invitation.FavoriteCourse == null || $scope.invitation.FavoriteCourse == '')
                && $scope.invitation.Course != null) {
            if (!$scope.CheckCourseIfExist($scope.invitation.Course)) {
                alert('Course does not exist');
                return;
            }
        }

        var invitationId = $.url().param('invitationId');

        var selectedBuddies = $scope.invitation.UserBuddies.filter(function (item) {
            return item.IsSelected;
        });

        $scope.invitation.Buddies = _.pluck(selectedBuddies, 'Id');

        $http.post('/FoursomeInvitation/EditInvitation?invitationId=' + invitationId, $scope.invitation)
            .success(function (data) {
                $scope.invitationsSent = parseInt(data);
                $scope.isSentInvitationsMany = $scope.invitationsSent > 1;
                $(".successfully-sent-invitations").show();
            });
    };

    $scope.CheckCourseIfExist = function (course) {
        var isValid = false;
        $.ajax({
            url: "/Course/CheckCourseExist?courseName=" + course.CourseName,
            type: "GET",
            async: false,
            success: function (courseId) {
                if (courseId != 0) {
                    isValid = true;
                    course.Id = courseId;
                }
            }
        });
        return isValid;
    };

    $scope.ChangeGolferMatch = function () {
        if (($scope.invitation.GolferMatch.ZipCode != null && $scope.invitation.GolferMatch.ZipCode.length != 5) && ($scope.invitation.GolferMatch.City == null || $scope.invitation.GolferMatch.City.length == 0)) {
            return;
        }

        $scope.IsSearchGolfersMatch = true;
        $scope.IsSearchedGolfersMatch = false;

        $http
            .post("/profile/GetCountMatchedGolfers/", $scope.invitation)
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
.controller('ManageInvitationsCtrl', function ($scope, $http, $location) {
    checkUserLogedOff($location);
})
.controller('FavoriteCoursesCtrl', function ($scope, $http, $location) {
    checkUserLogedOff($location);
})
.controller('SettingsCtrl', function ($scope, $http, $location) {
    checkUserLogedOff($location);
})
.controller('OneClickDiscountCtrl', function ($scope, $http, $location) {
    checkUserLogedOff($location);
});

function checkUserLogedOff($location) {
    if ($.jStorage.get('user') == null) {
        $location.path('#/signin');
    }
}