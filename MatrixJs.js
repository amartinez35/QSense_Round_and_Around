var matrixGene = (function (picasso, id, data, dimName, entete, app) {

  /**
   * Cration d'un composant de sélection, attention c'est du direct
   */
  picasso.component('selecteur', {
    require: ['chart', 'renderer'],
    renderer: 'dom',
    on: {
      clic(e) {
        const b = this.chart.element.getBoundingClientRect();
        this.state.nodes = this.chart.shapesAt({
          x: e.clientX - b.left,
          y: e.clientY - b.top
        });
        this.select();
      }
    },
    select() {
      const shapes = this.state.nodes.filter(n => n.type !== 'container' && n.data);
      if (!shapes.length) {
        return [];
      }
      const targetNode = shapes[shapes.length - 1];

      const rows = Object.keys(targetNode.data).filter(prop => prop !== 'value' && prop !== 'label').map(dataProp => {

        if (dataProp !== 'source' && targetNode.data[dataProp].source.field == dimName) {
          app.field(dimName).selectValues([targetNode.data[dataProp].label], true, true);
        }

      });
    },
    created() {
      this.state = {
        nodes: []
      };
    },
    render(h) {
      this.h = h;
      return []; // Nothing to render initially so we return an empty array.
    }
  })



  /**
   * Création d'un composant pour le tooltip
   */
  picasso.component('tooltip', {
    // The require property allows us to pull in our dependencies, in this case the chart instance for shape lookups and the renderer for rendering our nodes.
    require: ['chart', 'renderer'],
    // A component can define a set of default properties that expose in the current context. In our case we'll just allow some simple style related properties to be set by the users.
    defaultSettings: {
      background: '#f9f9f9',
      fontSize: '12px'
    },
    // We require a particular type of renderer, the available once are svg/canvas/dom. Since we want to do be able do CSS layouting we'll use the dom-renderer. It's available in the context as `renderer`.
    renderer: 'dom',
    // By defining a `on` property we're able to bind custom events to the component.
    on: {
      // From the chart instance we'll be able to emit a the `hover` event.
      hover(e) {
        const b = this.chart.element.getBoundingClientRect();
        this.state.nodes = this.chart.shapesAt({
          x: e.clientX - b.left,
          y: e.clientY - b.top
        });
        this.renderer.render(this.buildNodes())
      }
    },
    created() {
      this.state = {
        nodes: []
      };
    },
    buildRow(d) {
      if (d.source.field == dimName) {


        var counts = {};
        data.forEach(function (item) {
          counts[item[2]] = (counts[item[2]] || 0) + 1;
        });

        return [
     /* this.h('div', {
              style: {
                "margin-right": "4px",
                "font-weight": 600
              }
            },
            d.source.field+':'),*/
      this.h('div', {style: {
                "margin-right": "4px",
                "font-weight": 600
              }},
            d.value),
          this.h('div', {}, 
          ': ' + counts[d.value] + '%')
    ];
      }
    },
    buildNodes() {
      // Filter out any node that doesn't have any data bound to it or is a container node.
      const shapes = this.state.nodes.filter(n => n.type !== 'container' && n.data);
      //console.log(shapes);
      if (!shapes.length) {
        return [];
      }

      // Find an appropriate place to position the tooltip, lower right corner is good enough for now.
      const targetNode = shapes[shapes.length - 1];
      const left = targetNode.bounds.width + targetNode.bounds.x - 100;
      const top = targetNode.bounds.y + targetNode.bounds.height;

      // Render each data property should be rendered on a separate row.
      const rows = Object.keys(targetNode.data).filter(prop => prop !== 'value' && prop !== 'label').map(dataProp => {
        return this.h('div', {
            style: {
              display: 'flex'
            }
          },
          this.buildRow(dataProp !== 'source' ? targetNode.data[dataProp] : targetNode.data)
        )
      });

      return [
      this.h('div', {
            style: {
              position: 'relative',
              left: `${left}px`,
              top: `${top}px`,
              background: this.settings.background,
              color: '#888',
              display: 'inline-block',
              "box-shadow": "0px 0px 5px 0px rgba(123, 123, 123, 0.5)",
              "border-radius": "5px",
              padding: '8px',
              "font-size": this.settings.fontSize,
              "font-family": 'Arial'
            }
          },
          rows)
    ];
    },
    // picasso.js uses snabbdom(https://github.com/snabbdom/snabbdom) for dom-manipulation and exposes the snabbdom helper function `h` as a parameter to the `render` function. We'll use `h` to render our tooltip, but as we don't need it right here, we'll store it in the context for later use.
    render(h) {
      this.h = h;
      return []; // Nothing to render initially so we return an empty array.
    }
  })




  /**
   * Création du graphique
   */
  picasso.chart({
    element: document.querySelector('#' + id),
    data: [{
      type: 'matrix',
      data: data
    }],
    settings: {
      scales: {
        x: {
          data: {
            extract: {
              field: 'x'
            }
          },
          min: -0.9,
          max: 5.1
        },
        y: {
          data: {
            extract: {
              field: 'y'
            }
          },
          invert: true,
          min: -0.9,
          max: 20.1
        },
        color: {
          data: {
            extract: {
              field: dimName
            }
          },
          type: 'color',
          range: [
                  "#1abc9c",
                  "#2ecc71",
                  "#3498db",
                  "#e74c3c",
                  "#f39c12",
                  "#aa4499",
                  "#34495e",
                  "#7f8c8d"
               ]
        }
      },
      components: [{
        key: 'p',
        type: 'point',
        data: {
          extract: {
            field: 'x',
            props: {
              x: {
                field: 'x'
              },
              y: {
                field: 'y'
              },
              fill: {
                field: dimName,
                ref: dimName
              }
            }
          }
        },
        settings: {
          x: {
            scale: 'x'
          },
          y: {
            scale: 'y'
          },
          fill: {
            scale: 'color'
          },
          shape: 'circle'
        }
    }, {
        type: 'legend-cat',
        scale: 'color',
        dock: 'left'
    }, {
        key: 'tooltip',
        type: 'tooltip',
        background: 'white' // Override our default setting
}, {
        key: 'selecteur',
        type: 'selecteur'
}],
      interactions: [
        {
          type: 'native',
          events: {
            mousemove: function (e) {
              this.chart.component('tooltip').emit('hover', e);
            },
            mousedown: function (e) {
              this.chart.component('selecteur').emit('clic', e);
            }
          }
        }
      ]
    }
  });
});