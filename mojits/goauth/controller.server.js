/*
 * Copyright (c) 2012 Yahoo! Inc. All rights reserved.
 */
/*jslint anon:true, sloppy:true, nomen:true*/
YUI.add('goauth', function(Y, NAME) {

/**
 * The goauth module.
 *
 * @module goauth
 */

    /**
     * Constructor for the Controller class.
     *
     * @class Controller
     * @constructor
     */
    Y.namespace('mojito.controllers')[NAME] = {

        init: function(config) {
            this.config = config;
        },

        /**
         * Method corresponding to the 'index' action.
         *
         * @param ac {Object} The ActionContext that provides access
         *        to the Mojito API.
         */
        index: function(ac) {
            ac.models.goauthModelFoo.getData(function(err, data) {
                if (err) {
                    ac.error(err);
                    return;
                }
                ac.assets.addCss('./index.css');
                ac.done({
                    status: 'Mojito is working.',
                    data: data
                });
            });
        },
        login: function(ac) {
            ac.goauth.redirect(function() {
                return;
            });
        },
        google_cb: function(ac) {
            console.log(ac.params);
            ac.goauth.callback({"x": 1}, function(result, err) {
                ac.done(result, 'json');
            });
        },
        google_done: function(ac) {
            ac.goauth.test(function(err, result) {
                ac.done(result, 'json');
            });
        }

    };

}, '0.0.1', {requires: ['mojito', 'goauthModelFoo', 'session-addon', 'goauth-addon']});
