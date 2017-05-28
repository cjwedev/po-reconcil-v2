'use strict';

angular
  .module('po')
  .controller('DoneCtrl', DoneCtrl);

DoneCtrl.$inject = ['$http', '$stateParams'];

function DoneCtrl($http, $stateParams) {
  var ctrl = this;

  ctrl.po = {};

  function init() {
    ctrl.po = $stateParams.po;
    ctrl.success = $stateParams.success;
  }

  init();
}
