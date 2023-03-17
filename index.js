// 正規表現
const enabled_rules = {
  alphanum: {
    regex: /[０-９Ａ-Ｚａ-ｚ]/g,
    hint: "英数字は半角で入力してください。",
  },
  fullwidth_parentheses: {
    regex: /[（）]/g,
    hint: "丸括弧は半角で入力し、括弧の外側に半角スペースを入れてください。",
  },
  fullwidth_colon: {
    regex: /[：；]/g,
    hint: "コロン、セミコロンは半角で入力し、後ろに半角スペースを入れてください。",
  },
  fullwidth_punctuation: {
    regex: /[．，]/g,
    hint: "日本語の文章の句読点としては全角の「。」「、」を使用してください。その他カンマ、ピリオドを使用する場合は原則として半角で入力してください。",
  },
  halfwidth_exclamation: {
    regex: /[!?]/g,
    hint: "感嘆符、疑問符は、日本語の文章につける場合は全角で入力してください。",
  },
  halfwidth_punctuation: {
    regex: /[｡､｢｣･]/g,
    hint: "半角が使われています。句読点、カギ括弧、中黒は全角で入力してください。",
  },
  fullwidth_space: {
    regex: /　/g,
    hint: "全角スペースが使われています。スペースは半角で入力してください。",
  },
  space_needed: {
    regex: /[\u3041-\u3096\u30A1-\u30FA々〇〻\u3400-\u9FFF\uF900-\uFAFF\uD840-\uD87F\uDC00-\uDFFF][a-zA-Z0-9!#-&*-/<-@\\^-~]|[a-zA-Z0-9!#-&*-/<-@\\^-~][\u3041-\u3096\u30A1-\u30FA々〇〻\u3400-\u9FFF\uF900-\uFAFF\uD840-\uD87F\uDC00-\uDFFF]/g,
    hint: "日本語の文字と英数字の間には、半角スペースを入れてください。"
  },
  quotes: {
    regex: /[\u3041-\u3096\u30A1-\u30FA々〇〻\u3400-\u9FFF\uF900-\uFAFF\uD840-\uD87F\uDC00-\uDFFF]["'\(\[].*["'\)\]]|["'\(\[].*["'\)\]][\u3041-\u3096\u30A1-\u30FA々〇〻\u3400-\u9FFF\uF900-\uFAFF\uD840-\uD87F\uDC00-\uDFFF]/g,
    hint: "半角の括弧や引用符を用いる場合は、引用符の外側に半角スペースを入れてください。"
  },
  colon_semicolon: {
    regex: /[\u3041-\u3096\u30A1-\u30FA々〇〻\u3400-\u9FFF\uF900-\uFAFF\uD840-\uD87F\uDC00-\uDFFF][:;][^\s]|[\u3041-\u3096\u30A1-\u30FA々〇〻\u3400-\u9FFF\uF900-\uFAFF\uD840-\uD87F\uDC00-\uDFFF]\s[:;]/g,
    hint: "コロン、セミコロンは原則として後ろに半角スペースを入れてください。数学記号やコード例として用いる場合はこの限りではありません。"
  },
  space_not_needed: {
    regex: /[\x01-\x7E] [「」！？、。～％・／]|[「」！？、。～％・／] [\x01-\x7E]/g,
    hint: "全角の記号 (句読点、カギ括弧、％、～など) と半角英数字の間には、スペースは入れないでください。"
  },
  space_not_needed_ja: {
    regex: /[^\x01-\x7E] [「」！？、。～％・／]|[「」！？、。～％・／] [^\x01-\x7E]|[^\x01-\x7E] [^\x01-\x7E]/g,
    hint: "日本語の間に半角スペースが入っています。必要なスペースかどうか確認してください。"
  },
  multiple_spaces: {
    regex: / {2,}/g,
    hint: "半角スペースが連続しています。必要なスペースかどうか確認してください。"
  },
  wrong_prolonged_mark: {
    regex: /[－—―]/g,
    hint: "長音記号とよく似た別の記号が使われています。意図した記号かどうか確認してください。"
  },
}

function checkText() {
  const input = document.getElementById("input-text").value;
  let stringToCheck = input;

  let suggestions = []

  for (let key in enabled_rules) {
    let matches = [...input.matchAll(enabled_rules[key].regex)];
    matches.forEach (match => {
      match.rule = key;
    })
    suggestions = suggestions.concat(matches)
  }

  // 検出された suggestions を index 順に並び替え
  suggestions.sort((a, b) => {
    return a.index - b.index;
  })

  let output = "";
  const notice = document.getElementById("output-notice");

  if (suggestions.length === 0) {
    notice.classList.add("visible");
  } else {
    notice.classList.remove("visible");
    // テキストの後ろから処理、ハイライト用の要素を追加していく
    for (let i = suggestions.length - 1; i >= 0; i--) {
      let suggestion = suggestions[i];

      // 検出された index から末尾までの文字を処理対象として切り出す
      let target = stringToCheck.slice(suggestion.index);
      // 先頭から検出された index から末尾までの文字を未処理として残す
      stringToCheck = stringToCheck.slice(0, suggestion.index);
      // ユーザーが入力した HTML タグと区別して扱うために、仮タグを入力
      let result = target.replace(suggestion[0], `[[[spanstart]]]${suggestion.rule}[[[spanend]]]$&[[[spanclose]]]`);
      output = result + output;
    }
  }

  // 残りの部分を連結する
  output = stringToCheck + output;

  // ユーザーが入力した HTML タグをサニタイズ
  output = output.replace(/</g, "&lt;");
  output = output.replace(/>/g, "&gt;");
  output = output.replace(/ /g, "&nbsp;");
  output = output.replace(/"/g, "&quot;");

  // こちらで追加した仮タグを HTML タグにする
  output = output.replaceAll("[[[spanstart]]]", '<span class="highlight tooltip" data-tooltip-type="');
  output = output.replaceAll("[[[spanend]]]", '">');
  output = output.replaceAll("[[[spanclose]]]", '</span>');

  // 改行文字を HTML タグにする
  output = output.replace(/\n/g, "<br>");
  document.getElementById("output-text").innerHTML = output;
  enableTooltip();
}

function enableTooltip() {
  const tooltipElems = document.querySelectorAll('.tooltip');

  tooltipElems.forEach(elem => {
    elem.addEventListener('mouseover', () => {
      const tooltipType = elem.dataset.tooltipType;
      const tooltip = document.createElement('div');
      tooltip.classList.add('tooltip-box');
      tooltip.textContent = enabled_rules[tooltipType]["hint"];
      elem.appendChild(tooltip);
    });

    elem.addEventListener('mouseout', () => {
      const tooltip = document.querySelector('.tooltip-box');
      tooltip.parentNode.removeChild(tooltip);
    });
  });
}

