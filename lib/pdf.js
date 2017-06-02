'use strict';

var config = require('../config'),
    path = require('path'),
    emailTemplates = require('email-templates'),
    pdf = require('html-pdf');

var templatesDir = path.resolve(__dirname, '..', 'views/pdf');

exports.generatePDF = function (templateName, locals, fn) {
  emailTemplates(templatesDir, function (err, template) {
    if (err) {
      return fn(err);
    }

    // Generate PDF
    template(templateName, locals, function (err, html, text) {
      if (err) {
        return fn(err);
      }

      pdf.create(html).toStream(function(err, stream) {
        if (err) {
          console.log(err);
          return fn(err);
        } else {
          return fn(null, stream);
        }
      });
    });
  });
}
