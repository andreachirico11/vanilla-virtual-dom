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
      button_0: {
        tag: 'button',
        type: TYPEZ.COMPONENT,
        cssClasses: ['btn'],
        rebuild: false,
        actions: [
          {
            type: ACTION_TYPEZ.CLICK,
            fn() {
              this.niceNumber++;
            },
          },
        ],
        scope: {
          btnLabel: {
            type: SCOPE_TYPEZ.STATE,
            value: 'actionnnn',
          },
          niceNumber: {
            type: SCOPE_TYPEZ.STATE,
            value: 1,
          },
        },
        children: {
          [STATE + 1]: {
            type: TYPEZ.STATE,
            name: 'btnLabel',
          },
        },
      },
    },
  },
};
