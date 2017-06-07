import _ from 'lodash';
import propsBinder from '../utils/propsBinder.js';
import getPropsValuesMixin from '../utils/getPropsValuesMixin.js';
import MapElementMixin from './mapElementMixin';

const props = {
  data: {
    twoWay: true,
    type: Array
  },
  options: {
    twoWay: true,
    type: Object,
    default() {
      return {};
    }
  }
};

/**
 * @class Marker
 *
 * HeatMap Visualization class
 */
export default {
  mixins: [MapElementMixin, getPropsValuesMixin],
  props: props,

  render(h) {
    if (!this.$slots.default || this.$slots.default.length == 0) {
      return '';
    } else if (this.$slots.default.length == 1) { // So that infowindows can have a marker parent
      return this.$slots.default[0];
    } else {
      return h(
        'div',
        this.$slots.default
      );
    }
  },

  destroyed() {
    if (!this.$markerObject)
      return;

    if (this.$clusterObject) {
      this.$clusterObject.removeMarker(this.$markerObject);
    }
    else {
      this.$markerObject.setMap(null);
    }
  },

  deferredReady() {
    const options = _.mapValues(props, (value, prop) => this[prop]);
    options.map = this.$map;

    // search ancestors for cluster object
    let search = this.$findAncestor(
      ans => ans.$clusterObject
    );

    this.$clusterObject = search ? search.$clusterObject : null;
    this.createMarker(options);
  },

  methods: {
    createMarker (options) {
      this.$markerObject = new google.maps.visualization.HeatmapLayer(options);
      propsBinder(this, this.$markerObject, props);
      if (this.$clusterObject) {
        this.$clusterObject.addMarker(this.$markerObject);
      }
    }
  },
};
