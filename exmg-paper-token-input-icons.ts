import '@polymer/iron-iconset-svg/iron-iconset-svg.js';
const documentContainer = document.createElement('div');
documentContainer.setAttribute('style', 'display: none;');

documentContainer.innerHTML = `<iron-iconset-svg name="exmg-paper-token-input-icons" size="24">
<svg>
  <defs>
    <g id="arrow-drop-down"><path d="M7 10l5 5 5-5z"></path></g>
    <g id="clear"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></g>
  </defs>
</svg>
</iron-iconset-svg>`;

document.head.appendChild(documentContainer);
