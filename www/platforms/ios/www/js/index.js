
$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
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

var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        app.receivedEvent('deviceready');
        alert("device ready");
        if (!window.cordova) {
            alert("!window.cordova");
            facebookConnectPlugin.browserInit("847815531980575", "v2.4");
            // version is optional. It refers to the version of API you may want to use.
        } else {
            alert("window.cordova");
            facebookConnectPlugin.browserInit("847815531980575", "v2.4");
        }
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {

    },
    LoginFB: function () {
        alert("LoginFB");
        var fbLoginSuccess = function (userData) {
            alert("UserInfo: " + JSON.stringify(userData));
        }

        facebookConnectPlugin.login(["public_profile"],
        fbLoginSuccess,
        function (error) { alert("" + error) }
    );
    }
};

app.initialize();

/*var socialputtsLink = "http://localhost:52017";*/
var socialputtsLink = "http://socialputtstest.azurewebsites.net/";

