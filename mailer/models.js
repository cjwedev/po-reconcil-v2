'use strict';

var config = require('../config');
var path = require('path');
var emailTemplates = require('email-templates');
var Mailgun = require('mailgun-js');
var htmlToText = require('nodemailer-html-to-text').htmlToText;

var templatesDir = path.resolve(__dirname, '..', 'views/mailer');
var EmailAddressRequiredError = new Error('email address required');

exports.sendOne = function (templateName, locals, fn) {
  // make sure that we have an user email
  if (!locals.to) {
    return fn(EmailAddressRequiredError);
  }
  // make sure that we have a message
  if (!locals.subject) {
    return fn(EmailAddressRequiredError);
  }

  emailTemplates(templatesDir, function (err, template) {
    if (err) {
      return fn(err);
    }

    // Send a single email
    template(templateName, locals, function (err, html, text) {
      if (err) {
        return fn(err);
      }
      // if we are testing don't send out an email instead return
      // success and the html and txt strings for inspection
      if (process.env.NODE_ENV === 'test') {
        return fn(null, '250 2.0.0 OK 1350452502 s5sm19782310obo.10', html, text);
      }

      // create a defaultTransport using Mailgun API
      var mailgunInstance = new Mailgun({
        apiKey: config.mailer.apiKey,
        domain: config.mailer.domain
      });

      var data = {
        from: locals.from,
        to: locals.to,
        subject: locals.subject,
        html: html
      };

      mailgunInstance.messages().send(data, function (error, body) {
        if (error) {
          console.log(error);
          return fn(err);
        } else {
          console.log(body)
          return fn(null, body, html, '');
        }
      });
    });
  });
}
