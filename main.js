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
    console.info('HTML RENDERING -> ' + tag);
  } else {
    componentView = document.getElementById(componentName);
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
    console.info('COMPONENT RENDERING -> ' + componentName);
  } else {
    componentView = document.getElementById(componentName);
  }
  recursiveRender(children, redrawView, componentView, scope);
}
/**
 *
 * @param {String} tag
 * @param {String[]} cssClasses
 * @param {{type: ACTION_TYPEZ, fn: Function}[]} actions
 * @param {{[key: string]: {type: SCOPE_TYPEZ, value: any}}} scope
 * @param {String} componentName
 * @returns {HTMLElement}
 */
function createHtmlElement(tag, cssClasses, actions, scope = {}, componentName = null) {
  const newView = document.createElement(tag);
  if (!!actions && actions.length)
    actions.forEach((action) => addActionToTemplate(newView, action, scope, componentName));
  if (!!cssClasses.length) newView.classList.add([...cssClasses]);
  if (componentName) newView.setAttribute('id', componentName);
  return newView;
}

/**
 * Binds actions to template according to type event
 * @param {HTMLElement} template
 * @param {{type: ACTION_TYPEZ, fn: Function}} action
 * @param {{[key: string]: {type: SCOPE_TYPEZ, value: any}}} scope
 * @param {String} componentName
 */
function addActionToTemplate(template, action, scope, componentName) {
  let { type, fn } = action;
  fn = fn.bind(formatScope(scope, componentName));
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
 * when a property is set the setter method also updates the virtual dom a
 * and redraw the view
 * @param {{[key: string]: {type: SCOPE_TYPEZ, value: any}}} scope
 * @param {String} componentName
 * @returns {Object}
 */
function formatScope(oldScope, componentName) {
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
          VIRTUAL_DOM = updateVirtualDom(VIRTUAL_DOM, componentName, { [actualKey]: newValue });
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
  if (!!componentName) document.getElementById(componentName).replaceWith(newView);
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

/**
 * If the evaluated component is the one wich originated the update.
 * In this case updates the component scope and set is rebuild property to true
 *
 * @param {Object} componentRef
 * @param {Object} updateDVirtualDom
 * @param {Object} updatedComponentScope
 * @param {boolean} rebuild
 */
function targetForRebuildIfNecessary(
  componentRef,
  updateDVirtualDom,
  updatedComponentScope,
  rebuild
) {
  if (componentRef.hasOwnProperty('rebuild') && componentRef.hasOwnProperty('scope')) {
    const scope = { ...componentRef.scope, ...(rebuild && updatedComponentScope) };
    if (rebuild) {
      Object.keys(updatedComponentScope).forEach((propToUpdate) => {
        scope[propToUpdate].value = updatedComponentScope[propToUpdate].value;
      });
    }
    updateDVirtualDom = {
      ...updateDVirtualDom,
      rebuild,
      scope,
    };
  }
}

/**
 * Creates a new virtual dom updating the scope of the component wich originates
 * the update and targets it for redrawing process
 * @param {Object} virtualDomTree
 * @param {String} componentToBeUpdatedKey
 * @param {Object} updatedScopeObject
 * @returns
 */
function updateVirtualDom(virtualDomTree, componentToBeUpdatedKey, updatedScopeObject) {
  if (JSON.stringify(virtualDomTree) === '{}') return virtualDomTree;
  const updatedTree = {};
  for (componentKey in virtualDomTree) {
    updatedTree[componentKey] = { ...virtualDomTree[componentKey] };
    const updatedTreeComponwentRef = updatedTree[componentKey];
    const isAComponentAndMustBeUpdated =
      (objectHasProperties(updatedTreeComponwentRef), 'rebuild', 'scope') &&
      componentToBeUpdatedKey === componentKey;
    if (isAComponentAndMustBeUpdated) {
      updatedTreeComponwentRef.rebuild = true;
      Object.keys(updatedScopeObject).forEach(
        (key) => (updatedTreeComponwentRef.scope[key].value = updatedScopeObject[key])
      );
    }
    if ((objectHasProperties(updatedTreeComponwentRef), 'children')) {
      updatedTreeComponwentRef.children = updateVirtualDom(
        updatedTreeComponwentRef.children,
        componentToBeUpdatedKey,
        updatedScopeObject
      );
    }
  }
  return updatedTree;
}

function objectHasProperties(obj, ...properties) {
  return properties.every((p) => obj.hasOwnProperty(p));
}
