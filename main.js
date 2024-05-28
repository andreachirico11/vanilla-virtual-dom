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

function renderPlainText(virtualDom, componentName, fatherViewRef) {
  console.info('TEXT RENDERING -> ' + virtualDom[componentName].txt);
  fatherViewRef.textContent = virtualDom[componentName].txt;
}

function renderState(virtualDom, componentName, fatherViewRef, scope) {
  if (!!!scope) return;
  const { name } = virtualDom[componentName];
  console.info('STATE RENDERING -> ' + name);
  if (!scope[name]) throw new Error('Missing scope state');
  fatherViewRef.textContent = scope[name].value;
}

function renderHtmlElement(virtualDom, componentName, fatherViewRef, forceRerender) {
  const { tag, cssClasses, children, actions = null, scope } = virtualDom[componentName];
  console.info('HTML RENDERING -> ' + tag);
  const newView = createHtmlElement(tag, cssClasses, actions, scope);
  appendView(fatherViewRef, newView);
  recursiveRender(children, forceRerender, newView, scope);
}

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

function createHtmlElement(tag, cssClasses, actions, scope = {}, id = null) {
  const newView = document.createElement(tag);
  if (!!actions && actions.length)
    actions.forEach((action) => addActionToTemplate(newView, action, scope));
  if (!!cssClasses.length) newView.classList.add([...cssClasses]);
  if (id) newView.setAttribute('id', id);
  return newView;
}

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

function formatScope(oldScope) {
  return Object.keys(oldScope).reduce((updatedScope, actualKey) => {
    if (oldScope[actualKey].type === SCOPE_TYPEZ.STATE) {
      return { ...updatedScope, [actualKey]: oldScope[actualKey].value };
    }
    return { ...updatedScope };
  }, {});
}

function appendView(fatherViewRef, newView, componentName) {
  if (!!componentName) fatherViewRef.getElementById(componentName).replaceWith(newView);
  else fatherViewRef.appendChild(newView);
}

function recursiveRender(children, rebuild, newView, fatherScope) {
  if (!!Object.keys(children)) renderDom(children, rebuild, newView, fatherScope);
}
