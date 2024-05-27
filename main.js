// const textSymbol = Symbol("TEXT"); // figo
const TEXT = 'TEXT_TEXT';
const HTML_ELEMENT = 'HTML_ELEMENT';
const ROOT_ID = 'rootComponent_0';
const TYPEZ = {
  COMPONENT: 'COMPONENT',
  TEXT: 'TEXT',
  HTML: 'HTML',
};

let VIRTUAL_DOM = {
  rootComponent_0: {
    tag: 'div',
    type: TYPEZ.COMPONENT,
    cssClasses: ['test'],
    rebuild: false,
    children: {
      [HTML_ELEMENT + 1]: {
        tag: 'h1',
        type: TYPEZ.HTML,
        cssClasses: ['title'],
        children: {
          [TEXT + 1]: {
            type: TYPEZ.TEXT,
            txt: 'This is a title',
          },
        },
      },
      navbar_0: {
        tag: 'nav',
        type: TYPEZ.COMPONENT,
        cssClasses: ['navbar'],
        rebuild: false,
        children: {
          [HTML_ELEMENT + 1]: {
            tag: 'ul',
            type: TYPEZ.HTML,
            cssClasses: [],
            children: {
              [HTML_ELEMENT + 1]: {
                tag: 'li',
                type: TYPEZ.HTML,
                cssClasses: [],
                children: {
                  [TEXT + 1]: {
                    type: TYPEZ.TEXT,
                    txt: 'home',
                  },
                },
              },
              [HTML_ELEMENT + 2]: {
                tag: 'li',
                type: TYPEZ.HTML,
                cssClasses: [],
                children: {
                  [TEXT + 2]: {
                    type: TYPEZ.TEXT,
                    txt: 'about',
                  },
                },
              },
              [HTML_ELEMENT + 3]: {
                tag: 'li',
                type: TYPEZ.HTML,
                cssClasses: [],
                children: {
                  [TEXT + 3]: {
                    type: TYPEZ.TEXT,
                    txt: 'contacts',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

function renderDom(virtualDom, forceRerender = false, fatherViewRef) {
  Object.keys(virtualDom).forEach((componentName) => {
    const type = virtualDom[componentName].type;
    switch (type) {
      case TYPEZ.TEXT:
        renderPlainText(virtualDom, componentName, fatherViewRef, forceRerender);
        break;
      case TYPEZ.HTML:
        renderHtmlElement(virtualDom, componentName, fatherViewRef, forceRerender);
        break;
      default:
        renderComponent(virtualDom, componentName, fatherViewRef, forceRerender);
        break;
    }
  });
}

function renderPlainText(virtualDom, componentName, fatherViewRef) {
  console.info('TEXT RENDERING -> ' + virtualDom[componentName]);
  fatherViewRef.textContent = virtualDom[componentName].txt;
}

function renderHtmlElement(virtualDom, componentName, fatherViewRef, forceRerender) {
  const { tag, cssClasses, children } = virtualDom[componentName];
  console.info('HTML RENDERING -> ' + tag);
  const newView = document.createElement(tag);
  if (!!cssClasses.length) {
    newView.classList.add([...cssClasses]);
  }
  fatherViewRef.appendChild(newView);
  if (!!Object.keys(children)) {
    renderDom(children, forceRerender, newView);
  }
}

function renderComponent(virtualDom, componentName, fatherViewRef, forceRerender) {
  const { rebuild, tag, cssClasses, children } = virtualDom[componentName];
  console.info('COMPONENT RENDERING -> ' + componentName);
  const newView = document.createElement(tag);
  newView.setAttribute('id', componentName);
  if (!!cssClasses.length) {
    newView.classList.add([...cssClasses]);
  }
  if (forceRerender) {
    fatherViewRef.appendChild(newView);
  } else if (rebuild) {
    fatherViewRef.getElementById(componentName).replaceWith(newView);
  }
  if (!!Object.keys(children)) {
    renderDom(children, forceRerender || rebuild, newView);
  }
  virtualDom[componentName].rebuild = false;
}

(function () {
  renderDom(VIRTUAL_DOM, true, document.getElementById(ROOT_ID));
})();
