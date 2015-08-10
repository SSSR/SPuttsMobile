angular
  .module('socialputts')
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
                if ($scope.InvitationRespons.discountType === "Dollars") {
                    $scope.discountForGolfers = "$";
                }
                else if ($scope.InvitationRespons.discountType === "Persent") { $scope.discountForGolfers = "%" }
                else { $scope.discountForGolfers = "" }
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

        $http.post(socialputtsLink + "/api/ManageInvitation/AcceptInvitation?userInvitationId=" + manageInvitation.id + "&userId=" + $.jStorage.get("user").userId)
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
                            .success(function () {
                                var invitation = _.findWhere($scope.ManageInvitationModel, { invitationId: invitationId });
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
                .success(function () {
                    var invitation = _.findWhere($scope.ManageInvitationModel, { invitationId: invitationId });
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

    $scope.removeFromConfirmed = function (user, invitationId) {
        $http.post(socialputtsLink + "/api/ManageInvitation/RemoveFromConfirmed?userId=" + user.userId + "&invitationId=" + invitationId)
            .success(function () {
                $scope.InvitationRespons.usersConfirmed = _.without($scope.InvitationRespons.usersConfirmed, _.findWhere($scope.InvitationRespons.usersConfirmed, { userId: user.userId }));
                $scope.InvitationRespons.usersAccepted.push(user);
                $scope.InvitationRespons.golfersLeft++;
                var invitation = _.findWhere($scope.ManageInvitationModel, { invitationId: invitationId });
                invitation.openSlots++;
            });
    };

    $scope.addToFrousome = function (user, invitationId) {
        if ($scope.InvitationRespons.usersConfirmed.length <= 3) {

            $http.post(socialputtsLink + "/api/ManageInvitation/AddToFoursome?userId=" + user.userId + "&invitationId=" + invitationId)
            .success(function () {
                $scope.InvitationRespons.usersAccepted = _.without($scope.InvitationRespons.usersAccepted, _.findWhere($scope.InvitationRespons.usersAccepted, { userId: user.userId }));
                $scope.InvitationRespons.usersConfirmed.push(user);
                $scope.InvitationRespons.golfersLeft--;
                var invitation = _.findWhere($scope.ManageInvitationModel, { invitationId: invitationId });
                invitation.openSlots--;
            });

        } else {
            alert("You have already confirmed the maximum four people for your tee time");
        }
    };

    $scope.declineUserByOwner = function (user, invitationId) {
        $http.post(socialputtsLink + "/api/ManageInvitation/DeclineUserByOwner?userId=" + user.userId + "&invitationId=" + invitationId)
            .success(function () {
                $scope.InvitationRespons.usersAccepted = _.without($scope.InvitationRespons.usersAccepted, _.findWhere($scope.InvitationRespons.usersAccepted, { userId: user.userId }));
            });
    };

    $scope.sendAMessage = function (invitationId) {
        var invitation = _.findWhere($scope.ManageInvitationModel, { invitationId: invitationId });
        $(".send-message-popup").dialog({
            title: "" + invitation.invitationName + invitation.course.courseName + invitation.dateTime,
            modal: true,
            resizable: false,
            buttons: {
                "Send Message": function () {
                    var body = $(".message-body").val();
                    var usersType = $(".users-types").val();
                    var invitationId = invitation.invitationId;
                    var model = { Body: body };

                    $http.post(socialputtsLink + "/api/News/AddPost?userId=" + $.jStorage.get('user').userId + "&isFromManageResponsesPage=true", model)
                    .success(function () {
                        $(".message-body").val("");
                        $(".users-types option:first").attr("selected", "selected");
                    });

                    $http.post(socialputtsLink + "/api/ManageInvitation/SendMessages?usersType=" + usersType + "&invitationId=" + invitationId + "&body=" + body)
                    .success(function () {
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

    $scope.cancelEvent = function (invitationId) {
        $(".cancel-event-popup").dialog({
            modal: true,
            resizable: false,
            buttons: {
                "[ Yes, Cancel It ]": function () {
                    $(".cancel-event-popup").dialog("close");
                    $scope.ManageInvitationModel = _.without($scope.ManageInvitationModel, _.findWhere($scope.ManageInvitationModel, { invitationId: invitationId }));
                    $scope.CloseManageResponsesForm();

                    $http.post(socialputtsLink + "/api/ManageInvitation/CancelInvitation?invitationId=" + invitationId)
                    .success(function () {
                    });
                },
                "[ No, Keep It ]": function () {
                    $(this).dialog("close");
                }
            }
        });
    }
})