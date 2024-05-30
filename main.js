/**
 * Launch different rendering methods according to component type
 * @param {Object} virtualDom
 * @param {boolean} forceRerender
 * @param {HTMLElement} fatherViewRef
 * @param {Object} fatherScope
 */
function renderDom(virtualDom, forceRerender = false, fatherViewRef, fatherScope) {
  Object.keys(virtualDom).forEach((componentName) => {
    const type = virtualDom[componentName].type;
    switch (type) {
      case TYPEZ.TEXT:
        renderPlainText(virtualDom, componentName, fatherViewRef, forceRerender);
        break;
      case TYPEZ.HTML:
        renderHtmlElement(virtualDom, componentName, fatherViewRef, forceRerender);
        break;
      case TYPEZ.STATE:
        renderState(virtualDom, componentName, fatherViewRef, fatherScope, forceRerender);
        break;
      default:
        renderComponent(virtualDom, componentName, fatherViewRef, forceRerender);
        break;
    }
  });
}
/**
 *  Renders a text content
 * @param {Object} virtualDom
 * @param {String} componentName
 * @param {Html} fatherViewRef
 */
function renderPlainText(virtualDom, componentName, fatherViewRef, reRender) {
  if (reRender) {
    console.info('TEXT RENDERING -> ' + virtualDom[componentName].txt);
    fatherViewRef.textContent = virtualDom[componentName].txt;
  } else {
    console.info('TEXT RENDERING -> ' + virtualDom[componentName].txt + ' nothing to do');
  }
}
/**
 * Renders a state
 * State is treated as a component because is between children
 * @param {Object} virtualDom
 * @param {String} componentName
 * @param {HTMLElement} fatherViewRef
 * @param {Object} scope
 */
function renderState(virtualDom, componentName, fatherViewRef, scope, reRender) {
  const { name } = virtualDom[componentName];
  if (!reRender) {
    console.info('STATE RENDERING -> ' + name + ' nothing to do');
    return;
  }
  if (!!!scope) return;
  console.info('STATE RENDERING -> ' + name);
  if (!scope[name]) throw new Error('Missing scope state');
  fatherViewRef.textContent = scope[name].value;
}
/**
 * Renders plain html according to reRender prop
 * @param {Object} virtualDom
 * @param {String} componentName
 * @param {HTMLElement} fatherViewRef
 * @param {boolean} reRender
 */
function renderHtmlElement(virtualDom, componentName, fatherViewRef, reRender) {
  const { tag, cssClasses, children, actions = null, scope } = virtualDom[componentName];
  let componentView;
  if (reRender) {
    componentView = createHtmlElement(tag, cssClasses, actions, scope, componentName);
    appendView(fatherViewRef, componentView);
    console.info('HTML RENDERING -> ' + tag + ' rebuilt');
  } else {
    componentView = document.getElementById(componentName);
    console.info('HTML RENDERING -> ' + tag + ' no changes detected');
  }
  recursiveRender(children, reRender, componentView, scope);
}
/**
 * Renders a component only if forceRerender is true
 * or the rebuild flag is true
 * @param {Object} virtualDom
 * @param {String} componentName
 * @param {HTMLElement} fatherViewRef
 * @param {boolean} forceRerender
 */
function renderComponent(virtualDom, componentName, fatherViewRef, forceRerender) {
  const {
    rebuild,
    tag,
    cssClasses,
    children,
    actions = null,
    scope = {},
  } = virtualDom[componentName];
  const redrawView = forceRerender || rebuild;
  let componentView;
  if (redrawView) {
    virtualDom[componentName].rebuild = false;
    componentView = createHtmlElement(tag, cssClasses, actions, scope, componentName);
    appendView(fatherViewRef, componentView, rebuild && componentName);
    console.info('COMPONENT RENDERING -> ' + componentName + ' rebuilt');
  } else {
    componentView = document.getElementById(componentName);
    console.info('COMPONENT RENDERING -> ' + componentName + ' no changes detected');
  }
  recursiveRender(children, redrawView, componentView, scope);
}
/**
 *
 * @param {String} tag
 * @param {String[]} cssClasses
 * @param {{type: ACTION_TYPEZ, fn: Function}[]} actions
 * @param {{[key: string]: {type: SCOPE_TYPEZ, value: any}}} scope
 * @param {String} id
 * @returns {HTMLElement}
 */
function createHtmlElement(tag, cssClasses, actions, scope = {}, id = null) {
  const newView = document.createElement(tag);
  if (!!actions && actions.length)
    actions.forEach((action) => addActionToTemplate(newView, action, scope));
  if (!!cssClasses.length) newView.classList.add([...cssClasses]);
  if (id) newView.setAttribute('id', id);
  return newView;
}

// TODO
// rimuovere la roba scope con il this (deve essere una const tipo singleton)
// a ogni azione creare un nuovo virtual dom o simile
// diffing e update del vecchio
/**
 * Binds actions to template according to type event
 * @param {HTMLElement} template
 * @param {{type: ACTION_TYPEZ, fn: Function}} action
 * @param {{[key: string]: {type: SCOPE_TYPEZ, value: any}}} scope
 */
function addActionToTemplate(template, action, scope) {
  let { type, fn } = action;
  fn = fn.bind(formatScope(scope));
  switch (type) {
    case ACTION_TYPEZ.CLICK:
      template.addEventListener('click', fn);
      break;
    default:
      break;
  }
}
/**
 * Format the scope to bind it to the action
 * @param {{[key: string]: {type: SCOPE_TYPEZ, value: any}}} scope
 * @returns {Object}
 */
function formatScope(oldScope) {
  return Object.keys(oldScope).reduce((updatedScope, actualKey) => {
    if (oldScope[actualKey].type === SCOPE_TYPEZ.STATE) {
      return {
        ...updatedScope,
        ['_' + actualKey]: oldScope[actualKey].value,
        get [actualKey]() {
          return this['_' + actualKey];
        },
        set [actualKey](newValue) {
          this['_' + actualKey] = newValue;
          // updateVirtualDom(VIRTUAL_DOM);
          renderDom(VIRTUAL_DOM, false, document.getElementById(ROOT_ID));
        },
      };
    }
    return { ...updatedScope };
  }, {});
}

/**
 * Appends or replace updated view
 * @param {HTMLElement} fatherViewRef
 * @param {HTMLElement} newView
 * @param {String} componentName
 */
function appendView(fatherViewRef, newView, componentName) {
  if (!!componentName) fatherViewRef.getElementById(componentName).replaceWith(newView);
  else fatherViewRef.appendChild(newView);
}
/**
 * Recursive render according to children presence
 * @param {Object[]} children
 * @param {boolean} rebuild
 * @param {HTMLTemplateElement} newView
 * @param {{[key: string]: {type: SCOPE_TYPEZ, value: any}}} fatherScope
 */
function recursiveRender(children, rebuild, newView, fatherScope) {
  if (!!Object.keys(children)) renderDom(children, rebuild, newView, fatherScope);
}

function updateVirtualDom(VIRTUAL_DOM) {
  for (componentKey in VIRTUAL_DOM) {
    console.log(componentKey);
  }
}
