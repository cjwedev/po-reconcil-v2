
var config = require('../config'),
  async = require('async'),
  mailer = require('../mailer/models');

/**
 * Send email
 */
exports.send = function(req, res) {
  console.log(req.body);
  var params = {};
  params.poNumber = req.body.poNumber;
  params.orgPurchasePrice = req.body.orgPurchasePrice;
  params.receiptDate = req.body.receiptDate;
  params.receivedValue = req.body.receivedValue;
  params.difference = req.body.difference;
  params.name = req.body.name;
  params.email = req.body.email;
  params.phoneNumber = req.body.phoneNumber;
  params.items = JSON.parse(req.body.items);

  var mailData = {
    from: req.body.email,
    to: req.body.emailTo,
    subject: 'PO Conciliation',
    data: params
  };
  mailer.sendOne('submit', mailData, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(400).send({'err': 'Failed to send email.'});
    } else {
        return res.send({"success": 1});
    }
  });
}
