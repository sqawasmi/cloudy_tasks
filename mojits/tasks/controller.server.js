/*
 * Copyright (c) 2012 Yahoo! Inc. All rights reserved.
 */
/*jslint anon:true, sloppy:true, nomen:true*/
YUI.add('tasks', function(Y, NAME) {

/**
 * The tasks module.
 *
 * @module tasks
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
            this.gList = '';
        },

        /**
         * Method corresponding to the 'index' action.
         *
         * @param ac {Object} The ActionContext that provides access
         *        to the Mojito API.
         */
        index: function(ac) {
            ac.models.tasksModelFoo.getData(function(err, data) {
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
        getList: function(ac) {
            url = 'https://www.googleapis.com/tasks/v1/users/@me/lists';
            ac.goauth.getContent(url, function(err, result) {
                console.log(result);
                for (var item in result.items) {
                    console.log(result.items[item].title);
                }
                ac.done({'done': 'success'}, 'json');
            });
        }

    };

}, '0.0.1', {requires: ['mojito', 'tasksModelFoo', 'goauth-addon']});
