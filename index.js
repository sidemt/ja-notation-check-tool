window.onhashchange = function () {
  focusClicked();
};

// Regex to detect incorrect notation
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
    regex:
      /[\u3041-\u3096\u30A1-\u30FA々〇〻\u3400-\u9FFF\uF900-\uFAFF\uD840-\uD87F\uDC00-\uDFFF][a-zA-Z0-9!#-&*-/<-@\\^-~]|[a-zA-Z0-9!#-&*-/<-@\\^-~][\u3041-\u3096\u30A1-\u30FA々〇〻\u3400-\u9FFF\uF900-\uFAFF\uD840-\uD87F\uDC00-\uDFFF]/g,
    hint: "日本語の文字と英数字の間には、半角スペースを入れてください。",
  },
  quotes: {
    regex:
      /[\u3041-\u3096\u30A1-\u30FA々〇〻\u3400-\u9FFF\uF900-\uFAFF\uD840-\uD87F\uDC00-\uDFFF][\(\[]|[\)\]][\u3041-\u3096\u30A1-\u30FA々〇〻\u3400-\u9FFF\uF900-\uFAFF\uD840-\uD87F\uDC00-\uDFFF]/g,
    hint: "半角の括弧や引用符で文字を囲む場合は、外側に半角スペースを入れてください。",
  },
  quotes_space_inside: {
    regex:
      /[\u3041-\u3096\u30A1-\u30FA々〇〻\u3400-\u9FFF\uF900-\uFAFF\uD840-\uD87F\uDC00-\uDFFF] [\)\]]|[\(\[] [\u3041-\u3096\u30A1-\u30FA々〇〻\u3400-\u9FFF\uF900-\uFAFF\uD840-\uD87F\uDC00-\uDFFF]/g,
    hint: "半角の括弧や引用符で文字を囲む場合は、原則として外側にだけ半角スペースを入れてください。",
  },
  quotes_space_around: {
    regex: / [\)\]"'] | [\(\["'] /g,
    hint: "半角の括弧や引用符で文字を囲む場合は、原則として外側にだけ半角スペースを入れてください。",
  },
  colon_semicolon: {
    regex:
      /[\u3041-\u3096\u30A1-\u30FA々〇〻\u3400-\u9FFF\uF900-\uFAFF\uD840-\uD87F\uDC00-\uDFFF][:;][^\s]|[\u3041-\u3096\u30A1-\u30FA々〇〻\u3400-\u9FFF\uF900-\uFAFF\uD840-\uD87F\uDC00-\uDFFF]\s[:;]/g,
    hint: "コロン、セミコロンは原則として後ろに半角スペースを入れてください。数学記号やコード例として用いる場合はこの限りではありません。",
  },
  space_not_needed: {
    regex:
      /[\x01-\x7E] [「」！？、。～％・／]|[「」！？、。～％・／] [\x01-\x7E]/g,
    hint: "全角の記号 (句読点、カギ括弧、％、～など) と半角英数字の間には、スペースは入れないでください。",
  },
  space_not_needed_ja: {
    // allow spaces around en dash
    regex:
      /[^\x01-\x7E–] [「」！？、。～％・／]|[「」！？、。～％・／] [^\x01-\x7E–]|[^\x01-\x7E–] [^\x01-\x7E–]/g,
    hint: "日本語の間に半角スペースが入っています。必要なスペースかどうか確認してください。",
  },
  multiple_spaces: {
    regex: / {2,}/g,
    hint: "半角スペースが連続しています。必要なスペースかどうか確認してください。",
  },
  wrong_prolonged_mark: {
    regex: /[－—―]/g,
    hint: "長音記号とよく似た別の記号が使われています。意図した記号かどうか確認してください。",
  },
};

function checkText() {
  const input = document.getElementById("input-text").value;
  let remainingString = input;

  let suggestions = [];

  for (let key in enabled_rules) {
    let matches = [...input.matchAll(enabled_rules[key].regex)];
    matches.forEach((match) => {
      match.rule = key;
    });
    suggestions = suggestions.concat(matches);
  }

  // Sort the matched suggestions by index
  suggestions.sort((a, b) => {
    return a.index - b.index;
  });

  let output = "";
  const notice = document.getElementById("output-notice");

  if (suggestions.length === 0) {
    notice.classList.add("visible");
  } else {
    notice.classList.remove("visible");
    // add tags to highlight the result, starting from the end of the input text
    for (let i = suggestions.length - 1; i >= 0; i--) {
      let suggestion = suggestions[i];

      // set the string from the index to the end as a target
      let target = remainingString.slice(suggestion.index);
      // keep the rest of the string, from the beginning to the index, as remaining
      remainingString = remainingString.slice(0, suggestion.index);
      // incert placeholder tags so that they can be distinguished from the HTML tags in the original user input
      let result = target.replace(
        suggestion[0],
        `[[[spanstart]]]${suggestion.index}[[[data-tooltip-type=]]]${suggestion.rule}[[[spanend]]]$&[[[spanclose]]]`
      );
      output = result + output;
    }
  }

  // concat the remaining part
  output = remainingString + output;

  // sanitize the HTML tags in the original user input
  output = sanitizeHTML(output);

  // convert placeholder tags to HTML tags
  output = output.replaceAll(
    "[[[spanstart]]]",
    '<span class="highlight tooltip" id="'
  );
  output = output.replaceAll(
    "[[[data-tooltip-type=]]]",
    '" data-tooltip-type="'
  );
  output = output.replaceAll("[[[spanend]]]", '">');
  output = output.replaceAll("[[[spanclose]]]", "</span>");

  // convert newline characters to HTML <br> tags
  output = output.replace(/\n/g, "<br>");
  document.getElementById("output-text").innerHTML = output;

  generateTable(suggestions);
  enableTooltip();
}

function sanitizeHTML(str) {
  str = str.replace(/</g, "&lt;");
  str = str.replace(/>/g, "&gt;");
  str = str.replace(/ /g, "&nbsp;");
  str = str.replace(/"/g, "&quot;");
  return str;
}

function generateTable(suggestions) {
  const tbody = document.querySelector("#result-tbody");

  // clear table
  tbody.innerHTML = "";

  // loop through suggestions and create tables rows
  suggestions.forEach((suggestion) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><a href="#${suggestion.index}"><span class="highlight">${sanitizeHTML(
      suggestion[0]
    )}</span></a></td>
      <td>${enabled_rules[suggestion.rule].hint}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Focus on the highlighted text when the user clicks on the table row
function focusClicked() {
  // clear current focus
  const alreadyFocused = document.querySelectorAll(".focus");
  if (alreadyFocused.length > 0) {
    alreadyFocused.forEach((elem) => {
      elem.classList.remove("focus");
    });
  }

  const urlHash = location.hash;
  if (urlHash) {
    const target = document.getElementById(urlHash.slice(1));
    target.classList.add("focus");
  }
}

function enableTooltip() {
  const tooltipElems = document.querySelectorAll(".tooltip");

  tooltipElems.forEach((elem) => {
    elem.addEventListener("mouseover", () => {
      const tooltipType = elem.dataset.tooltipType;
      const tooltip = document.createElement("div");
      tooltip.classList.add("tooltip-box");
      tooltip.textContent = enabled_rules[tooltipType]["hint"];
      elem.appendChild(tooltip);
    });

    elem.addEventListener("mouseout", () => {
      const tooltip = document.querySelector(".tooltip-box");
      tooltip.parentNode.removeChild(tooltip);
    });
  });
}
