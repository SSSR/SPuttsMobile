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
					$scope.Hello = data.name;
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