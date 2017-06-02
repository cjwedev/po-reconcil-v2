
var config = require('../config'),
    async = require('async'),
    mailer = require('../lib/mailer'),
    pdfGenerator = require('../lib/pdf.js');

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
  params.photo = req.body.checkerPhoto;
  params.contactName = req.body.contactName;
  params.accountName = req.body.accountName;
  params.poAmount = req.body.poAmount;
  params.newAmount = req.body.newAmount;
  params.difference = req.body.difference;
  params.receiptDate = req.body.receiptDate;
  params.cosmetics = JSON.parse(req.body.cosmetics);
  params.brokens = JSON.parse(req.body.brokens);
  params.missings = JSON.parse(req.body.missings);
  params.extras = JSON.parse(req.body.extras);

  var mailData = {
    from: req.body.checkerEmail,
    to: req.body.emailTo,
    subject: 'PO Reconciliation',
    data: params
  };

  // Generate PDF file to be attached
  var attachment;
  pdfGenerator.generatePDF('reconciliation', mailData, (error, stream) => {
    if (error) {
      console.log(error);
      return res.status(400).send({'err': 'Failed to generate PDF file.'});
    } else {
      attachment = stream;
      mailData.attachment = attachment;

      mailer.sendOne('submit', mailData, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(400).send({'err': 'Failed to send email.'});
        } else {
            return res.send({"success": 1});
        }
      });
    }
  });
}
