import {PaperTokenInputElement} from '../exmg-paper-token-input';
import {promisifyFlush, onExmgTokenInputDeselected, onExmgTokenInputSelected} from './utils';

declare const fixture: <T extends HTMLElement = HTMLElement>(id: string, model?: object) => T;
declare const flush: (cb?: Function) => void;

const {assert} = chai;

suite('<exmg-paper-token-input>', function () {
  let element: PaperTokenInputElement;
  const flushCompleted = promisifyFlush(flush);

  suite('base usage', function () {
    setup(() => {
      element = fixture('ExmgPaperTokenInputBasicElement');
    });

    test('element is upgraded', function () {
      assert.instanceOf(element, PaperTokenInputElement);
    });

    test('setting label on element sets the Label value', async () => {
      const elementShadowRoot = element.shadowRoot!;
      element.label = 'foobar';
      await flushCompleted();

      const labelValue = elementShadowRoot.querySelector('label')!.innerText;
      assert.equal(labelValue, 'foobar', 'Label is set properly');
    });
  });

  suite('element with children', function () {
    setup(() => {
      element = fixture('ExmgPaperTokenInputList');
    });

    test('element has label', async () => {
      element = fixture('ExmgPaperTokenInputList');
      const elementShadowRoot = element.shadowRoot!;
      await flushCompleted();

      const labelValue = elementShadowRoot.querySelector('label')!.innerText;
      assert.equal(labelValue, 'Select Users', 'Label is set properly');
    });

    test('element has list of element when adding children', async () => {
      element = fixture('ExmgPaperTokenInputList');
      const elementShadowRoot = element.shadowRoot!;
      await flushCompleted();

      const listBox = elementShadowRoot.querySelector('paper-listbox');
      assert.isArray(listBox!.items, 'Should be an array');
      assert.equal((listBox!.items || []).length, 10, 'Length should be 10 elements');
    });
  });

  suite('element with children and selection', function () {
    setup(() => {
      element = fixture('ExmgPaperTokenInputListWithSelection');
    });

    test('element has selected value', async () => {
      const elementShadowRoot = element.shadowRoot!;
      await flushCompleted();

      const listBox = elementShadowRoot.querySelector('paper-listbox')!;
      const expectedSelectedItemText = 'Beatris';
      const expectedSelectedItemValue = '9512';
      assert.isNotNull(listBox.selectedValues, 'Should be an array');
      assert.equal(listBox.selectedValues![0], expectedSelectedItemValue);
      assert.lengthOf(listBox.selectedItems!, 1);
      assert.equal(listBox.selectedItems![0].innerText, expectedSelectedItemText, 'Selected item should match with item text');
      const paperButton = elementShadowRoot.querySelector('paper-button')!;
      assert.equal(paperButton.innerText, expectedSelectedItemText.toUpperCase(), 'Button token should match with item text');
    });

    test('element should trigger event exmg-token-input-select', async () => {
      const elementShadowRoot = element.shadowRoot!;
      await flushCompleted();
      const listBox = elementShadowRoot.querySelector('paper-listbox');

      let eventPromise = onExmgTokenInputSelected(element);
      listBox!.select('7534');
      const event = await eventPromise;
      assert.instanceOf(event, CustomEvent);
      assert.equal(event.detail.value, '7534', 'Should be triggered event with initial value');

      eventPromise = onExmgTokenInputSelected(element);
      listBox!.select('1212');

      const {detail: {value, item}} = await eventPromise;
      assert.equal(value, '1212', 'Should be triggered event with new selection');

      const expectedSelectedItemText = 'Jacquie';
      assert.instanceOf(item, HTMLElement, 'Selected item should be HTMLElement');
      assert.equal(item.innerText, expectedSelectedItemText, 'Should match item text');
      assert.equal(item.getAttribute('data-id'), '1212');
    });

    test('element should trigger event exmg-token-input-deselect', async () => {
      const elementShadowRoot = element.shadowRoot!;
      await flushCompleted();
      const listBox = elementShadowRoot.querySelector('paper-listbox');

      const eventPromise = onExmgTokenInputDeselected(element);
      listBox!.select('9512');

      const {detail: {value, item}} = await eventPromise;
      assert.equal(value, '9512', 'Should be triggered event with new selection');

      const expectedSelectedItemText = 'Beatris';
      assert.instanceOf(item, HTMLElement, 'Selected item should be HTMLElement');
      assert.equal(item.innerText, expectedSelectedItemText, 'Should match item text');
      assert.equal(item.getAttribute('data-id'), '9512');
    });

    test('element should trigger event exmg-token-input-deselect when backspace and delete key down', async () => {
      await flushCompleted();
      const inputElement = element.shadowRoot!.querySelector('input')!;
      const keyCodes = ['Backspace', 'Esc'];
      keyCodes.forEach(async (code: string) => {
        const eventPromise = onExmgTokenInputDeselected(element);
        inputElement.dispatchEvent(new KeyboardEvent('keydown', {code, bubbles: true, composed: true}));

        const {detail: {value, item}} = await eventPromise;
        assert.equal(value, '9512', 'Should be triggered event with new selection');

        const expectedSelectedItemText = 'Beatris';
        assert.instanceOf(item, HTMLElement, 'Selected item should be HTMLElement');
        assert.equal(item.innerText, expectedSelectedItemText, 'Should match item text');
        assert.equal(item.getAttribute('data-id'), '9512');
      });
    });
  });

  suite('element should follow required constraint', function () {
    const makeElementTouched = async (targetElement: HTMLElement): Promise<void> => {
      targetElement.click();
      targetElement.parentElement!.click();
      await flushCompleted();
    };

    setup(() => {
      element = fixture('ExmgPaperTokenInputRequired');
    });

    test('element is required', async () => {
      chai.assert.isTrue(element.required, 'Should be required');
      chai.assert.isFalse(element.invalid, 'Should be valid when not touched');
    });

    test('element should be invalid with error message when touch', async () => {
      element.validate();
      await flushCompleted();
      chai.assert.isTrue(element.invalid, 'Should be invalid');
      const inputError = element.shadowRoot!.querySelector('paper-input-error')!;
      chai.assert.equal(inputError.innerText, 'Input required', 'Error message is visible');
    });

    test('element should became valid after selection', async () => {
      await flushCompleted(); // wait for event listeners
      await makeElementTouched(element);

      chai.assert.isTrue(element.invalid, 'Should be invalid');

      const elementShadowRoot = element.shadowRoot!;
      const listBox = elementShadowRoot.querySelector('paper-listbox');

      const eventPromise = onExmgTokenInputSelected(element);
      listBox!.select('0');

      await eventPromise;

      chai.assert.isFalse(element.invalid, 'Should be valid');
      const inputError = element.shadowRoot!.querySelector('paper-input-error')!;
      chai.assert.equal(inputError.innerText, '', 'Error message is not visible');
    });

    test('element with auto-validate off should not be invalid', async () => {
      element.autoValidate = false;
      await flushCompleted();
      await makeElementTouched(element);

      chai.assert.isFalse(element.invalid, 'State should be valid because not auto-validate option');
      element.validate();
      chai.assert.isTrue(element.invalid, 'Should be invalid when manually validated');
      const inputError = element.shadowRoot!.querySelector('paper-input-error')!;
      chai.assert.equal(inputError.innerText, '', 'Error message is not visible');
    });

    suite('element is disabled', function () {
      setup(() => {
        element = fixture('ExmgPaperTokenInputDisabled');
      });

      test('element has disabled input', async () => {
        await flushCompleted();

        const elementShadowRoot = element.shadowRoot!;
        const paperContainer = <HTMLInputElement>elementShadowRoot.querySelector('#inputValue')!;
        const menuContainer = <HTMLInputElement>elementShadowRoot.querySelector('#menu')!;
        chai.assert.isTrue(element.disabled, 'Should be true');
        chai.assert.isTrue(paperContainer.disabled, 'Should be true');
        chai.assert.isTrue(menuContainer.disabled, 'Should be true');
      });
    });
  });
});
