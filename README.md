# exmg-paper-token-input

Paper style token input element. Please visit the [API Documentation and demo](http://exmgelements.github.io/exmg-paper-token-input/) page for more information.

## Usage

By default the textContent of the paper-item will be used as the visual selection in the badge. The
selected value will contain the item index.

```html
<exmg-paper-token-input label="Select User">
  <paper-item>Rubin</paper-item>
  <paper-item>Gennie</paper-item>
  ...
</exmg-paper-token-input>
```

In the following example the users id will be used as selection value instead of the item index.

```html
<exmg-paper-token-input label="Select Users" always-float-label attr-for-selected="data-id" selected-values='[9512]'>
  <paper-item data-id="4337">Rubin</paper-item>
  <paper-item data-id="7534">Gennie</paper-item>
  ...
</exmg-paper-token-input>
```

## Development

First, make sure you have the [Polymer CLI](https://www.npmjs.com/package/polymer-cli) installed. Then run polymer server to launch the demo page.

```
$ polymer serve
```
