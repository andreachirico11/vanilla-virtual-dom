function renderDom(virtualDom, forceRerender = false, fatherViewRef) {
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
        renderState(virtualDom, componentName, fatherViewRef);
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

function renderState(virtualDom, componentName, fatherViewRef) {
  console.info('STATE RENDERING -> ' + virtualDom[componentName].value);
  fatherViewRef.textContent = virtualDom[componentName].value;
}

function renderHtmlElement(virtualDom, componentName, fatherViewRef, forceRerender) {
  const { tag, cssClasses, children } = virtualDom[componentName];
  console.info('HTML RENDERING -> ' + tag);
  const newView = createHtmlElement(tag, cssClasses);
  appendView(fatherViewRef, newView);
  recursiveRender(children, forceRerender, newView);
}

function renderComponent(virtualDom, componentName, fatherViewRef, forceRerender) {
  const { rebuild, tag, cssClasses, children } = virtualDom[componentName];
  console.info('COMPONENT RENDERING -> ' + componentName);
  const newView = createHtmlElement(tag, cssClasses, componentName);
  if (forceRerender || rebuild) appendView(fatherViewRef, newView, rebuild && componentName);
  recursiveRender(children, forceRerender || rebuild, newView);
  virtualDom[componentName].rebuild = false;
}

function createHtmlElement(tag, cssClasses, id = null) {
  const newView = document.createElement(tag);
  if (!!cssClasses.length) newView.classList.add([...cssClasses]);
  if (id) newView.setAttribute('id', id);
  return newView;
}

function appendView(fatherViewRef, newView, componentName) {
  if (!!componentName) fatherViewRef.getElementById(componentName).replaceWith(newView);
  else fatherViewRef.appendChild(newView);
}

function recursiveRender(children, rebuild, newView) {
  if (!!Object.keys(children)) renderDom(children, rebuild, newView);
}
