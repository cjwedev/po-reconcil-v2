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

  ctrl.receiptDateOpened = false;
  ctrl.step; // Edit step
  ctrl.hasCosmetic;
  ctrl.hasBroken;
  ctrl.hasMissing;
  ctrl.hasExtra;
  ctrl.stepTitles = [
    'Who is checking in this PO?',
    'Enter Purchase Order Information',
    'Were there Cosmetic Items?',
    'Were there Broken Items?',
    'Were there any missing items?',
    'Were there any extra items?',
    'Summary of PO Change'
  ];

  ctrl.checkers = [
    { name: 'Mike Kobalski', email: 'tom@aamedicalstore.com', phone: '708-479-0062'},
    { name: 'Cort Ulas', email: 'mike@aamedicalstore.com', phone: '708-479-0062' },
    { name: 'Tommy Caveny', email: 'jeremy@aamedicalstore.com', phone: '708-479-0062' },
    { name: 'Jeremy Vestal', email: 'cort@aamedicalstore.com', phone: '708-479-0062' }
  ];

  // AWS Configuration
  AWS.config.region = 'us-east-1';
  AWS.config.update({ accessKeyId: 'AKIAIIRPPBXJ5NF2VCBA', secretAccessKey: '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' });

  // Closing Alert
  ctrl.closeAlert = function() {
    ctrl.error = null;
  }

  // Open date picker for Receipt Date
  ctrl.openReceiptDate = function() {
    ctrl.receiptDateOpened = true;
  }

  // Go to next step
  ctrl.goNext = function(form) {
    if (!form.$valid) {
      return;
    }

    ctrl.step ++;
  }

  // Go to previous step
  ctrl.goPrev = function() {
    ctrl.step --;
  }

  ctrl.changeHasCosmetic = function() {
    if (ctrl.hasCosmetic == 'yes') {
      var item = new Object();
      item.category = 'Cosmetic';
      item.moreCosmetic = 'no';
      ctrl.po.cosmetics.push(item);
    } else {
      ctrl.po.cosmetics = [];
    }
  }

  ctrl.addCosmetic = function(index, item) {
    if (item.moreCosmetic == 'yes') {
      var newItem = new Object();
      newItem.category = 'Cosmetic';
      ctrl.po.cosmetics.push(newItem);
    } else {
      ctrl.po.cosmetics.splice(index + 1, 1);
    }
  }

  ctrl.changeHasBroken = function() {
    if (ctrl.hasBroken == 'yes') {
      var item = new Object();
      item.category = 'Broken';
      item.moreBroken = 'no';
      ctrl.po.brokens.push(item);
    } else {
      ctrl.po.brokens = [];
    }
  }

  ctrl.addBroken = function(index, item) {
    if (item.moreBroken == 'yes') {
      var newItem = new Object();
      newItem.category = 'Broken';
      ctrl.po.brokens.push(newItem);
    } else {
      ctrl.po.brokens.splice(index + 1, 1);
    }
  }

  ctrl.changeHasMissing = function() {
    if (ctrl.hasMissing == 'yes') {
      var item = new Object();
      item.category = 'Missing';
      item.moreMissing = 'no';
      ctrl.po.missings.push(item);
    } else {
      ctrl.po.missings.splice(i, 1);
    }
  }

  ctrl.addMissing = function(index, item) {
    if (item.moreMissing == 'yes') {
      var newItem = new Object();
      newItem.category = 'Missing';
      ctrl.po.missings.push(newItem);
    } else {
      ctrl.po.missings.splice(index + 1, 1);
    }
  }

  ctrl.changeHasExtra = function() {
    if (ctrl.hasExtra == 'yes') {
      var item = new Object();
      item.category = 'Extra'
      item.moreExtra = 'no';
      ctrl.po.extras.push(item);
    } else {
      ctrl.po.extras.splice(i, 1);
    }
  }

  ctrl.addExtra = function(index, item) {
    if (item.moreExtra == 'yes') {
      var newItem = new Object();
      newItem.category = 'Extra';
      ctrl.po.extras.push(newItem);
    } else {
      ctrl.po.extras.splice(index + 1, 1);
    }
  }

  // Get items list by category
  ctrl.getItems = function(category) {
    if (category) {
      var list = [];
      for (var i = 0; i < ctrl.po.items.length; i++) {
        if (ctrl.po.items[i].category == category) {
          list.push(ctrl.po.items[i]);
        }
      }

      return list;
    } else {
      return ctrl.po.items;
    }
  }

  // Submit total data
  ctrl.submit = function(form) {
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

    var items = [];
    angular.extend(items, ctrl.cosmetics, ctrl.brokens, ctrl.missings, ctrl.extras);
    var filesCount = 0, uploadedCount = 0;
    for (var i = 0; i < items.length; i++) {
      var file = items[i].file;
      if (file) {
        filesCount ++;
        items[i].fileName = items[i].productNumber + '-' + file.name;
        var params = {
          Bucket: 'poconciliation',
          Key: items[i].fileName,
          ContentType: file.type,
          Body: file
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
      postParams(items);
    }
  }

  // Post form data to API endpoint
  function postParams(items) {
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
        checkerName: ctrl.po.checker.name,
        checkerEmail: ctrl.po.checker.email,
        checkerPhone: ctrl.po.checker.phone,
        emailTo: ctrl.po.emailTo,
        poNumber: ctrl.po.poNumber,
        poAmount: ctrl.po.poAmount,
        receiptDate: $filter('date')(ctrl.po.receiptDate, 'MM/dd/yyyy'),
        accountName: ctrl.po.accountName,
        contactName: ctrl.po.contactName,
        orgPurchasePrice: $filter('currency')(ctrl.po.orgPurchasePrice, '$', 2),
        receivedValue: $filter('currency')(ctrl.po.receivedValue, '$', 2),
        difference: $filter('currency')(ctrl.po.difference, '$', 2),
        items: JSON.stringify(items),
      }
    }).then(function(response) {
    }, function(error) {
      ctrl.error = 'Failed to send email. Please try again.';
    });
  }

  function init() {
    ctrl.step = 0;
    ctrl.hasCosmetic = 'no';
    ctrl.hasBroken = 'no';
    ctrl.hasMissing = 'no';
    ctrl.hasExtra = 'no';
    ctrl.po.cosmetics = [];
    ctrl.po.brokens = [];
    ctrl.po.missings = [];
    ctrl.po.extras = [];
  }

  init();
}
