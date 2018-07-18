import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-menu-button/paper-menu-button.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/iron-input/iron-input.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-input/paper-input-error.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-input/paper-input-container.js';
import '@polymer/paper-styles/paper-styles.js';
import './exmg-paper-token-input-icons.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';

const BACKSPACE = 8;
const ARROWDOWN = 40;
/**
 * `exmg-paper-token-input` is an paper style token input element"
 *
 * Example:
 * ```html
 * <exmg-paper-token-input always-float-label attr-for-selected="name" selected-values='[400,800]'>
 *   <paper-item name="200">Item 200</paper-item>
 *   <paper-item name="400">Item 400</paper-item>
 *   <paper-item name="600">Item 600</paper-item>
 *   <paper-item name="800">Item 800</paper-item>
 *   <paper-item name="1000">Item 1000</paper-item>
 * </exmg-paper-token-input>
 * ```
 *
 * ### Styling
 * The following custom properties and mixins are available for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--exmg-paper-token-input-badge-color` | Menu background color | `--primary-color`
 * `--exmg-paper-token-input-badge-text-color` | Menu foreground color | `white`
 *
 * @customElement
 * @polymer
 * @group Exmg Paper Elements
 * @element exmg-paper-token-input
 * @demo demo/index.html
 * @memberof Exmg
 * @extends Polymer.Element
 * @summary Token input
 */
class TokenInputElement extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
          @apply --layout-horizontal;
        }

        paper-input-container {
          @apply --layout-flex;
        }

        .tokens {
          margin-right: 6px;
          min-height: 24px;
          position: relative;
          width: 100%;
        }

        .tokens paper-button {
          background: var(--exmg-paper-token-input-badge-color, var(--primary-color));
          margin: 2px 0;
          color: var(--exmg-paper-token-input-badge-text-color, white);
          height: 18px;
          font-size: 12px;
          min-width: initial;
          max-width: 100%
        }

        .tokens paper-button span {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .tokens paper-button iron-icon {
          height: 16px;
          width: 16px;
        }

        #inputValue {
          font: inherit;
          outline: none;
          box-shadow: none;
          background: transparent;
          border: none;
          width: auto;
          max-width: 100%;
          min-width: 1.8em;
        }

        paper-menu-button {
          padding: 8px 0;
        }
        paper-icon-button {
          margin: 8px 0;
        }

        .container {
          @apply --layout-flex;
        }
      </style>

      <paper-input-container always-float-label="[[_computeAlwaysFloatLabel(selectedItems.*, alwaysFloatLabel)]]" on-tap="_handleContainerTap" disabled\$="[[disabled]]" focused="{{inputFocused}}" invalid="[[invalid]]">

        <label slot="label" hidden\$="[[!label]]" aria-hidden="true">[[label]]</label>

        <div slot="input" class="paper-input-input" bind-value="{{_inputValue}}">
          <span class="tokens">
            <template is="dom-repeat" items="[[_tokens]]" as="token">
              <paper-button tabindex="-1" on-tap="_handleDeleteToken">
                <span>[[token.text]]</span><iron-icon icon="exmg-paper-token-input-icons:clear"></iron-icon>
              </paper-button>
            </template>
            <iron-input bind-value="{{_inputValue}}">
              <input id="inputValue" aria-labelledby="label" value="{{_inputValue::input}}" autofocus\$="[[autofocus]]" autocomplete="off" disabled\$="[[disabled]]">
            </iron-input>
          </span>
        </div>

        <template is="dom-if" if="[[errorMessage]]">
          <paper-input-error slot="add-on" aria-live="assertive">[[errorMessage]]</paper-input-error>
        </template>
      </paper-input-container>

      <span id="inputWidthHelper">[[_inputValue]]</span>

      <paper-menu-button close-on-activate="" opened="{{opened}}" vertical-offset="60" horizontal-align="right" restore-focus-on-close="" disabled\$="[[disabled]]">
        <paper-icon-button icon="exmg-paper-token-input-icons:arrow-drop-down" data-opened\$="[[opened]]" slot="dropdown-trigger"></paper-icon-button>
        <paper-listbox id="listbox" selectable="paper-item:not([hidden]),paper-icon-item:not([hidden])" attr-for-selected="{{attrForSelected}}" slot="dropdown-content" selected-items="{{selectedItems}}" selected-values="{{selectedValues}}" on-iron-select="_handleAddToken" on-iron-deselect="_resetInput" multi="">
          <slot></slot>
        </paper-listbox>
      

    </paper-menu-button>
  `;
  }

  static get is() {
    return 'exmg-paper-token-input';
  }

  /**
  * Fired when an item is selected
  *
  * @event iron-select
  */

  /**
  * Fired when an item is deselected
  *
  * @event iron-deselect
  */

  static get properties() {
    return {
      /**
       * If you want to use an attribute value or property of an element for
       * `selected` instead of the index, set this to the name of the attribute
       * or property. Hyphenated values are converted to camel case when used to
       * look up the property of a selectable element. Camel cased values are
       * *not* converted to hyphenated values for attribute lookup. It's
       * recommended that you provide the hyphenated form of the name so that
       * selection works in both cases. (Use `attr-or-property-name` instead of
       * `attrOrPropertyName`.)
       */
      attrForSelected: {
        type: String,
        value: null
      },

      /**
       * By default the textContent of the paper-item/paper-icon-item or paper-item-body
       * will be used for display in badge after selection. In case of icon and body
       * you probably want an alternative. The selector can be used to be a bit more
       * specific on which element can be used for display purposes.
       */
      selectedItemSelector: {
        type: String,
        value: null
      },

      /**
      * Returns an array of currently selected items.
      */
      selectedItems: {
        type: Array,
        notify: true,
      },

      /**
      * Gets or sets the selected elements.
      */
      selectedValues: {
        type: Array,
        notify: true,
      },
      /**
      * The label for this input.
      */
      label: String,

      /**
       * Set to true to auto-validate the input value.
       */
      autoValidate: {
        type: Boolean,
        value: false
      },

      autofocus: {
        type: Boolean
      },

      /**
      * Set to true to disable this input.
      */
      disabled: {
        type: Boolean,
        value: false
      },

      /**
      * The error message to display when the input is invalid.
      */
      errorMessage: {
        type: String
      },

      /**
      * alwaysFloatLabel
      */
      alwaysFloatLabel: {
        type: Boolean,
        value: false
      },

      /**
      * Maximum number of tokens allowed in value
      */
      maxTokens: {
        type: Number
      },

      /**
       * Set to true to mark the input as required. If you're using PaperInputBehavior to
       * implement your own paper-input-like element, bind this to
       * the `<input is="iron-input">`'s `required` property.
       */
      required: {
        type: Boolean,
        value: false
      },

      /**
      * This field will be bind to the actual input field
      */
      _inputValue: {
        type: String,
      },

      _tokens: {
        type: Array,
        value: () => [],
      },

      invalid: {
        type: Boolean,
      },

      inputFocused: {
        type: Boolean,
      }
    };
  }
  static get observers() {
    return [
      '_observeInputChange(_inputValue)',
      '_observeSelectedItems(selectedItems.*)',
    ];
  }
  constructor() {
    super();
    this._boundKeyDown = this._handleKeyDown.bind(this);
    this._boundOutsideClick = this._handleClick.bind(this);
  }

  /**
   * Returns the index of the given item.
   *
   * @method indexOf
   * @param {Object} item
   * @returns Returns the index of the item
   */
  indexOf(item) {
    return this.$.listbox.items ? this.$.listbox.items.indexOf(item) : -1;
  }
  _handleClick(e) {
    const inside = e.path.find((path) => path === this);
    // Detect outside element click for auto validate input
    if (this.autoValidate && !inside && this.previousInsideClick) {
      this.validate();
    }
    this.previousInsideClick = inside;
  }
  _observeSelectedItems(c) {
    this.set('_tokens', this.selectedItems.map((si) => {
      const id = this.attrForSelected ? si.getAttribute(this.attrForSelected) : this.indexOf(si);
      const text = this.selectedItemSelector ? si.querySelector(this.selectedItemSelector).textContent
        : si.textContent;
      return {id, text};
    }));
  }
  _observeInputChange() {
    this.$.inputValue.style.width = (this.$.inputWidthHelper.offsetWidth + 10) + 'px';
    this._filterItems();
  }
  _filterItems() {
    const items = this.querySelectorAll('paper-item');
    for (var i = 0; i < items.length; i++) {
      if (this._inputValue.length > 0 && items[i].textContent.indexOf(this._inputValue) === -1) {
        items[i].setAttribute('hidden', '');
      } else {
        items[i].removeAttribute('hidden');
      }
    }
  }
  connectedCallback() {
    super.connectedCallback();
    /* Initialize the input helper span element for determining the actual width of the input
      text. This width will be used to create a dynamic width on the input field */
    this.$.inputWidthHelper.style = window.getComputedStyle(this.$.inputValue, null).cssText;
    this.$.inputWidthHelper.style.position = 'absolute';
    this.$.inputWidthHelper.style.top = '-999px';
    this.$.inputWidthHelper.style.left = '0';
    this.$.inputWidthHelper.style.padding = '0';
    this.$.inputWidthHelper.style.width = 'auto';
    this.$.inputWidthHelper.style['white-space'] = 'pre';

    this.$.inputValue.addEventListener('keydown', this._boundKeyDown);
    if (this.autoValidate) {
      window.addEventListener('click', this._boundOutsideClick);
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.$.inputValue.removeEventListener('keydown', this._boundKeyDown);
    if (this.autoValidate) {
      window.removeEventListener('click', this._boundOutsideClick);
    }
  }
  _handleKeyDown(e) {
    this._inputValue = this._inputValue || '';
    switch (e.keyCode) {
      case BACKSPACE:
        this.splice('selectedValues', this.selectedValues.length - 1, 1);
        this.focus();
        break;
      case ARROWDOWN:
        this.opened = true;
        this.$.listbox.focus();
        break;
      default:
        this.opened = true;
        afterNextRender(this, _ => this.focus());
        break;
    }
  }
  _hasSelectedItems() {
    return this.selectedValues && this.selectedValues.length > 0;
  }
  _handleDeleteToken(e) {
    const i = Array.from(this.selectedValues).map(v => String(v)).indexOf(String(e.model.token.id));
    this.splice('selectedValues', i, 1);
    this.focus();
  }
  /**
   * this method can be used to set the focus of the element
   *
   * @method indexOf
   */
  focus() {
    this.$.inputValue.focus();
  }

  /**
   * This method will automaticly set the label float.
   */
  _computeAlwaysFloatLabel(selectedItemsChanges, alwaysFloatLabel) {
    if (alwaysFloatLabel) {
      return true;
    }
    return !(selectedItemsChanges.base !== undefined && selectedItemsChanges.base.length === 0
      && this.$.inputValue !== document.activeElement);
  }

  _handleContainerTap(e) {
    this.opened = true;
    afterNextRender(this, _ => this.focus());
  }

  _handleAddToken(e) {
    if (this.maxTokens && this.selectedItems.length > this.maxTokens) {
      e.stopPropagation();
      this.splice('selectedValues', this.selectedValues.length - 1, 1);
    }
    this._resetInput();
  }

  _resetInput() {
    if (this.autoValidate) {
      this.validate();
    }
    this._inputValue = '';
    this.focus();
  }

  /**
  * Returns true if `value` is valid.
  * @return {boolean} True if the value is valid.
  */
  validate() {
    this.invalid = this.required && !this._hasSelectedItems();
    return !this.invalid;
  }
}

window.customElements.define(TokenInputElement.is, TokenInputElement);