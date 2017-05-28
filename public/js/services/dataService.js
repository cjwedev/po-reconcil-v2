'use strict';

angular
  .module('contest')
  .factory('DataService', DataService);

DataService.$inject = ['$http'];

function DataService($http) {
  var service = {
    orgs: orgs,
    checkInfo: checkInfo
  };

  return service;

  function orgs() {
    return $http({
      method: 'GET',
      url: '/contest-landing/api/organizations',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      transformRequest: function (obj) {
        var str = [];
        for (var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
      }
    });
  }

  function checkInfo(email, referralCode) {
    return $http({
      method: 'POST',
      url: '/contest-landing/api/check-info',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      transformRequest: function (obj) {
        var str = [];
        for (var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
      },
      data: {
        email: email,
        referralCode: referralCode
      }
    });
  }
};
