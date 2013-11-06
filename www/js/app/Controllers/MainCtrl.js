angular.module('socialputts.controllers', [])
.controller('MainCtrl', function($scope, $http,  $location){
	if($.jStorage.get('user') != null){
		$scope.Hello = $.jStorage.get('user').name;
	}else{
		$scope.Hello = "";
	}
})
.controller('HomeCtrl', function($scope, $http,  $location){
	checkUserLogedOff($location);
	
	$scope.$on('$locationChangeStart', function(event, next, current){
		if(next.search("#/signin") !== -1){
			event.preventDefault();
		}
	});
	
	$http.jsonp(socialputtsLink + "/api/email/getTinyUrl?email=" + $.jStorage.get('user').userName + "&alt=json-in-script&callback=JSON_CALLBACK")
	.success(function(tinyUrl){
		$scope.tinyUrl = tinyUrl;
	});
	
	$scope.inviteFbFriends = function($event){
		$event.preventDefault();
		 FB.ui({
			method: 'send',
			link: socialputtsLink
		});
	};
	
	$scope.inviteTwitterFriends = function($event){
		$event.preventDefault();
		var width = 575,
		height = 400,
		left = ($(window).width() - width) / 2,
		top = ($(window).height() - height) / 2,
		url = "http://twitter.com/share?text=%23Join%20me%20for%20%23FREE%20on%20%23SocialPutts%2C%20the%20World's%20First%20%23Golf%20Social%20Network!%20%23Connect%2C%20play%20golf%20%26%20have%20more%20%23fun!%20 " + $scope.tinyUrl + "&url=",
		opts = 'status=1' +
				 ',width=' + width +
				 ',height=' + height +
				 ',top=' + top +
				 ',left=' + left;

		window.open(url, 'twitter', opts);

		return false;
	};
})
.controller('AccountCtrl', function($scope, $http, $location){
	$.jStorage.deleteKey('user');
		
	$scope.logIn = function(){
		$scope.invalidForm = false;
			var data = $("#sign-in-form").serializeObject();
			var url = socialputtsLink + "/api/account/PostSignIn";
			
			$http.post(url, data).success(function(data){
				if(data.loginStatus){
					$.jStorage.set('user', data);
					$location.path('/index');
				}else{
					$scope.invalidForm = true;
				}
			});
		
	};
	
})
.controller('BuddiesCtrl', function($scope, $http, $location){
	checkUserLogedOff($location);
})
.controller('InviteYourBuddiesCtrl', function($scope, $http, $location){
	checkUserLogedOff($location);
})
.controller('CourseFinderCtrl', function($scope, $http, $location){
	checkUserLogedOff($location);
})
.controller('FillYourFoursomeCtrl', function($scope, $http, $location){
	checkUserLogedOff($location);
})
.controller('ManageInvitationsCtrl', function($scope, $http, $location){
	checkUserLogedOff($location);
})
.controller('FavoriteCoursesCtrl', function($scope, $http, $location){
	checkUserLogedOff($location);
})
.controller('SettingsCtrl', function($scope, $http, $location){
	checkUserLogedOff($location);
})
.controller('OneClickDiscountCtrl', function($scope, $http, $location){
	checkUserLogedOff($location);
});

function checkUserLogedOff($location){
	if($.jStorage.get('user') == null){
		$location.path('#/signin');
	}
}