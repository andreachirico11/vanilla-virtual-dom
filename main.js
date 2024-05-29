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
        renderPlainText(virtualDom, componentName, fatherViewRef);
        break;
      case TYPEZ.HTML:
        renderHtmlElement(virtualDom, componentName, fatherViewRef, forceRerender);
        break;
      case TYPEZ.STATE:
        renderState(virtualDom, componentName, fatherViewRef, fatherScope);
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
function renderPlainText(virtualDom, componentName, fatherViewRef) {
  console.info('TEXT RENDERING -> ' + virtualDom[componentName].txt);
  fatherViewRef.textContent = virtualDom[componentName].txt;
}
/**
 * Renders a state
 * State is treated as a component because is between children
 * @param {Object} virtualDom
 * @param {String} componentName
 * @param {HTMLElement} fatherViewRef
 * @param {Object} scope
 */
function renderState(virtualDom, componentName, fatherViewRef, scope) {
  if (!!!scope) return;
  const { name } = virtualDom[componentName];
  console.info('STATE RENDERING -> ' + name);
  if (!scope[name]) throw new Error('Missing scope state');
  fatherViewRef.textContent = scope[name].value;
}
/**
 * Renders plain html
 * @param {Object} virtualDom
 * @param {String} componentName
 * @param {HTMLElement} fatherViewRef
 * @param {boolean} forceRerender
 */
function renderHtmlElement(virtualDom, componentName, fatherViewRef, forceRerender) {
  const { tag, cssClasses, children, actions = null, scope } = virtualDom[componentName];
  console.info('HTML RENDERING -> ' + tag);
  const newView = createHtmlElement(tag, cssClasses, actions, scope);
  appendView(fatherViewRef, newView);
  recursiveRender(children, forceRerender, newView, scope);
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
  console.info('COMPONENT RENDERING -> ' + componentName);
  const newView = createHtmlElement(tag, cssClasses, actions, scope, componentName);
  if (forceRerender || rebuild) appendView(fatherViewRef, newView, rebuild && componentName);
  recursiveRender(children, forceRerender || rebuild, newView, scope);
  virtualDom[componentName].rebuild = false;
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
// re rendering
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
      return { ...updatedScope, [actualKey]: oldScope[actualKey].value };
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
