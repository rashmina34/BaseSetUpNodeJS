((routeHelper) => {
    'use strict';

    routeHelper.init = (app) => {
        const loginRoute = require('../modules/login/routes');
        app.use('/api/login', loginRoute);

        const errorRoute = require('../modules/errorlogs/routes')
        app.use('/api/', errorRoute);

        const logoutRoute = require('../modules/logout/routes');
        app.use('/api/logout', logoutRoute);

        const userRoute = require("./../modules/user/routes");
        app.use("/api/user", userRoute);

        const UserRole = require('../modules/roles/routes');
        app.use('/api/userRoles', UserRole);

        const verifyEmail = require('../modules/user/routes');
        app.use('/', verifyEmail);

    };

})(module.exports);