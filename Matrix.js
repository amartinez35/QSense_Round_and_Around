/*
 * Matrice de points
 */
define([
  'jquery',
  'qlik',
  './picasso',
  './MatrixJs'
  ],
  function ($, qlik, picasso, matrix) {
    'use strict';

    return {
      initialProperties: {
        qHyperCubeDef: {
          qDimensions: [],
          qMeasure: [],
          qInitialDataFetch: [{
            qWidth: 2,
            qHeight: 50
          }]
        }
      },
      //paramètrage de l'extension
      definition: {
        type: "items",
        component: "accordion",
        items: {
          dimensions: {
            uses: "dimensions",
            min: 1,
            max: 1
          },
          measures: {
            uses: "measures",
            min: 1,
            max: 1
          },
          appearance: {
            uses: "settings",
            items: {
              orientation: {
                type: "string",
                component: "radiobuttons",
                label: "Orientation radio-buttons",
                ref: "orientation",
                options: [{
                    value: "v",
                    label: "Vertical"
                    }, {
                    value: "h",
                    label: "Horizontal"
                   }],
                default: 'v'
                }
            }
          },
          sorting: {
            uses: "sorting"
          },
          addons: {
            uses: "addons",
            items: {
              dataHandling: {
                uses: "dataHandling"
              }
            }
          }
        }
      },
      support: {
        export: true
      },
      snapshot: {
        canTakeSnapshot: true
      },
      //affichage de l'extension
      paint: function ($element, layout) {

        //id de l'objet
        var id = layout.qInfo.qId + '_matrix';
        //l'objet
        var $matrix = $('#' + id);

        //récupération des données
        var cube = layout.qHyperCube.qDataPages[0].qMatrix;

        //récupération des dimensions
        var dim = layout.qHyperCube.qDimensionInfo[0].qFallbackTitle;

        //calcul du %
        var total = 0;
        var entete = [];
        var ligne = [];
        var lignePer = [];

        cube.forEach(function (item) {
          entete.push(item[0].qText);
          ligne.push(item[1].qNum);
          total += item[1].qNum;
        });


        var it = 1;
        var itTotal = 0;

        ligne.forEach(function (item) {
          if (it == ligne.length) {
            lignePer.push(100 - itTotal);
          } else {
            lignePer.push(Math.floor((item / total) * 100));
            itTotal += Math.floor((item / total) * 100);
          }

          it++
        });

        it = 0;
        var p = 0;
        var data = [['x', 'y', dim]];

        entete.forEach(function (item) {
          for (var i = 0; i < lignePer[it]; i++) {
            var y = (layout.orientation == 'h' ? p % 5 : Math.floor(p / 5));
            var x = (layout.orientation == 'h' ? Math.floor(p / 5) : p % 5 );
            data.push([x, y, item]);
            p++;
          }

          it++;
        });


        if (!$matrix.length) {

          $matrix = $(document.createElement('div'));

          $matrix.attr('id', id);
          $matrix.attr('style', 'height:100%;weight:100%;');


          $element.append($matrix);
          matrixGene(picasso, id, data, dim, entete, qlik.currApp(this), layout.orientation);
        } else {
          $matrix.empty();
          matrixGene(picasso, id, data, dim, entete, qlik.currApp(this), layout.orientation);
        }
        return qlik.Promise.resolve();
      }
    };
  });