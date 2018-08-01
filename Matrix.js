/*
 * Matrice de points
 */
define([
  'jquery',
  'qlik',
  './picasso',
  './MatrixJs', 
  'css!./css/style.css'
  ],
  function ($, qlik, picasso, matrix) {
    'use strict';
  
      var aboutImage = {
      type: "string",
      component: "text",
      ref: "aboutImage",
      label: '<img src="../extensions/Matrix/Excelcio.png">',
      show: function(data){
        $('[tid="aboutImage"]').children().empty();
        $('[tid="aboutImage"]').children().append('<img src="../extensions/Matrix/Excelcio.png">');
        return true;
      }
    };
	
	    var aboutLien = {
      type: "string",
      component: "link",
      ref: "aboutLien",
      label: "Excelcio",
      url: "http://www.excelcio.com"
    }

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
                component: "buttongroup",
                label: "Présentation",
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
          },
          about:{
            label: "About",
            type: "items",
            items:{
              	              About:{
                ref:"about",
                type: "items",
                label: "About Excelcio" ,
                items:{
                  aboutImage: aboutImage,
                  aboutLien: aboutLien
                }
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

        //création des entêtes de colonne
        //création des lignes
        //calul du total
        cube.forEach(function (item) {
          entete.push(item[0].qText);
          ligne.push(item[1].qNum);
          total += item[1].qNum;
        });

 
        //préparation pour le calcul des %
        var it = 1;
        var itTotal = 0;
        
        
        ligne.forEach(function (item) {
          //pour la dernière valeur on passe par 100 - le total pour être sur des 100%
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

        //calul des coordonnées des points
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
          matrixGene(picasso, id, data, dim, qlik.currApp(this), layout.orientation, qlik.navigation.getMode());
        } else {
          $matrix.empty();
          matrixGene(picasso, id, data, dim, qlik.currApp(this), layout.orientation, qlik.navigation.getMode());
        }
        return qlik.Promise.resolve();
      }
    };
  });
