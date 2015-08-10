angular
  .module('socialputts')
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