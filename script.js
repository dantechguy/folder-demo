var newFileButton = document.querySelector('#new-file');
var saveButton = document.querySelector('#save-file');
var input = document.querySelector('input');
var unorderedlist = document.querySelector('ul');
var textarea = document.querySelector('textarea');

var pipeChars = {
    indent: '    ',
    connect: '│   ',
    child: '├── ',
    bottomChild: '└── ',
};

var files = {
    "sample": {
        "someitem": {
            "thesearecool": [
                {
                    "neat": "wow"
                },
                {
                    "neat": "tubular"
                }
            ]
        },
        "coolcolors": [     // because this is the last item, it think _all_ the tabs should have lines
            {
                "color":"red",
                "hex":  "ff0000"
            },
            {
                "color":"blue",
                "hex":"0000ff"
            }
        ]
    }
}
var previousInputValue = '';

newFileButton.onclick = function() {
  previousInputValue = '';
  input.value = '';
  textarea.value = '';
}

saveButton.onclick = function(event) {
  createJsonDirectory(files, input.value);
  updateJsonData(files, input.value, textarea.value);
  deleteJsonItem(files, previousInputValue);
  removeAllEmptyJsonObjects(files);
  previousInputValue = input.value;
  updateDomList(files, unorderedlist);
}

function liClicked(directory) {
  let splitDirectory = directory.split('/');
  let directoryBeforeItemPath = splitDirectory.slice(0, -1).join('/');
  let fileName = splitDirectory.slice(-1)[0];
  let fileData = searchJsonWithDirectory(files, directoryBeforeItemPath)[fileName];
  input.value = directory;
  textarea.value = fileData;
}

function deleteAllChildNodesFromDom(dom) {
  while (dom.firstChild) {
    dom.removeChild(dom.firstChild);
  };
}

function updateDomList(json, dom) {
  deleteAllChildNodesFromDom(dom);
  generateLiDomsIntoUl(json, dom);
}

function generateLiDomsIntoUl(json, dom, directory=[], indentList=[]) {
  let indentAmount = indentList.length;
  let allKeys = Object.keys(json);
  let tempDirectory;
  let tempList;
  for (let index=0; index<allKeys.length; index++) {
    let key = allKeys[index];
    let value = json[key];

    let valueIsJson = typeof(value) === 'object';
    let isAtBottom = index === allKeys.length-1;

    let liNode = document.createElement('li');
    // adds pipes
    let indentText = '';
    if (indentAmount > 0) {
      for (let indentIndex=0; indentIndex<indentAmount-1; indentIndex++) {
        let indentValue = indentList[indentIndex+1];
        if (indentValue) {indentText += pipeChars.indent;}
        else {indentText += pipeChars.connect;};
      };
      if (isAtBottom) {indentText += pipeChars.bottomChild;}
      else {indentText += pipeChars.child;};
    };

    let liText = indentText + key;
    // adds /
    if (valueIsJson) {
      liText += '/';
    };
    let liNodeText = document.createTextNode(liText);
    liNode.appendChild(liNodeText);
    if (valueIsJson) {
      liNode.setAttribute('class', 'folder');
    } else {
      let tempDirectory = directory.join('/') + '/' + key;
      liNode.setAttribute('class', 'clickable');
      liNode.setAttribute('onclick', 'liClicked(\'' + tempDirectory + '\');');
    };
    dom.appendChild(liNode);
    if (valueIsJson) {
      tempList = indentList.slice();
      tempList.push(isAtBottom);
      tempDirectory = directory.slice();
      tempDirectory.push(key);
      generateLiDomsIntoUl(value, dom, tempDirectory, tempList)
    };
  };
}

function deleteJsonItem(json, directory) {
  let directoryunorderedList = directory.split('/');
  let itemName = directoryunorderedList.slice(-1)[0];
  let directoryBeforeItemPath = directoryunorderedList.slice(0, -1).join('/');
  let directoryBeforeItemJson = searchJsonWithDirectory(json, directoryBeforeItemPath);
  delete directoryBeforeItemJson[itemName];
}

function updateJsonData(json, directory, data) {
  let directoryunorderedList = directory.split('/');
  let itemName = directoryunorderedList.slice(-1)[0];
  let directoryBeforeItemPath = directoryunorderedList.slice(0, -1).join('/');
  let directoryBeforeItemJson = searchJsonWithDirectory(json, directoryBeforeItemPath);
  directoryBeforeItemJson[itemName] = data;
}


function jsonIsEmpty(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object
}


function removeAllEmptyJsonObjects(json) {
  let AllKeys = Object.keys(json);
  for (let index=0; index<AllKeys.length; index++) {
    let key = AllKeys[index];
    let value = json[key];
    if (jsonIsEmpty(value)) {
      delete json[key];
    } else if (key === "") {
      delete json[key];
    } else if (typeof(value) === 'object') {
      removeAllEmptyJsonObjects(value);
    };
  };
}

function createJsonDirectory(json, directory) {
  // setup
  let directoryunorderedList = directory.split('/')
  for (let index=0; index<directoryunorderedList.length; index++) {
    let currentItemName = directoryunorderedList[index];

    // 1 - check if item exists
    let directoryBeforeItemPath = directoryunorderedList.slice(0, index).join('/');
    let directoryBeforeItemJson = searchJsonWithDirectory(json, directoryBeforeItemPath);
    let itemExists = directoryBeforeItemJson.hasOwnProperty(currentItemName);
    let itemDoesntExist = !itemExists;
    let item = directoryBeforeItemJson[currentItemName];

    // 2 - is it a json object
    let itemIsAString;
    if (itemExists) {
      itemIsAString = typeof(item) === "string";
    };

    // 3 - set index to empty json
    if (itemDoesntExist || itemIsAString) {
      directoryBeforeItemJson[currentItemName] = {};
    }

  }
}

function searchJsonWithDirectory(json, directory) {
  if (directory === "") {
    return json
  };
  let currentJson = json;
  let splitDirectory = directory.split('/');
  for (let index=0; index<splitDirectory.length; index++) {
    searchTerm = splitDirectory[index];
    currentJson = currentJson[searchTerm];
  };
  return currentJson;
}

function renameJson(obj, old_name, new_name) {
    if (obj.hasOwnProperty(old_name)) {
        obj[new_name] = obj[old_name];
        delete obj[old_name];
    }
};

updateDomList(files, unorderedlist);
