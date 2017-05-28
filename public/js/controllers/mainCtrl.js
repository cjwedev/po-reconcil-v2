'use strict';

angular
  .module('po')
  .controller('MainCtrl', MainCtrl);

MainCtrl.$inject = ['$http', '$state', '$filter', 'Upload'];

function MainCtrl($http, $state, $filter, Upload) {
  var ctrl = this;

  ctrl.po = {};
  ctrl.dateFormat = 'MM/dd/yyyy';
  ctrl.dateOptions = {
    maxDate: new Date(2050, 12, 31),
    minDate: new Date(2000, 1, 1),
    startingDay: 1,
    showWeeks: false
  };
  ctrl.altDateFormats = ['M!/d!/yyyy'];
  ctrl.itemCategories = ['Missing', 'Cosmetic', 'Broken', 'Extra'];

  AWS.config.region = 'us-east-1';
  AWS.config.update({ accessKeyId: 'AKIAIIRPPBXJ5NF2VCBA', secretAccessKey: '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' });

  ctrl.openReceiptDate = function() {
    ctrl.receiptDateOpened = true;
  }

  ctrl.addItem = function() {
    var item = new Object();

    item.category = ctrl.itemCategories[0];
    item.qty = 0;

    ctrl.po.items.push(item);
  }

  ctrl.updateDifference = function() {
    var orgPurchasePrice = parseInt(ctrl.po.orgPurchasePrice) || 0;
    var receivedValue = orgPurchasePrice;
    for (var i = 0; i < ctrl.po.items.length; i++) {
      var item = ctrl.po.items[i];
      if (item.category == 'Missing' || item.category == 'Cosmetic' || item.category == 'Broken') {
        var poChange = parseInt(item.poChange) || 0;
        receivedValue -= poChange;
      } else {
        var poChange = parseInt(item.purchasePrice) || 0;
        receivedValue += poChange;
      }
    }

    ctrl.po.receivedValue = receivedValue;
    ctrl.po.difference = orgPurchasePrice - ctrl.po.receivedValue;
  }

  ctrl.done = function(form) {
    if (!form.$valid) {
      return;
    }

    // Upload files
    var bucket = new AWS.S3({ params: { Bucket: 'poconciliation', maxRetries: 1 }, httpOptions: { timeout: 360000 } });
    var options = {
      partSize: 10 * 1024 * 1024,
      queueSize: 1,
      ACL: 'bucket-owner-full-control'
    };

    var filesCount = 0, uploadedCount = 0;
    for (var i = 0; i < ctrl.po.items.length; i++) {
      var file = ctrl.po.items[i].file;
      if (file) {
        filesCount ++;
        ctrl.po.items[i].fileName = ctrl.po.poNumber + '-' + file.name;
        var params = {
          Bucket: 'poconciliation',
          Key: ctrl.po.items[i].fileName,
          ContentType: file.type, Body: file
        };

        bucket.upload(params, options, function(err, data) {
          uploadedCount ++;

          if (uploadedCount == filesCount) { // All files were uploaded
            postParams();
          }
        });
      }
    }

    if (uploadedCount == 0) {
      postParams();
    }
  }

  ctrl.changeCategory = function(index) {
    var category = ctrl.po.items[index].category;
    ctrl.po.items[index] = {category: category};
  }

  ctrl.selectFile = function(file, index) {
    ctrl.po.items[index].file = file;
  }

  ctrl.removeItem = function(index) {
    ctrl.po.items.splice(index, 1);
  }

  ctrl.closeAlert = function() {
    ctrl.error = null;
  }

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
    ctrl.receiptDateOpened = false;
    ctrl.po.receivedValue = 0;
    ctrl.po.difference = 0;
    ctrl.po.items = [];
  }

  init();
}
