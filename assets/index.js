var input

function ASCData(ascString) {
  function ASCVariable(name, charIndex, lineIndex) {
    const getType = () => name.includes('(') && name.includes(')')
    const getName = () => name.replace(/\(.*/, '')

    this.name = getName()
    this.isArray = getType()
    this.isUsed = false
    this.charIndexStart = charIndex
    this.charIndexEnd = charIndex + this.name.length
    this.lineIndex = lineIndex
  }

  function extractVariables(ascLines) {
    const res = []

    for (let i = 0; i < ascLines.length; i++) {
      const varMatch = ascLines[i].match(/^Variable[ \t]*:[ \t]*/i)

      if (varMatch) {
        const precedingCharCount = varMatch[0].length

        const varLine = ascLines[i]
          .substring(precedingCharCount)
          .replace('/##.*/', '')

        console.log(varLine)

        const matches = varLine.matchAll(/[A-Z0-9().*]+/gi);

        for (const match of matches) {
          res.push(new ASCVariable(match[0], precedingCharCount + match.index, i))
        }
      }
    }
    return res
  }

  this.ascLines = ascString.split(/\r\n/);
  this.variables = extractVariables(this.ascLines)
}

function loadFile() {
  const content = document.querySelector(".content");
  const [file] = document.querySelector("input[type=file]").files;
  const reader = new FileReader();

  reader.addEventListener("load", () => {
    input = reader.result;
    content.innerText = input;
  }, false,);

  if (file) { reader.readAsText(file) }
}


async function saveFile() {
  try {
    // create a new handle
    const newHandle = await window.showSaveFilePicker();

    // create a FileSystemWritableFileStream to write to
    const writableStream = await newHandle.createWritable();

    // write our file
    await writableStream.write(input.join('\r\n'));

    // close the file and write the contents to disk.
    await writableStream.close();
  } catch (err) {
    console.error(err.name, err.message);
  }
}

function removeUnusedVariables(ascLines, variables) {
  variables.forEach(variable => {
    for (let i = variable.index; i < ascLines.length; i++) {
      if (ascLines[i].toLowerCase().match(`[(*\/+-, \t=]${variable.name.toLowerCase()}[${variable.isArray ? '(' : ')'})*\/+-, \t=]`)) {
        variable.isUsed = true
      }
    }
  });
}

function formatSource() {

  const ascData = new ASCData(input)
  removeUnusedVariables(ascData.ascLines, ascData.variables)
  console.log(ascData.variables)
}