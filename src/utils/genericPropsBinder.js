/* vim: set softtabstop=2 shiftwidth=2 expandtab : */

const _ = require('lodash');
const assert = require('assert');

export default (vueElement, googleMapsElement, props, options) => {
  options = options || {};
  var {afterModelChanged} = options;
  _.forEach(props, ({twoWay, type, trackProperties}, attribute) => {
    const eventName = attribute.toLowerCase() + '_changed';
    const initialValue = vueElement[attribute];

    assert(googleMapsElement['set'], `set is not a method of (the Maps object corresponding to) ${vueElement.$options._componentTag}`);
    assert(googleMapsElement['get'], `get is not a method of (the Maps object corresponding to) ${vueElement.$options._componentTag}`);

    // We need to avoid an endless
    // propChanged -> event emitted -> propChanged -> event emitted loop
    // although this may really be the user's responsibility
    var timesSet = 0;
    if (type !== Object || !trackProperties) {
      // Track the object deeply
      vueElement.$watch(attribute, () => {
        const attributeValue = vueElement[attribute];

        timesSet++;
        googleMapsElement.set(attribute, attributeValue);
        if (afterModelChanged) {
          afterModelChanged(attribute, attributeValue);
        }
      }, {
        immediate: typeof initialValue !== 'undefined',
        deep: type === Object
      });
    } else if (type === Object && trackProperties) {
      // I can watch multiple properties, but the danger is that each of
      // them triggers the event handler multiple times
      // This ensures that the event handler will only be fired once
      let tick = 0, expectedTick = 0;

      const raiseExpectation = () => {
        expectedTick += 1
      }

      const updateTick = () => {
        tick = Math.max(expectedTick, tick + 1)
      }

      const respondToChange = () => {
        if (tick < expectedTick) {
          googleMapsElement.set(attribute, vueElement[attribute]);

          if (afterModelChanged) {
            afterModelChanged(attribute, attributeValue);
          }

          updateTick()
        }
      }

      trackProperties.forEach(propName => {
        // When any props change -- assume they change on the same tick
        vueElement.$watch(`${attribute}.${propName}`, () => {
          raiseExpectation();
          vueElement.$nextTick(respondToChange);
        }, {
          immediate: typeof initialValue !== 'undefined',
        });
      });
    }

    if (twoWay) {
      googleMapsElement.addListener(eventName, (ev) => { // eslint-disable-line no-unused-vars
        /* Check for type === Object because we're quite happy
         when primitive types change -- the change detection is cheap
         */
        if (type === Object && timesSet > 0) {
          timesSet --;
          return;
        }
        else {
          vueElement.$emit(eventName, googleMapsElement.get(attribute));
        }
      });
    }
  });
};
