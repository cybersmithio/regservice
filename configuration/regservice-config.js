module.exports = {
    //Cookie secret used for session cookie
    cookieSecret: {
        development: "thisIsTheDevCookieSecret",
        production: "**********************************************************************",
    }
        mongo: {
                development: {
                        connectionString: 'mongodb://regservice:P4ssw0rd!@mongodev:27017/regservice',
                },
                production: {
                        connectionString: 'mongodb://mongousername:mongopassword@mongodns:mongoport/mongoinstance',
                }
        },
        authProviders: {
            google: {
               development: {
                    /* TODO: Make sure nothing sensitive in here */
                    clientID: '**********************************************************************',
                    clientSecret: **********************************************************************,
               },
               production: {
                    /* TODO: Make sure nothing sensitive in here */
                    clientID: '**********************************************************************',
                    clientSecret: '**********************************************************************',
               }
            }
        }
}