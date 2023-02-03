import {property} from 'lit/decorators.js';

export const EspaModule = (superClass) => class EspaModule extends superClass {
  /**
   * Whether display module page or hide it.
   * @type {boolean}
   */
  @property({type: Boolean})
  displayed;

  /**
   * Parent route tail, can be used for module internal routing
   * @type {Object}
   */
  @property({type: Object, attribute: false})
  subRoute;

  /**
   * Get module name
   * @abstract
   * @return {string} Module name
   */
  getName() {}

  /**
   * Get module icon
   * @abstract
   * @return {string} Module icon
   */
  getIcon() {}

  /**
   * Get module route path
   * @abstract
   * @return {string} Module path
   */
  getRoutePath() {}
};