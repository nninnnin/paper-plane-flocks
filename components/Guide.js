const guideContents = {
  "no-support": {
    ko: "이 미디어는 데스크탑 화면 크기를 지원하지 않습니다.",
    en: "This media does not support desktop viewports",
  },
  "1-0": {
    ko: "반가워요! PAPER PLANE FLOCKS에 오신 것을 \n 환영합니다.",
    en: "Welcome to PPF!",
  },
  "2-1": {
    ko: "삐딱한 분이시네요.",
    en: "What's wrong with you?",
  },
  "3-0": {
    ko: "종이비행기들의 행로를 그려주세요.",
    en: "Draw the path of the paper planes.",
  },
};

class GuideComponent extends Base {
  constructor() {
    super();

    this.state = {
      contents: guideContents["1-0"],
    };
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.resetStyles();

    this.shadowRoot.innerHTML += `
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

        .text-wrapper {
          width: 100%;
          display: block;

          text-align: center;
          line-height: 1.5em;

          border: none;

          visibility: hidden;

          padding: 0 10%;
          word-break: keep-all;

          position: relative;
        }

        .touch-icon {
          width: 16px;
          height: 16px;

          position: absolute;
          right: 0;
          bottom: 0;

          transform: translate(-100%, 100%);
          margin-left: auto;
      }
        }
      </style>

      <div id='container'>
        <div class='text-wrapper'>${this.state.contents.en}</div>
        <div class='text-wrapper'>${this.state.contents.ko}</div>
      </div>
    `;

    this.addEvents();
  }

  async addEvents() {
    const wrappers =
      this.shadowRoot.querySelectorAll(
        ".text-wrapper"
      );

    const results = await Promise.all(
      Array.from(wrappers).map(
        async (wrapper) => {
          const inputValue = Hangul.disassemble(
            wrapper.innerHTML
          );

          wrapper.innerHTML = "";

          wrapper.style.visibility = "visible";

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

            wrapper.innerHTML =
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
            renderInputValue(
              inputValue,
              1,
              () => {
                resolve(true);
              }
            );
          });
        }
      )
    );

    console.log("end!", results);

    const isFinished = results.every(
      (result) => result
    );

    if (isFinished) {
      // inputs.forEach((input) =>
      //   input.classList.add("fade-out")
      // );

      this.allowInteract();

      // setTimeout(() => {
      //   window.preventDraw = false;
      // }, 2500);
    }
  }

  allowInteract() {
    const wrappers =
      this.shadowRoot.querySelectorAll(
        ".text-wrapper"
      );
    const lastWrapper =
      wrappers[wrappers.length - 1];

    console.log(lastWrapper);

    const image = new Image();
    image.src = "/icons/touch--white.svg";
    image.classList.add("touch-icon");

    lastWrapper.appendChild(image);
  }

  setContent(contents) {
    this.state.contents = contents;
    this.render();
  }
}

customElements.define(
  "guide-component",
  GuideComponent
);
