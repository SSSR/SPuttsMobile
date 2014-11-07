$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

var socialputtsLink = "http://socialputtstest.azurewebsites.net";
/*var socialputtsLink = "http://localhost:51425";*/

var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, true);
    },

    onDeviceReady: function() {
        angular.element(document).ready(function() {
            angular.bootstrap(document, ['ngView']);
        });
		FB.init({
                  appId: '1382806861962418',
                  nativeInterface: CDV.FB,
                  status     : true, // check login status
                  //cookie     : true, // enable cookies to allow the server to access the session
                 // xfbml: true,
                  useCachedDialogs: false
              });
    }
};

function User(){};