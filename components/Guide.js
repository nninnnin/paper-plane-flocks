const guideContents = {
  "no-support": {
    ko: "이 미디어는 데스크탑 화면 크기를 지원하지 않습니다.",
    en: "This media does not support desktop viewports",
  },
  "please-draw": {
    ko: "종이비행기들의 행로를 그려주세요.",
    en: "Draw the path of the paper planes.",
  },
};

class GuideComponent extends HTMLElement {
  constructor() {
    super();

    this.state = {
      contents: guideContents["please-draw"],
    };

    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  setContent(contents) {
    this.state.contents = contents;
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        #container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;

          height: 100vh;
          width: 100vw;

          position: fixed;
          top: 0;
          left: 0;
        }

        input {
          width: 100%;
          display: block;

          text-align: center;
          line-height: 1.5em;

          border: none;

          visibility: hidden;
        }

        @keyframes fadeout {
          0% {
            opacity: 1;
          }

          100% {
            opacity: 0;
          }
        }

        .fade-out {
          animation: fadeout 1.5s forwards;
          animation-delay: 1s;
        }
      </style>

      <div id='container'>
        <input type='text' value='${this.state.contents.en}'>
        <input type='text' value='${this.state.contents.ko}'>
      </div>
    `;

    this.addEvents();
  }

  async addEvents() {
    const inputs =
      this.shadowRoot.querySelectorAll("input");

    const results = await Promise.all(
      Array.from(inputs).map(async (input) => {
        const inputValue = Hangul.disassemble(
          input.value
        );

        input.value = "";

        input.style.visibility = "visible";

        function renderInputValue(
          value,
          charIndex,
          endCallback
        ) {
          if (charIndex > value.length) {
            endCallback();

            return true;
          }

          const currentSlice = value.slice(
            0,
            charIndex
          );

          input.value =
            Hangul.assemble(currentSlice);

          setTimeout(() => {
            renderInputValue(
              value,
              charIndex + 1,
              endCallback
            );
          }, 50);
        }

        return new Promise((resolve) => {
          renderInputValue(inputValue, 1, () => {
            resolve(true);
          });
        });
      })
    );

    console.log("end!", results);

    const isFinished = results.every(
      (result) => result
    );

    if (isFinished) {
      inputs.forEach((input) =>
        input.classList.add("fade-out")
      );

      setTimeout(() => {
        window.preventDraw = false;
      }, 2500);
    }
  }
}

customElements.define(
  "guide-component",
  GuideComponent
);
