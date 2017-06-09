'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _propsBinder = require('../utils/propsBinder.js');

var _propsBinder2 = _interopRequireDefault(_propsBinder);

var _genericPropsBinder = require('../utils/genericPropsBinder.js');

var _genericPropsBinder2 = _interopRequireDefault(_genericPropsBinder);

var _getPropsValuesMixin = require('../utils/getPropsValuesMixin.js');

var _getPropsValuesMixin2 = _interopRequireDefault(_getPropsValuesMixin);

var _mapElementMixin = require('./mapElementMixin');

var _mapElementMixin2 = _interopRequireDefault(_mapElementMixin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var props = {
  data: {
    twoWay: true,
    type: Array
  },
  options: {
    twoWay: true,
    type: Object,
    default: function _default() {
      return {};
    }
  },
  opacity: {
    twoWay: true,
    type: Number
  },
  radius: {
    twoWay: true,
    type: Number
  },
  gradient: {
    twoWay: true,
    type: Array
  },
  maxIntensity: {
    twoWay: true,
    type: Number
  },
  dissipating: {
    twoWay: true,
    type: Boolean
  }
};

/**
 * @class Marker
 *
 * HeatMap Visualization class
 */
exports.default = {
  mixins: [_mapElementMixin2.default, _getPropsValuesMixin2.default],
  props: props,

  render: function render(h) {
    if (!this.$slots.default || this.$slots.default.length == 0) {
      return '';
    } else if (this.$slots.default.length == 1) {
      // So that infowindows can have a marker parent
      return this.$slots.default[0];
    } else {
      return h('div', this.$slots.default);
    }
  },
  destroyed: function destroyed() {
    if (!this.$markerObject) return;

    if (this.$clusterObject) {
      this.$clusterObject.removeMarker(this.$markerObject);
    } else {
      this.$markerObject.setMap(null);
    }
  },
  deferredReady: function deferredReady() {
    var _this = this;

    var options = _lodash2.default.mapValues(props, function (value, prop) {
      return _this[prop];
    });
    options.map = this.$map;

    // search ancestors for cluster object
    var search = this.$findAncestor(function (ans) {
      return ans.$clusterObject;
    });

    this.$clusterObject = search ? search.$clusterObject : null;
    this.createMarker(options);
  },


  methods: {
    createMarker: function createMarker(options) {
      this.$markerObject = new google.maps.visualization.HeatmapLayer(options);
      (0, _genericPropsBinder2.default)(this, this.$markerObject, _lodash2.default.pick(props, ['opacity', 'radius', 'gradient', 'maxIntensity', 'dissipating']));
      (0, _propsBinder2.default)(this, this.$markerObject, _lodash2.default.pick(props, ['data']));
      if (this.$clusterObject) {
        this.$clusterObject.addMarker(this.$markerObject);
      }
    }
  }
};