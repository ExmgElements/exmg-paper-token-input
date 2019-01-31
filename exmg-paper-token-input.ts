import {customElement, html, LitElement, property, PropertyValues, query} from 'lit-element';
import '@polymer/paper-menu-button/paper-menu-button.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/iron-input/iron-input.js';
import '@polymer/paper-input/paper-input-error.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-input/paper-input-container.js';
import '@polymer/paper-styles/paper-styles.js';
import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';
import './exmg-paper-token-input-icons';
import {PaperMenuButton} from '@polymer/paper-menu-button/paper-menu-button';
import {PaperListboxElement} from '@polymer/paper-listbox/paper-listbox';

const BACKSPACE = 8;
const ESCAPE = 27;
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
 */
@customElement('exmg-paper-token-input')
export class TokenInputElement extends LitElement {
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
  @property({type: String, attribute: 'attr-for-selected'})
  public attrForSelected?: string;

  /**
   * By default the textContent of the paper-item/paper-icon-item or paper-item-body
   * will be used for display in badge after selection. In case of icon and body
   * you probably want an alternative. The selector can be used to be a bit more
   * specific on which element can be used for display purposes.
   */
  @property({type: String, attribute: 'selected-item-selector'})
  public selectedItemSelector?: string;

  /**
   * Gets or sets the selected elements.
   */
  @property({type: Array, attribute: 'selected-values'})
  public selectedValues: any[] = []; // @todo migrate notify: true

  /**
   * The label for this input.
   */
  @property({type: String})
  public label?: string;

  /**
   * Set to true to auto-validate the input value.
   */
  @property({type: Boolean, attribute: 'auto-validate'})
  public autoValidate: boolean = false;

  @property({type: Boolean})
  public autofocus: boolean = false;

  /**
   * Set to true to disable this input.
   */
  @property({type: Boolean})
  public disabled: boolean = false;

  /**
   * The error message to display when the input is invalid.
   */
  @property({type: String, attribute: 'error-message'})
  public errorMessage?: string;

  /**
   * alwaysFloatLabel
   */
  @property({type: Boolean})
  public alwaysFloatLabel: boolean = false;

  /**
   * Maximum number of tokens allowed in value
   */
  @property({type: Number, attribute: 'max-tokens'})
  public maxTokens?: number;

  /**
   * Set to true to mark the input as required. If you're using PaperInputBehavior to
   * implement your own paper-input-like element, bind this to
   * the `<input is="iron-input">`'s `required` property.
   */
  @property({type: Boolean})
  public required: boolean = false;

  /**
   * This field will be bind to the actual input field
   */
  @property({type: String})
  private inputValue: string = '';

  @property({type: Boolean})
  public invalid: boolean = false;

  @property({type: Boolean})
  public inputFocused: boolean = false;

  @property({type: Boolean})
  private opened: boolean = false;

  @property({type: Array})
  private selectedItems: any[] = []; // migrate notify: true

  @property({type: Object})
  private listBoxNodeItemsHashMap: any = {};

  @query('#listbox')
  private listBoxNode?: PaperListboxElement;

  @query('#inputValue')
  private inputValueNode?: HTMLInputElement;

  @query('#inputWidthHelper')
  private inputWidthHelperNode?: HTMLElement;

  @query('#menu')
  private menuElement?: PaperMenuButton;

  constructor() {
    super();
    this.onIronInputKeyDown = this.onIronInputKeyDown.bind(this);
    this.onIronInputValueChanged = this.onIronInputValueChanged.bind(this);
    this.onWindowClick = this.onWindowClick.bind(this);
    this.onPaperListBoxItemSelect = this.onPaperListBoxItemSelect.bind(this);
    this.onPaperListBoxItemDeselect = this.onPaperListBoxItemDeselect.bind(this);
    this.onInputContainerTap = this.onInputContainerTap.bind(this);
    this.onInputContainerButtonTap = this.onInputContainerButtonTap.bind(this);
    this.onPaperMenuVisibilityChanged = this.onPaperMenuVisibilityChanged.bind(this);

    this.resetInput = this.resetInput.bind(this);
    this.computeAlwaysFloatLabel = this.computeAlwaysFloatLabel.bind(this);
  }

  /**
   * Returns the index of the given item.
   *
   * @method indexOf
   * @param {Object} item
   * @returns Returns the index of the item
   */
  indexOf(item: HTMLElement): number {
    return this.listBoxNode!.items ? (this.listBoxNode!.items || []).indexOf(item) : -1;
  }

  //////////////////
  /// EVENT HANDLERS
  //////////////////

  private previousClickWasInside: boolean = false;

  private onWindowClick(e: MouseEvent): void {
    const isInsideClick = !!e.composedPath().find((path) => path === this);

    if (this.autoValidate && !isInsideClick && this.previousClickWasInside) {
      this.validate();
    }

    this.previousClickWasInside = isInsideClick;
  }

  private onIronInputKeyDown(e: KeyboardEvent): void {
    switch (e.keyCode) {
      case BACKSPACE:
        this.selectedValues.splice(this.selectedValues.length - 1, 1);
        this.requestUpdate();
        this.focus();
        break;
      case ARROWDOWN:
        this.menuElement!.open();
        this.listBoxNode!.focus();
        break;
      case ESCAPE:
        break;
      default:
        this.menuElement!.open();
        afterNextRender(this, _ => this.focus());
        break;
    }
  }

  private onIronInputValueChanged(e: Event): void {
    this.inputValue = (<HTMLInputElement>e.target).value || '';
    this.inputValueNode!.style.width = `${this.inputWidthHelperNode!.offsetWidth + 10}px`;
    this.filterItems();
  }

  private onPaperMenuVisibilityChanged(e: CustomEvent): void {
    this.opened = e.detail.value;
  }

  private onInputContainerButtonTap(value: any): () => void {
    return () => {
      this.selectedValues.splice(this.selectedValues.indexOf(value), 1);
      this.focus();
    };
  }

  private onInputContainerTap(e: Event): void {
    e.preventDefault();
    this.menuElement!.open();
    afterNextRender(this, _ => this.focus());
  }

  private onPaperListBoxItemSelect(e: CustomEvent): void {
    if (this.maxTokens && this.selectedValues.length >= this.maxTokens) {
      e.stopPropagation();
    } else {
      const value = this.getPaperItemValue(e.detail.item);

      if (this.selectedValues.indexOf(value) === -1) {
        this.selectedValues.push(value);
        this.emitItemSelectEvent(value);
        this.requestUpdate();
      }
    }

    this.resetInput();
  }

  private onPaperListBoxItemDeselect(e: CustomEvent): void {
    console.log('onPaperListBoxItemDeselect');
    const value = this.getPaperItemValue(e.detail.item);

    if (this.selectedValues.indexOf(value) !== -1) {
      this.selectedValues.splice(this.selectedValues.indexOf(value), 1);
      this.emitItemDeselectEvent(value);
    }

    this.resetInput();
  }

  /////////////////////////
  /// END OF EVENT HANDLERS
  /////////////////////////

  private filterItems() {
    const items = this.querySelectorAll('paper-item');

    for (let i = 0; i < items.length; i = i + 1) {
      if (this.inputValue.length > 0 && (items[i].textContent || '').toLowerCase().indexOf(this.inputValue.toLowerCase()) === -1) {
        items[i].setAttribute('hidden', '');
      } else {
        items[i].removeAttribute('hidden');
      }
    }
  }

  private getPaperItemValue(item: HTMLElement): number|string|undefined {
    return this.attrForSelected ? item.getAttribute(this.attrForSelected) || undefined : this.indexOf(item);
  }

  public focus(): void {
    this.inputValueNode!.focus();
  }

  private emitItemSelectEvent(value: any): void {
    this.dispatchEvent(new CustomEvent('value-select', {
      detail: value,
      bubbles: true,
      composed: true,
    }));
  }

  private emitItemDeselectEvent(value: any): void {
    this.dispatchEvent(new CustomEvent('value-deselect', {
      detail: value,
      bubbles: true,
      composed: true,
    }));
  }

  /**
   * This method will automatically set the label float.
   */
  private computeAlwaysFloatLabel(selectedItems, alwaysFloatLabel) {
    if (alwaysFloatLabel) {
      return true;
    }
    return !(selectedItems !== undefined && selectedItems.length === 0
      && this.inputValueNode !== document.activeElement);

    // return !(selectedItemsChanges.base !== undefined && selectedItemsChanges.base.length === 0
    //   && this.inputValueNode !== document.activeElement);
  }

  private resetInput(): void {
    this.menuElement!.close();

    if (this.autoValidate) {
      this.validate();
    }

    this.inputValue = '';
    this.filterItems();
    this.focus();
  }

  private validate(): void {
    console.log(this.required, this.selectedValues, this.selectedValues.length > 0);
    this.invalid = this.required && !this.hasSelectedValues();
  }

  private hasSelectedValues(): boolean {
    return this.selectedValues && this.selectedValues.length > 0;
  }

  /////////////////////////
  /// LIT ELEMENT LIFECYCLE
  /////////////////////////

  public connectedCallback(): void {
    super.connectedCallback();

    const intervalForListBoxNode = setInterval(() => {
      if (this.listBoxNode) {
        clearInterval(intervalForListBoxNode);

        const listBoxNodeItems: { value: any; displayValue: any }[] = (this.listBoxNode.items || []).map((item: HTMLElement) => {
          return {
            value: this.getPaperItemValue(item),
            displayValue: this.selectedItemSelector ? item.querySelector(this.selectedItemSelector)!.textContent : item.textContent,
          };
        }).filter((value: any) => typeof value !== "undefined");

        const listBoxNodeItemValues = listBoxNodeItems.map((item) => item.value);

        const itemsHashMap: any = {};
        listBoxNodeItems.forEach((item) => {
          itemsHashMap[item.value] = item.displayValue;
        });
        this.listBoxNodeItemsHashMap = itemsHashMap;

        this.selectedValues.forEach((selectedValue: any) => {
          /**
           * @todo
           */
          // this.listBoxNode!.selectIndex(listBoxNodeItemValues.indexOf(selectedValue));
        });
      }
    });
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();

    this.inputValueNode!.removeEventListener('keydown', this.onIronInputKeyDown);

    if (this.autoValidate) {
      window.removeEventListener('click', this.onWindowClick);
    }
  }

  protected update(changedProperties: PropertyValues): void {
    if (changedProperties.has('selectedValues') && this.attrForSelected) {
      console.log('update', this.selectedValues, changedProperties.get('selectedValues'));
      this.selectedValues = this.selectedValues.map(value => value.toString());
    }

    super.update(changedProperties);
  }

  protected firstUpdated(): void {
    this.inputValueNode!.addEventListener('keydown', this.onIronInputKeyDown);

    if (this.inputWidthHelperNode) {
      this.inputWidthHelperNode.style.cssText = window.getComputedStyle(this.inputValueNode!, null).cssText;
      this.inputWidthHelperNode.style.position = 'absolute';
      this.inputWidthHelperNode.style.top = '-999px';
      this.inputWidthHelperNode.style.left = '0';
      this.inputWidthHelperNode.style.padding = '0';
      this.inputWidthHelperNode.style.width = 'auto';
      this.inputWidthHelperNode.style.whiteSpace = 'pre';
    }

    if (this.autoValidate) {
      window.addEventListener('click', this.onWindowClick);
    }
  }

  protected render() {
    // console.log(this.listBoxNodeItemsHashMap);
    console.log('this.invalid', this.invalid);
    return html`
      <!--suppress CssUnresolvedCustomPropertySet, CssUnresolvedCustomProperty -->
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

      <paper-input-container
        always-float-label="${this.computeAlwaysFloatLabel(this.selectedItems, this.alwaysFloatLabel)}"
        @tap=${this.onInputContainerTap}
        ?disabled="${this.disabled}"
        ?focused="${this.inputFocused}"
        ?invalid="${this.invalid}"
      >
        <label slot="label" ?hidden="${!this.label}" aria-hidden="${!this.label}">${this.label}</label>

        <div slot="input" class="paper-input-input" bind-value="${this.inputValue}">
          <span class="tokens">
            ${
                this.selectedValues.map((value) => {
                  return html`
                    <paper-button tabindex="-1" @tap="${this.onInputContainerButtonTap(value)}">
                      <span>${this.listBoxNodeItemsHashMap[value]}</span>
                      <iron-icon icon="exmg-paper-token-input-icons:clear"></iron-icon>
                    </paper-button>
                  `;
                })
            }
            <iron-input bind-value="${this.inputValue}">
              <input
                id="inputValue"
                aria-labelledby="label"
                value="${this.inputValue}"
                @input="${this.onIronInputValueChanged}"
                ?autofocus="${this.autofocus}"
                autocomplete="off"
                ?disabled="${this.disabled}"
              >
            </iron-input>
          </span>
        </div>

        ${ this.errorMessage ? html`<paper-input-error slot="add-on" aria-live="assertive">${this.errorMessage}</paper-input-error>` : '' }
      </paper-input-container>

      <span id="inputWidthHelper">${this.inputValue}</span>

      <paper-menu-button
        id="menu"
        close-on-activate
        ?opened="${this.opened}"
        @opened-changed="${this.onPaperMenuVisibilityChanged}"
        vertical-offset="60"
        horizontal-align="right"
        restore-focus-on-close=""
        ?disabled="${this.disabled}"
      >
        <paper-icon-button
            icon="exmg-paper-token-input-icons:arrow-drop-down"
            ?data-opened="${this.opened}"
            slot="dropdown-trigger"
        ></paper-icon-button>
        <paper-listbox
          id="listbox"
          attr-for-selected="${this.attrForSelected || ''}"
          selectable="paper-item:not([hidden]),paper-icon-item:not([hidden])"
          .selectedValues="${[...this.selectedValues]}"
          slot="dropdown-content"
          @iron-select="${this.onPaperListBoxItemSelect}"
          @iron-deselect="${this.onPaperListBoxItemDeselect}"
          multi
        >
          <slot></slot>
        </paper-listbox>
      </paper-menu-button>
  `;
  }
}
