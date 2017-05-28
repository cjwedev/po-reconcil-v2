var config = module.exports;

if (process.env.NODE_ENV == 'production') {
  config.express = {
    port_num: 3000
  };

  config.mailer = {
    apiKey: 'key-67b85bc6ddae4b5ff6ff11569e3d034d',
    domain: 'aamedicalstore.com',
    defaultFromAddress: 'PO Conciliation <no-reply@aamedicalstore.com>'
  };
} else {
  config.express = {
    port_num: 3000
  };

  config.mailer = {
    apiKey: 'key-67b85bc6ddae4b5ff6ff11569e3d034d',
    domain: 'aamedicalstore.com',
    defaultFromAddress: 'PO Conciliation <no-reply@aamedicalstore.com>'
  };
}
