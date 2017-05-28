'use strict';

angular
  .module('po')
  .controller('MainCtrl', MainCtrl);

MainCtrl.$inject = ['$http', '$state', '$filter', 'Upload'];

function MainCtrl($http, $state, $filter, Upload) {
  var ctrl = this;

  ctrl.po = {}; // Total PO Conciliation object
  ctrl.dateFormat = 'MM/dd/yyyy'; // Date format for Angular UI Bootstrap
  ctrl.dateOptions = { // Date option used for date picker
    maxDate: new Date(2050, 12, 31),
    minDate: new Date(2000, 1, 1),
    startingDay: 1,
    showWeeks: false
  };
  ctrl.altDateFormats = ['M!/d!/yyyy']; // Date validation format
  ctrl.itemCategories = ['Missing', 'Cosmetic', 'Broken', 'Extra']; // Conciliation Type

  ctrl.step; // Edit step
  ctrl.stepTitles = [
    'Who is checking in this PO?',
    'Enter Purchase Order Information'
  ];

  ctrl.checkers = [
    'Mike Kobalski',
    'Cort Ulas',
    'Tommy Caveny',
    'Jeremy Vestal'
  ];

  // AWS Configuration
  AWS.config.region = 'us-east-1';
  AWS.config.update({ accessKeyId: 'AKIAIIRPPBXJ5NF2VCBA', secretAccessKey: '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' });

  // Closing Alert
  ctrl.closeAlert = function() {
    ctrl.error = null;
  }

  ctrl.goNext = function(form) {
    if (!form.$valid) {
      return;
    }

    ctrl.step ++;
  }

  ctrl.goPrev = function() {
    ctrl.step --;
  }

  // Post form data to API endpoint
  function postParams() {
    $http({
      method: 'POST',
      url: '/api/send',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      transformRequest: function (obj) {
        var str = [];
        for (var p in obj)
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
      },
      data: {
        poNumber: ctrl.po.poNumber,
        orgPurchasePrice: $filter('currency')(ctrl.po.orgPurchasePrice, '$', 2),
        receivedValue: $filter('currency')(ctrl.po.receivedValue, '$', 2),
        difference: $filter('currency')(ctrl.po.difference, '$', 2),
        receiptDate: $filter('date')(ctrl.po.receiptDate, 'MM/dd/yyyy'),
        name: ctrl.po.contactName,
        email: ctrl.po.contactEmail,
        phoneNumber: ctrl.po.contactPhone,
        items: JSON.stringify(ctrl.po.items),
        emailTo: ctrl.po.emailTo
      }
    }).then(function(response) {
      $state.go('done', {po: ctrl.po, success: true});
    }, function(error) {
      ctrl.error = 'Failed to send email. Please try again.';
    });
  }

  function init() {
    ctrl.step = 0;
  }

  init();
}
