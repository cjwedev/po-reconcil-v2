
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
  params.name = req.body.checkerName;
  params.email = req.body.checkerEmail;
  params.phoneNumber = req.body.checkerPhone;
  params.contactName = req.body.contactName;
  params.accountName = req.body.accountName;
  params.poAmount = req.body.poAmount;
  params.newAmount = req.body.newAmount;
  params.difference = req.body.difference;
  params.receiptDate = req.body.receiptDate;
  params.receivedValue = req.body.receivedValue;
  params.items = JSON.parse(req.body.items);

  var mailData = {
    from: req.body.checkerEmail,
    to: req.body.emailTo,
    subject: 'PO Reconciliation',
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
