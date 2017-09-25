/* global define */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.MasonryGrid = factory();
  }
})(this, function () {
  var MasonryGrid = function () {
    // grid settings
    var gridDefaultOptions = {
      gridElementClass: '', // must be set by client
      maxCols: 6,
      minCols: 1,
      gutterWidth: 20,
      gutterHeight: 20
    };

    var gridOptions = {};

    // break points
    var defaultBreakPoints = {
      xtraLarge: 1200,
      large: 1000,
      medium: 768,
      small: 600,
      xtraSmall: 450
    };

    var breakPoints = {};

    // get elements to be used in masonry grid
    var gridElements;
    var gridContainer;

    function extend (a, b) {
      for (var key in b) {
        if (b.hasOwnProperty(key)) {
          a[key] = b[key];
        }
      }
      return a;
    }

    function updateGridOptions (options) {
      gridOptions = extend({}, gridDefaultOptions);
      extend(gridOptions, options);
    }

    function updateBreakPoints (newBreakPoints) {
      breakPoints = extend({}, defaultBreakPoints);
      extend(breakPoints, newBreakPoints);
    }

    function createGrid () {
      var currentCols = resizeGrid();
      var gridWidth = gridContainer.getBoundingClientRect().width;
      var elementOuterWidth = gridWidth / currentCols;
      var elementInnerWidth = elementOuterWidth - gridOptions.gutterWidth;
      var colHeights = [];

      function initColHeights () {
        // create an array of column heights with each column set to 0
        for (var i = 0; i < currentCols; i++) {
          colHeights.push(0);
        }
      }

      function indexOfMin (arr) {
        // find shortest column and return its index
        var arrLength = arr.length;
        if (arrLength === 0) {
          return -1;
        }
        var min = arr[0];
        var minIndex = 0;

        for (var i = 0; i < arrLength; i++) {
          if (arr[i] < min) {
            min = arr[i];
            minIndex = i;
          }
        }
        return minIndex;
      }

      function setPos (index) {
        // calculate the top and left positions of each element
        // and return an array with their values [top, left]
        var minCol = indexOfMin(colHeights);
        var currentHeight = colHeights[minCol];
        var top = currentHeight; // includes gutterHeight
        var left = (minCol) * elementOuterWidth + (gridOptions.gutterWidth / 2);

        // update col heights
        colHeights[minCol] += gridElements[index].getBoundingClientRect().height + gridOptions.gutterHeight;

        // return coords
        return [top, left];
      }

      initColHeights();
      // set element widths
      for (var j = 0; j < gridElements.length; j++) {
        gridElements[j].style.width = elementInnerWidth + 'px';
      }
      // place elements in grid
      // add card to row with least height
      for (var i = 0; i < gridElements.length; i++) {
        var cardCoords = setPos(i);
        var styleAttr = {
          position: 'absolute',
          top: cardCoords[0] + 'px',
          left: cardCoords[1] + 'px'
        };
        Object.assign(gridElements[i].style, styleAttr);
      }
    }

    function resizeGrid () {
      var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      var cols;
      var maxCols = gridOptions.maxCols;
      var minCols = gridOptions.minCols;

      if (windowWidth >= breakPoints.xtraLarge) {
        cols = maxCols;
      } else if (windowWidth < breakPoints.xtraLarge && windowWidth >= breakPoints.large) {
        cols = maxCols - 1;
      } else if (windowWidth < breakPoints.large && windowWidth >= breakPoints.medium) {
        cols = maxCols - 2;
      } else if (windowWidth < breakPoints.medium && windowWidth >= breakPoints.small) {
        cols = maxCols - 3;
      } else if (windowWidth < breakPoints.small && windowWidth >= breakPoints.xtraSmall) {
        cols = maxCols - 4;
      } else if (windowWidth < breakPoints.xtraSmall) {
        cols = maxCols - 5;
      }

      return (cols >= minCols) ? cols : minCols;
    }

    function debounce (func, wait, immediate) {
      var timeout;
      return function () {
        var context = this;
        var args = arguments;
        var later = function () {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    }

    function initGrid (options, breakPoints) {
      // initalize grid settings
      breakPoints = (typeof breakPoints !== 'undefined') ? breakPoints : {};
      updateBreakPoints(breakPoints);
      updateGridOptions(options);
      gridElements = document.getElementsByClassName(gridOptions.gridElementClass);
      gridContainer = gridElements[0].parentNode;

      // set up grid and add event listener for resizing
      createGrid();
      window.addEventListener('resize', debounce(createGrid, 250));
    }

    return {
      initGrid: initGrid
    };
  };
  return MasonryGrid;
});
