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
  const { tag, cssClasses, children, actions = null } = virtualDom[componentName];
  console.info('HTML RENDERING -> ' + tag);
  const newView = createHtmlElement(tag, cssClasses, actions);
  appendView(fatherViewRef, newView);
  recursiveRender(children, forceRerender, newView, virtualDom[componentName].scope);
}

function renderComponent(virtualDom, componentName, fatherViewRef, forceRerender) {
  const { rebuild, tag, cssClasses, children, actions = null } = virtualDom[componentName];
  console.info('COMPONENT RENDERING -> ' + componentName);
  const newView = createHtmlElement(tag, cssClasses, actions, componentName);
  if (forceRerender || rebuild) appendView(fatherViewRef, newView, rebuild && componentName);
  recursiveRender(children, forceRerender || rebuild, newView, virtualDom[componentName].scope);
  virtualDom[componentName].rebuild = false;
}

function createHtmlElement(tag, cssClasses, actions, id = null) {
  const newView = document.createElement(tag);
  if (!!actions && actions.length)
    actions.forEach(({ type, fn }) => addActionToTemplate(newView, type, fn));
  if (!!cssClasses.length) newView.classList.add([...cssClasses]);
  if (id) newView.setAttribute('id', id);
  return newView;
}

function addActionToTemplate(template, actionType, callback) {
  switch (actionType) {
    case ACTION_TYPEZ.CLICK:
      template.addEventListener('click', callback);
      break;
    default:
      break;
  }
}

function appendView(fatherViewRef, newView, componentName) {
  if (!!componentName) fatherViewRef.getElementById(componentName).replaceWith(newView);
  else fatherViewRef.appendChild(newView);
}

function recursiveRender(children, rebuild, newView, fatherScope) {
  if (!!Object.keys(children)) renderDom(children, rebuild, newView, fatherScope);
}
