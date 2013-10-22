var socialputts;
var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, true);
    },

    onDeviceReady: function() {
		socialputts = angular.module('socialputts', ['socialputts.controllers', 'socialputts.services', 'ui.router']);
        angular.element(document).ready(function() {
            angular.bootstrap(document, ['socialputts']);
        });
    },
};