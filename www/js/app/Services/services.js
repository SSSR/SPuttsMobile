angular.module('socialputts.services', [])
    .factory('cordovaReady', [function () {
        return function (fn) {
            var queue = [],
                impl = function () {
                    queue.push([].slice.call(arguments));
                };

            document.addEventListener('deviceready', function () {
                queue.forEach(function (args) {
                    fn.apply(this, args);
                });
                impl = fn;
            }, false);

            return function () {
                return impl.apply(this, arguments);
            };
        };
    }])
	
	.factory('courseFinderService', function(){
		var object = {};
		
        return{
			getObject: function(){
				return object;
			},
			setObject:function(value){
				object = value;
			},
			setCountry:function(country){
				object.Country = country;
			},
			getAddress:function(){
				return object.Zip + ' ' + object.City + '+' + object.Country + '+' + object.State;
			},
			setFavoriteCourses: function(array){
				object.favCourses = [];
				_.each(array, function(course){
					object.favCourses.push(course);
				});
			}
		};
		
	});
