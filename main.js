const ROOT_ID = 'root';
// const textSymbol = Symbol("TEXT"); // figo
const TEXTKEY = "TEXT_TEXT";

let VIRTUAL_DOM = {
  rootComponent: {
    tag: 'div',
    compNum: 0,
    children: {
        // [TEXTKEY]: "app root content"
    },
    cssClasses: ['test'],
    rebuild: false,
  },
};

function renderDom(virtualDom, forceRerender = false) {
  let updatedDom = {};
  Object.keys(virtualDom).forEach((componentName) => {
    const component = virtualDom[componentName];
    if (forceRerender || component.rebuild) substitueView(componentName, component);
    updatedDom[componentName] = {
      ...component,
      rebuild: false,
    };
  });
  return updatedDom;
}

function substitueView(componentName, { tag, children, compNum, cssClasses }) {
  const id = componentName + '_' + compNum;
  const compView = document.createElement(tag);
  compView.setAttribute('id', id);
  if (!!cssClasses.length) compView.classList.add([...cssClasses]);
  document.getElementById(id).replaceWith(compView);
}

(function () {
  VIRTUAL_DOM = renderDom(VIRTUAL_DOM, true);
})();
