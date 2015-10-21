/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Watch for page refreshes.
 *
 * Listen for `show-view` and `show-sub-view` messages and check if the user
 * has refreshed the page. If so, a `<view_name>.refresh` event is
 * logged to metrics.
 */

define([
  'backbone',
  'lib/storage'
], function (Backbone, Storage) {
  'use strict';

  function isRefresh (refreshMetrics, screenName) {
    return refreshMetrics && refreshMetrics.view === screenName;
  }

  return Backbone.Model.extend({
    initialize: function (options) {
      options = options || {};

      this._metrics = options.metrics;
      this._notifications = options.notifications;
      this._window = options.window || window;

      this._storage = Storage.factory('sessionStorage', this._window);

      this._notifications.on('show-view', this._onShowView.bind(this));
      this._notifications.on('show-sub-view', this._onShowSubView.bind(this));
    },

    _onShowView: function (View, viewOptions) {
      this.logIfRefresh(viewOptions.screenName);
    },

    _onShowSubView: function (SubView, ParentView, viewOptions) {
      this.logIfRefresh(viewOptions.screenName);
    },

    /**
     * Log a `<screen_name>.refresh` event if `screenName` matches the
     * previous screen name. This works across page reloads.
     *
     * @param {string} screenName
     */
    logIfRefresh: function (screenName) {
      var refreshMetrics = this._storage.get('last_page_loaded');

      if (isRefresh(refreshMetrics, screenName)) {
        this._metrics.logScreenEvent(screenName, 'refresh');
      }

      refreshMetrics = {
        timestamp: Date.now(),
        view: screenName
      };

      this._storage.set('last_page_loaded', refreshMetrics);
    }
  });
});