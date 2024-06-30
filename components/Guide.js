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
      contents: guideContents['please-draw'],
    };

    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  setContent (contents) {
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
      </style>

      <div id='container'>
        <input type='text' value='${this.state.contents.en}'>
        <input type='text' value='${this.state.contents.ko}'>
      </div>
    `;

    this.addEvents();
  }

  addEvents () {
    const inputs = this.shadowRoot.querySelectorAll('input');

    inputs.forEach(input => {
      console.log(input.value)
      const inputValue = splitKoreanIntoGraphemes(input.value);

      console.log(inputValue)

      input.value = '';

      input.style.visibility = 'visible';

      function renderInputValue (value, charIndex) {
        if (charIndex === value.length) return;

        const currentSlice = value.slice(0, charIndex)

        console.log(currentSlice)

        input.value = currentSlice.join('');

        renderInputValue(value, charIndex + 1)
      }

      renderInputValue(inputValue, 1);
    })
  }
}

function splitKoreanIntoGraphemes(str) {
  const result = [];

  let i = 0;
  while (i < str.length) {
    const char = str.charAt(i);
    const charCode = str.charCodeAt(i);

    if (charCode >= 0xAC00 && charCode <= 0xD7A3) {
      // 한글 음절인 경우
      let syllable = char;
      let nextCharCode = str.charCodeAt(i + 1);

      // 다음 문자도 한글이고 종성이 없는 경우 (이, 기, 그 등)
      if (nextCharCode >= 0xAC00 && nextCharCode <= 0xD7A3) {
        const nextSyllable = str.charAt(i + 1);
        const combinedSyllable = syllable + nextSyllable;
        const decomposed = decomposeHangul(combinedSyllable); // 음절을 음소(자모)로 분해하기
        result.push(...decomposed); // 분해된 음소(자모)를 결과 배열에 추가
        i += 2; // 다음 음절로 이동
      } else {
        // 종성이 있는 경우 또는 다음 문자가 한글이 아닌 경우
        const decomposed = decomposeHangul(syllable); // 음절을 음소(자모)로 분해하기
        result.push(...decomposed); // 분해된 음소(자모)를 결과 배열에 추가
        i++; // 다음 문자로 이동
      }
    } else {
      // 한글 음절이 아닌 경우 그대로 추가
      result.push(char);
      i++; // 다음 문자로 이동
    }
  }

  return result;
}

function decomposeHangul(syllable) {
  const result = [];
  const code = syllable.charCodeAt(0) - 0xAC00;

  const jongSung = code % 28; // 종성
  const jungSung = ((code - jongSung) / 28) % 21; // 중성
  const choSung = (((code - jongSung) / 28) - jungSung) / 21; // 초성

  if (choSung !== 0) {
    result.push(String.fromCharCode(0x1100 + choSung)); // 초성
  }

  result.push(String.fromCharCode(0x1161 + jungSung)); // 중성

  if (jongSung !== 0) {
    result.push(String.fromCharCode(0x11A7 + jongSung)); // 종성
  }

  return result;
}

customElements.define(
  'guide-component',
  GuideComponent
)
