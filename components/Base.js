class Base extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({
      mode: "open",
    });
  }

  resetStyles() {
    this.shadowRoot.innerHTML = `
      <style>
        * {
          box-sizing: border-box;
        }
      </style>
    `;
  }
}
