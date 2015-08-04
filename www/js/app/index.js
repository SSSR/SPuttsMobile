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

 
/*var socialputtsLink = "http://localhost:52017";*/
var socialputtsLink = "http://socialputtstest.azurewebsites.net/";


var app = {
    initialize: function () {
        this.bindEvents();
    },
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, true);
    },

    onDeviceReady: function () {
        if ((typeof cordova == 'undefined') && (typeof Cordova == 'undefined')) alert('Cordova variable does not exist. Check that you have included cordova.js correctly');
        if (typeof CDV == 'undefined') alert('CDV variable does not exist. Check that you have included cdv-plugin-fb-connect.js correctly');
        if (typeof FB == 'undefined') alert('FB variable does not exist. Check that you have included the Facebook JS SDK file.');

        FB.Event.subscribe('auth.login', function (response) {
            alert('auth.login event' + JSON.stringify(response));
        });

        FB.Event.subscribe('auth.logout', function (response) {
           alert('auth.logout event' + JSON.stringify(response));
        });

        FB.Event.subscribe('auth.sessionChange', function (response) {
            alert('auth.sessionChange event' + JSON.stringify(response));
        });

        FB.Event.subscribe('auth.statusChange', function (response) {
             alert('auth.statusChange event' + JSON.stringify(response));
        });

        try {
            alert('Device is ready! 847815531980575');
            // FB.init({ appId: "1626691300888292", nativeInterface: CDV.FB, useCachedDialogs: false });

            FB.init({ appId: "847815531980575", nativeInterface: CDV.FB, useCachedDialogs: false });
        } catch (e) {
            alert(e);
        } 
    }
};

function User(){};