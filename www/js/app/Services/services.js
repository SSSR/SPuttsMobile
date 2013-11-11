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
		object.favCourses = [];
		
        return{
			getObject: function(){
				return object;
			},
			setObject:function(value){
				object.form = value;
			},
			setCountry:function(country){
				object.form.Country = country;
			},
			getAddress:function(){
				return object.form.Zip + ' ' + object.form.City + '+' + object.form.Country + '+' + object.form.State;
			},
			setFavoriteCourses: function(favCourse){
				object.favCourses.push(favCourse);
			},
			removeFavoriteCourse: function(id){
				_.without(object.favCourses, _.findWhere(object.favCourses, {id: id}))
			},
			clearFavoriteCoursesArray:function(){
				object.favCourses = [];
			}
		};
		
	});
