// This code iterates all links from the header
// and adds a click event listener that when clicked on the same page as the anchor
// it will add listen to the off canvas being closed and then scroll to the anchor
var links = document.querySelectorAll(".offcanvas-body .nav-item-non-children .nav-link");
links.forEach(function (link) {
    link.addEventListener("click", function (e) {
        if ((this.pathname === window.location.pathname) && (this.host === window.location.host)) {
            var target = document.getElementById(this.getAttribute("href").split("#")[1]);
            e.preventDefault();
            let offCanvas = document.getElementById("offcanvasDoks");
            // Distinguish between the offcanvas being open or closed
            if (offCanvas.classList.contains("show")) {
                offCanvas.addEventListener('hidden.bs.offcanvas', function () {
                    target.scrollIntoView();
                })
                document.getElementById("menuDismissButton").click();
            } else {
                target.scrollIntoView();
            }
        }
    });
});

;
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/lazysizes/lazysizes.js
  var require_lazysizes = __commonJS({
    "node_modules/lazysizes/lazysizes.js"(exports, module) {
      (function(window2, factory) {
        var lazySizes = factory(window2, window2.document, Date);
        window2.lazySizes = lazySizes;
        if (typeof module == "object" && module.exports) {
          module.exports = lazySizes;
        }
      })(
        typeof window != "undefined" ? window : {},
        /**
         * import("./types/global")
         * @typedef { import("./types/lazysizes-config").LazySizesConfigPartial } LazySizesConfigPartial
         */
        function l(window2, document, Date2) {
          "use strict";
          var lazysizes, lazySizesCfg;
          (function() {
            var prop;
            var lazySizesDefaults = {
              lazyClass: "lazyload",
              loadedClass: "lazyloaded",
              loadingClass: "lazyloading",
              preloadClass: "lazypreload",
              errorClass: "lazyerror",
              //strictClass: 'lazystrict',
              autosizesClass: "lazyautosizes",
              fastLoadedClass: "ls-is-cached",
              iframeLoadMode: 0,
              srcAttr: "data-src",
              srcsetAttr: "data-srcset",
              sizesAttr: "data-sizes",
              //preloadAfterLoad: false,
              minSize: 40,
              customMedia: {},
              init: true,
              expFactor: 1.5,
              hFac: 0.8,
              loadMode: 2,
              loadHidden: true,
              ricTimeout: 0,
              throttleDelay: 125
            };
            lazySizesCfg = window2.lazySizesConfig || window2.lazysizesConfig || {};
            for (prop in lazySizesDefaults) {
              if (!(prop in lazySizesCfg)) {
                lazySizesCfg[prop] = lazySizesDefaults[prop];
              }
            }
          })();
          if (!document || !document.getElementsByClassName) {
            return {
              init: function() {
              },
              /**
               * @type { LazySizesConfigPartial }
               */
              cfg: lazySizesCfg,
              /**
               * @type { true }
               */
              noSupport: true
            };
          }
          var docElem = document.documentElement;
          var supportPicture = window2.HTMLPictureElement;
          var _addEventListener = "addEventListener";
          var _getAttribute = "getAttribute";
          var addEventListener = window2[_addEventListener].bind(window2);
          var setTimeout = window2.setTimeout;
          var requestAnimationFrame = window2.requestAnimationFrame || setTimeout;
          var requestIdleCallback = window2.requestIdleCallback;
          var regPicture = /^picture$/i;
          var loadEvents = ["load", "error", "lazyincluded", "_lazyloaded"];
          var regClassCache = {};
          var forEach = Array.prototype.forEach;
          var hasClass = function(ele, cls) {
            if (!regClassCache[cls]) {
              regClassCache[cls] = new RegExp("(\\s|^)" + cls + "(\\s|$)");
            }
            return regClassCache[cls].test(ele[_getAttribute]("class") || "") && regClassCache[cls];
          };
          var addClass = function(ele, cls) {
            if (!hasClass(ele, cls)) {
              ele.setAttribute("class", (ele[_getAttribute]("class") || "").trim() + " " + cls);
            }
          };
          var removeClass = function(ele, cls) {
            var reg;
            if (reg = hasClass(ele, cls)) {
              ele.setAttribute("class", (ele[_getAttribute]("class") || "").replace(reg, " "));
            }
          };
          var addRemoveLoadEvents = function(dom, fn, add) {
            var action = add ? _addEventListener : "removeEventListener";
            if (add) {
              addRemoveLoadEvents(dom, fn);
            }
            loadEvents.forEach(function(evt) {
              dom[action](evt, fn);
            });
          };
          var triggerEvent = function(elem, name, detail, noBubbles, noCancelable) {
            var event = document.createEvent("Event");
            if (!detail) {
              detail = {};
            }
            detail.instance = lazysizes;
            event.initEvent(name, !noBubbles, !noCancelable);
            event.detail = detail;
            elem.dispatchEvent(event);
            return event;
          };
          var updatePolyfill = function(el, full) {
            var polyfill;
            if (!supportPicture && (polyfill = window2.picturefill || lazySizesCfg.pf)) {
              if (full && full.src && !el[_getAttribute]("srcset")) {
                el.setAttribute("srcset", full.src);
              }
              polyfill({ reevaluate: true, elements: [el] });
            } else if (full && full.src) {
              el.src = full.src;
            }
          };
          var getCSS = function(elem, style) {
            return (getComputedStyle(elem, null) || {})[style];
          };
          var getWidth = function(elem, parent, width) {
            width = width || elem.offsetWidth;
            while (width < lazySizesCfg.minSize && parent && !elem._lazysizesWidth) {
              width = parent.offsetWidth;
              parent = parent.parentNode;
            }
            return width;
          };
          var rAF = function() {
            var running, waiting;
            var firstFns = [];
            var secondFns = [];
            var fns = firstFns;
            var run = function() {
              var runFns = fns;
              fns = firstFns.length ? secondFns : firstFns;
              running = true;
              waiting = false;
              while (runFns.length) {
                runFns.shift()();
              }
              running = false;
            };
            var rafBatch = function(fn, queue) {
              if (running && !queue) {
                fn.apply(this, arguments);
              } else {
                fns.push(fn);
                if (!waiting) {
                  waiting = true;
                  (document.hidden ? setTimeout : requestAnimationFrame)(run);
                }
              }
            };
            rafBatch._lsFlush = run;
            return rafBatch;
          }();
          var rAFIt = function(fn, simple) {
            return simple ? function() {
              rAF(fn);
            } : function() {
              var that = this;
              var args = arguments;
              rAF(function() {
                fn.apply(that, args);
              });
            };
          };
          var throttle = function(fn) {
            var running;
            var lastTime = 0;
            var gDelay = lazySizesCfg.throttleDelay;
            var rICTimeout = lazySizesCfg.ricTimeout;
            var run = function() {
              running = false;
              lastTime = Date2.now();
              fn();
            };
            var idleCallback = requestIdleCallback && rICTimeout > 49 ? function() {
              requestIdleCallback(run, { timeout: rICTimeout });
              if (rICTimeout !== lazySizesCfg.ricTimeout) {
                rICTimeout = lazySizesCfg.ricTimeout;
              }
            } : rAFIt(function() {
              setTimeout(run);
            }, true);
            return function(isPriority) {
              var delay;
              if (isPriority = isPriority === true) {
                rICTimeout = 33;
              }
              if (running) {
                return;
              }
              running = true;
              delay = gDelay - (Date2.now() - lastTime);
              if (delay < 0) {
                delay = 0;
              }
              if (isPriority || delay < 9) {
                idleCallback();
              } else {
                setTimeout(idleCallback, delay);
              }
            };
          };
          var debounce = function(func) {
            var timeout, timestamp;
            var wait = 99;
            var run = function() {
              timeout = null;
              func();
            };
            var later = function() {
              var last = Date2.now() - timestamp;
              if (last < wait) {
                setTimeout(later, wait - last);
              } else {
                (requestIdleCallback || run)(run);
              }
            };
            return function() {
              timestamp = Date2.now();
              if (!timeout) {
                timeout = setTimeout(later, wait);
              }
            };
          };
          var loader = function() {
            var preloadElems, isCompleted, resetPreloadingTimer, loadMode, started;
            var eLvW, elvH, eLtop, eLleft, eLright, eLbottom, isBodyHidden;
            var regImg = /^img$/i;
            var regIframe = /^iframe$/i;
            var supportScroll = "onscroll" in window2 && !/(gle|ing)bot/.test(navigator.userAgent);
            var shrinkExpand = 0;
            var currentExpand = 0;
            var isLoading = 0;
            var lowRuns = -1;
            var resetPreloading = function(e) {
              isLoading--;
              if (!e || isLoading < 0 || !e.target) {
                isLoading = 0;
              }
            };
            var isVisible = function(elem) {
              if (isBodyHidden == null) {
                isBodyHidden = getCSS(document.body, "visibility") == "hidden";
              }
              return isBodyHidden || !(getCSS(elem.parentNode, "visibility") == "hidden" && getCSS(elem, "visibility") == "hidden");
            };
            var isNestedVisible = function(elem, elemExpand) {
              var outerRect;
              var parent = elem;
              var visible = isVisible(elem);
              eLtop -= elemExpand;
              eLbottom += elemExpand;
              eLleft -= elemExpand;
              eLright += elemExpand;
              while (visible && (parent = parent.offsetParent) && parent != document.body && parent != docElem) {
                visible = (getCSS(parent, "opacity") || 1) > 0;
                if (visible && getCSS(parent, "overflow") != "visible") {
                  outerRect = parent.getBoundingClientRect();
                  visible = eLright > outerRect.left && eLleft < outerRect.right && eLbottom > outerRect.top - 1 && eLtop < outerRect.bottom + 1;
                }
              }
              return visible;
            };
            var checkElements = function() {
              var eLlen, i, rect, autoLoadElem, loadedSomething, elemExpand, elemNegativeExpand, elemExpandVal, beforeExpandVal, defaultExpand, preloadExpand, hFac;
              var lazyloadElems = lazysizes.elements;
              if ((loadMode = lazySizesCfg.loadMode) && isLoading < 8 && (eLlen = lazyloadElems.length)) {
                i = 0;
                lowRuns++;
                for (; i < eLlen; i++) {
                  if (!lazyloadElems[i] || lazyloadElems[i]._lazyRace) {
                    continue;
                  }
                  if (!supportScroll || lazysizes.prematureUnveil && lazysizes.prematureUnveil(lazyloadElems[i])) {
                    unveilElement(lazyloadElems[i]);
                    continue;
                  }
                  if (!(elemExpandVal = lazyloadElems[i][_getAttribute]("data-expand")) || !(elemExpand = elemExpandVal * 1)) {
                    elemExpand = currentExpand;
                  }
                  if (!defaultExpand) {
                    defaultExpand = !lazySizesCfg.expand || lazySizesCfg.expand < 1 ? docElem.clientHeight > 500 && docElem.clientWidth > 500 ? 500 : 370 : lazySizesCfg.expand;
                    lazysizes._defEx = defaultExpand;
                    preloadExpand = defaultExpand * lazySizesCfg.expFactor;
                    hFac = lazySizesCfg.hFac;
                    isBodyHidden = null;
                    if (currentExpand < preloadExpand && isLoading < 1 && lowRuns > 2 && loadMode > 2 && !document.hidden) {
                      currentExpand = preloadExpand;
                      lowRuns = 0;
                    } else if (loadMode > 1 && lowRuns > 1 && isLoading < 6) {
                      currentExpand = defaultExpand;
                    } else {
                      currentExpand = shrinkExpand;
                    }
                  }
                  if (beforeExpandVal !== elemExpand) {
                    eLvW = innerWidth + elemExpand * hFac;
                    elvH = innerHeight + elemExpand;
                    elemNegativeExpand = elemExpand * -1;
                    beforeExpandVal = elemExpand;
                  }
                  rect = lazyloadElems[i].getBoundingClientRect();
                  if ((eLbottom = rect.bottom) >= elemNegativeExpand && (eLtop = rect.top) <= elvH && (eLright = rect.right) >= elemNegativeExpand * hFac && (eLleft = rect.left) <= eLvW && (eLbottom || eLright || eLleft || eLtop) && (lazySizesCfg.loadHidden || isVisible(lazyloadElems[i])) && (isCompleted && isLoading < 3 && !elemExpandVal && (loadMode < 3 || lowRuns < 4) || isNestedVisible(lazyloadElems[i], elemExpand))) {
                    unveilElement(lazyloadElems[i]);
                    loadedSomething = true;
                    if (isLoading > 9) {
                      break;
                    }
                  } else if (!loadedSomething && isCompleted && !autoLoadElem && isLoading < 4 && lowRuns < 4 && loadMode > 2 && (preloadElems[0] || lazySizesCfg.preloadAfterLoad) && (preloadElems[0] || !elemExpandVal && (eLbottom || eLright || eLleft || eLtop || lazyloadElems[i][_getAttribute](lazySizesCfg.sizesAttr) != "auto"))) {
                    autoLoadElem = preloadElems[0] || lazyloadElems[i];
                  }
                }
                if (autoLoadElem && !loadedSomething) {
                  unveilElement(autoLoadElem);
                }
              }
            };
            var throttledCheckElements = throttle(checkElements);
            var switchLoadingClass = function(e) {
              var elem = e.target;
              if (elem._lazyCache) {
                delete elem._lazyCache;
                return;
              }
              resetPreloading(e);
              addClass(elem, lazySizesCfg.loadedClass);
              removeClass(elem, lazySizesCfg.loadingClass);
              addRemoveLoadEvents(elem, rafSwitchLoadingClass);
              triggerEvent(elem, "lazyloaded");
            };
            var rafedSwitchLoadingClass = rAFIt(switchLoadingClass);
            var rafSwitchLoadingClass = function(e) {
              rafedSwitchLoadingClass({ target: e.target });
            };
            var changeIframeSrc = function(elem, src) {
              var loadMode2 = elem.getAttribute("data-load-mode") || lazySizesCfg.iframeLoadMode;
              if (loadMode2 == 0) {
                elem.contentWindow.location.replace(src);
              } else if (loadMode2 == 1) {
                elem.src = src;
              }
            };
            var handleSources = function(source) {
              var customMedia;
              var sourceSrcset = source[_getAttribute](lazySizesCfg.srcsetAttr);
              if (customMedia = lazySizesCfg.customMedia[source[_getAttribute]("data-media") || source[_getAttribute]("media")]) {
                source.setAttribute("media", customMedia);
              }
              if (sourceSrcset) {
                source.setAttribute("srcset", sourceSrcset);
              }
            };
            var lazyUnveil = rAFIt(function(elem, detail, isAuto, sizes, isImg) {
              var src, srcset, parent, isPicture, event, firesLoad;
              if (!(event = triggerEvent(elem, "lazybeforeunveil", detail)).defaultPrevented) {
                if (sizes) {
                  if (isAuto) {
                    addClass(elem, lazySizesCfg.autosizesClass);
                  } else {
                    elem.setAttribute("sizes", sizes);
                  }
                }
                srcset = elem[_getAttribute](lazySizesCfg.srcsetAttr);
                src = elem[_getAttribute](lazySizesCfg.srcAttr);
                if (isImg) {
                  parent = elem.parentNode;
                  isPicture = parent && regPicture.test(parent.nodeName || "");
                }
                firesLoad = detail.firesLoad || "src" in elem && (srcset || src || isPicture);
                event = { target: elem };
                addClass(elem, lazySizesCfg.loadingClass);
                if (firesLoad) {
                  clearTimeout(resetPreloadingTimer);
                  resetPreloadingTimer = setTimeout(resetPreloading, 2500);
                  addRemoveLoadEvents(elem, rafSwitchLoadingClass, true);
                }
                if (isPicture) {
                  forEach.call(parent.getElementsByTagName("source"), handleSources);
                }
                if (srcset) {
                  elem.setAttribute("srcset", srcset);
                } else if (src && !isPicture) {
                  if (regIframe.test(elem.nodeName)) {
                    changeIframeSrc(elem, src);
                  } else {
                    elem.src = src;
                  }
                }
                if (isImg && (srcset || isPicture)) {
                  updatePolyfill(elem, { src });
                }
              }
              if (elem._lazyRace) {
                delete elem._lazyRace;
              }
              removeClass(elem, lazySizesCfg.lazyClass);
              rAF(function() {
                var isLoaded = elem.complete && elem.naturalWidth > 1;
                if (!firesLoad || isLoaded) {
                  if (isLoaded) {
                    addClass(elem, lazySizesCfg.fastLoadedClass);
                  }
                  switchLoadingClass(event);
                  elem._lazyCache = true;
                  setTimeout(function() {
                    if ("_lazyCache" in elem) {
                      delete elem._lazyCache;
                    }
                  }, 9);
                }
                if (elem.loading == "lazy") {
                  isLoading--;
                }
              }, true);
            });
            var unveilElement = function(elem) {
              if (elem._lazyRace) {
                return;
              }
              var detail;
              var isImg = regImg.test(elem.nodeName);
              var sizes = isImg && (elem[_getAttribute](lazySizesCfg.sizesAttr) || elem[_getAttribute]("sizes"));
              var isAuto = sizes == "auto";
              if ((isAuto || !isCompleted) && isImg && (elem[_getAttribute]("src") || elem.srcset) && !elem.complete && !hasClass(elem, lazySizesCfg.errorClass) && hasClass(elem, lazySizesCfg.lazyClass)) {
                return;
              }
              detail = triggerEvent(elem, "lazyunveilread").detail;
              if (isAuto) {
                autoSizer.updateElem(elem, true, elem.offsetWidth);
              }
              elem._lazyRace = true;
              isLoading++;
              lazyUnveil(elem, detail, isAuto, sizes, isImg);
            };
            var afterScroll = debounce(function() {
              lazySizesCfg.loadMode = 3;
              throttledCheckElements();
            });
            var altLoadmodeScrollListner = function() {
              if (lazySizesCfg.loadMode == 3) {
                lazySizesCfg.loadMode = 2;
              }
              afterScroll();
            };
            var onload = function() {
              if (isCompleted) {
                return;
              }
              if (Date2.now() - started < 999) {
                setTimeout(onload, 999);
                return;
              }
              isCompleted = true;
              lazySizesCfg.loadMode = 3;
              throttledCheckElements();
              addEventListener("scroll", altLoadmodeScrollListner, true);
            };
            return {
              _: function() {
                started = Date2.now();
                lazysizes.elements = document.getElementsByClassName(lazySizesCfg.lazyClass);
                preloadElems = document.getElementsByClassName(lazySizesCfg.lazyClass + " " + lazySizesCfg.preloadClass);
                addEventListener("scroll", throttledCheckElements, true);
                addEventListener("resize", throttledCheckElements, true);
                addEventListener("pageshow", function(e) {
                  if (e.persisted) {
                    var loadingElements = document.querySelectorAll("." + lazySizesCfg.loadingClass);
                    if (loadingElements.length && loadingElements.forEach) {
                      requestAnimationFrame(function() {
                        loadingElements.forEach(function(img) {
                          if (img.complete) {
                            unveilElement(img);
                          }
                        });
                      });
                    }
                  }
                });
                if (window2.MutationObserver) {
                  new MutationObserver(throttledCheckElements).observe(docElem, { childList: true, subtree: true, attributes: true });
                } else {
                  docElem[_addEventListener]("DOMNodeInserted", throttledCheckElements, true);
                  docElem[_addEventListener]("DOMAttrModified", throttledCheckElements, true);
                  setInterval(throttledCheckElements, 999);
                }
                addEventListener("hashchange", throttledCheckElements, true);
                ["focus", "mouseover", "click", "load", "transitionend", "animationend"].forEach(function(name) {
                  document[_addEventListener](name, throttledCheckElements, true);
                });
                if (/d$|^c/.test(document.readyState)) {
                  onload();
                } else {
                  addEventListener("load", onload);
                  document[_addEventListener]("DOMContentLoaded", throttledCheckElements);
                  setTimeout(onload, 2e4);
                }
                if (lazysizes.elements.length) {
                  checkElements();
                  rAF._lsFlush();
                } else {
                  throttledCheckElements();
                }
              },
              checkElems: throttledCheckElements,
              unveil: unveilElement,
              _aLSL: altLoadmodeScrollListner
            };
          }();
          var autoSizer = function() {
            var autosizesElems;
            var sizeElement = rAFIt(function(elem, parent, event, width) {
              var sources, i, len;
              elem._lazysizesWidth = width;
              width += "px";
              elem.setAttribute("sizes", width);
              if (regPicture.test(parent.nodeName || "")) {
                sources = parent.getElementsByTagName("source");
                for (i = 0, len = sources.length; i < len; i++) {
                  sources[i].setAttribute("sizes", width);
                }
              }
              if (!event.detail.dataAttr) {
                updatePolyfill(elem, event.detail);
              }
            });
            var getSizeElement = function(elem, dataAttr, width) {
              var event;
              var parent = elem.parentNode;
              if (parent) {
                width = getWidth(elem, parent, width);
                event = triggerEvent(elem, "lazybeforesizes", { width, dataAttr: !!dataAttr });
                if (!event.defaultPrevented) {
                  width = event.detail.width;
                  if (width && width !== elem._lazysizesWidth) {
                    sizeElement(elem, parent, event, width);
                  }
                }
              }
            };
            var updateElementsSizes = function() {
              var i;
              var len = autosizesElems.length;
              if (len) {
                i = 0;
                for (; i < len; i++) {
                  getSizeElement(autosizesElems[i]);
                }
              }
            };
            var debouncedUpdateElementsSizes = debounce(updateElementsSizes);
            return {
              _: function() {
                autosizesElems = document.getElementsByClassName(lazySizesCfg.autosizesClass);
                addEventListener("resize", debouncedUpdateElementsSizes);
              },
              checkElems: debouncedUpdateElementsSizes,
              updateElem: getSizeElement
            };
          }();
          var init = function() {
            if (!init.i && document.getElementsByClassName) {
              init.i = true;
              autoSizer._();
              loader._();
            }
          };
          setTimeout(function() {
            if (lazySizesCfg.init) {
              init();
            }
          });
          lazysizes = {
            /**
             * @type { LazySizesConfigPartial }
             */
            cfg: lazySizesCfg,
            autoSizer,
            loader,
            init,
            uP: updatePolyfill,
            aC: addClass,
            rC: removeClass,
            hC: hasClass,
            fire: triggerEvent,
            gW: getWidth,
            rAF
          };
          return lazysizes;
        }
      );
    }
  });

  // <stdin>
  var import_lazysizes = __toESM(require_lazysizes());
})();

;
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/clipboard/dist/clipboard.js
  var require_clipboard = __commonJS({
    "node_modules/clipboard/dist/clipboard.js"(exports, module) {
      (function webpackUniversalModuleDefinition(root, factory) {
        if (typeof exports === "object" && typeof module === "object")
          module.exports = factory();
        else if (typeof define === "function" && define.amd)
          define([], factory);
        else if (typeof exports === "object")
          exports["ClipboardJS"] = factory();
        else
          root["ClipboardJS"] = factory();
      })(exports, function() {
        return (
          /******/
          function() {
            var __webpack_modules__ = {
              /***/
              686: (
                /***/
                function(__unused_webpack_module, __webpack_exports__, __webpack_require__2) {
                  "use strict";
                  __webpack_require__2.d(__webpack_exports__, {
                    "default": function() {
                      return (
                        /* binding */
                        clipboard2
                      );
                    }
                  });
                  var tiny_emitter = __webpack_require__2(279);
                  var tiny_emitter_default = /* @__PURE__ */ __webpack_require__2.n(tiny_emitter);
                  var listen = __webpack_require__2(370);
                  var listen_default = /* @__PURE__ */ __webpack_require__2.n(listen);
                  var src_select = __webpack_require__2(817);
                  var select_default = /* @__PURE__ */ __webpack_require__2.n(src_select);
                  ;
                  function command(type) {
                    try {
                      return document.execCommand(type);
                    } catch (err) {
                      return false;
                    }
                  }
                  ;
                  var ClipboardActionCut = function ClipboardActionCut2(target) {
                    var selectedText = select_default()(target);
                    command("cut");
                    return selectedText;
                  };
                  var actions_cut = ClipboardActionCut;
                  ;
                  function createFakeElement(value) {
                    var isRTL = document.documentElement.getAttribute("dir") === "rtl";
                    var fakeElement = document.createElement("textarea");
                    fakeElement.style.fontSize = "12pt";
                    fakeElement.style.border = "0";
                    fakeElement.style.padding = "0";
                    fakeElement.style.margin = "0";
                    fakeElement.style.position = "absolute";
                    fakeElement.style[isRTL ? "right" : "left"] = "-9999px";
                    var yPosition = window.pageYOffset || document.documentElement.scrollTop;
                    fakeElement.style.top = "".concat(yPosition, "px");
                    fakeElement.setAttribute("readonly", "");
                    fakeElement.value = value;
                    return fakeElement;
                  }
                  ;
                  var fakeCopyAction = function fakeCopyAction2(value, options) {
                    var fakeElement = createFakeElement(value);
                    options.container.appendChild(fakeElement);
                    var selectedText = select_default()(fakeElement);
                    command("copy");
                    fakeElement.remove();
                    return selectedText;
                  };
                  var ClipboardActionCopy = function ClipboardActionCopy2(target) {
                    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {
                      container: document.body
                    };
                    var selectedText = "";
                    if (typeof target === "string") {
                      selectedText = fakeCopyAction(target, options);
                    } else if (target instanceof HTMLInputElement && !["text", "search", "url", "tel", "password"].includes(target === null || target === void 0 ? void 0 : target.type)) {
                      selectedText = fakeCopyAction(target.value, options);
                    } else {
                      selectedText = select_default()(target);
                      command("copy");
                    }
                    return selectedText;
                  };
                  var actions_copy = ClipboardActionCopy;
                  ;
                  function _typeof(obj) {
                    "@babel/helpers - typeof";
                    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                      _typeof = function _typeof2(obj2) {
                        return typeof obj2;
                      };
                    } else {
                      _typeof = function _typeof2(obj2) {
                        return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                      };
                    }
                    return _typeof(obj);
                  }
                  var ClipboardActionDefault = function ClipboardActionDefault2() {
                    var options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
                    var _options$action = options.action, action = _options$action === void 0 ? "copy" : _options$action, container = options.container, target = options.target, text = options.text;
                    if (action !== "copy" && action !== "cut") {
                      throw new Error('Invalid "action" value, use either "copy" or "cut"');
                    }
                    if (target !== void 0) {
                      if (target && _typeof(target) === "object" && target.nodeType === 1) {
                        if (action === "copy" && target.hasAttribute("disabled")) {
                          throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');
                        }
                        if (action === "cut" && (target.hasAttribute("readonly") || target.hasAttribute("disabled"))) {
                          throw new Error(`Invalid "target" attribute. You can't cut text from elements with "readonly" or "disabled" attributes`);
                        }
                      } else {
                        throw new Error('Invalid "target" value, use a valid Element');
                      }
                    }
                    if (text) {
                      return actions_copy(text, {
                        container
                      });
                    }
                    if (target) {
                      return action === "cut" ? actions_cut(target) : actions_copy(target, {
                        container
                      });
                    }
                  };
                  var actions_default = ClipboardActionDefault;
                  ;
                  function clipboard_typeof(obj) {
                    "@babel/helpers - typeof";
                    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
                      clipboard_typeof = function _typeof2(obj2) {
                        return typeof obj2;
                      };
                    } else {
                      clipboard_typeof = function _typeof2(obj2) {
                        return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
                      };
                    }
                    return clipboard_typeof(obj);
                  }
                  function _classCallCheck(instance, Constructor) {
                    if (!(instance instanceof Constructor)) {
                      throw new TypeError("Cannot call a class as a function");
                    }
                  }
                  function _defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                      var descriptor = props[i];
                      descriptor.enumerable = descriptor.enumerable || false;
                      descriptor.configurable = true;
                      if ("value" in descriptor) descriptor.writable = true;
                      Object.defineProperty(target, descriptor.key, descriptor);
                    }
                  }
                  function _createClass(Constructor, protoProps, staticProps) {
                    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
                    if (staticProps) _defineProperties(Constructor, staticProps);
                    return Constructor;
                  }
                  function _inherits(subClass, superClass) {
                    if (typeof superClass !== "function" && superClass !== null) {
                      throw new TypeError("Super expression must either be null or a function");
                    }
                    subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } });
                    if (superClass) _setPrototypeOf(subClass, superClass);
                  }
                  function _setPrototypeOf(o, p) {
                    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf2(o2, p2) {
                      o2.__proto__ = p2;
                      return o2;
                    };
                    return _setPrototypeOf(o, p);
                  }
                  function _createSuper(Derived) {
                    var hasNativeReflectConstruct = _isNativeReflectConstruct();
                    return function _createSuperInternal() {
                      var Super = _getPrototypeOf(Derived), result;
                      if (hasNativeReflectConstruct) {
                        var NewTarget = _getPrototypeOf(this).constructor;
                        result = Reflect.construct(Super, arguments, NewTarget);
                      } else {
                        result = Super.apply(this, arguments);
                      }
                      return _possibleConstructorReturn(this, result);
                    };
                  }
                  function _possibleConstructorReturn(self, call) {
                    if (call && (clipboard_typeof(call) === "object" || typeof call === "function")) {
                      return call;
                    }
                    return _assertThisInitialized(self);
                  }
                  function _assertThisInitialized(self) {
                    if (self === void 0) {
                      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                    }
                    return self;
                  }
                  function _isNativeReflectConstruct() {
                    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
                    if (Reflect.construct.sham) return false;
                    if (typeof Proxy === "function") return true;
                    try {
                      Date.prototype.toString.call(Reflect.construct(Date, [], function() {
                      }));
                      return true;
                    } catch (e) {
                      return false;
                    }
                  }
                  function _getPrototypeOf(o) {
                    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf2(o2) {
                      return o2.__proto__ || Object.getPrototypeOf(o2);
                    };
                    return _getPrototypeOf(o);
                  }
                  function getAttributeValue(suffix, element) {
                    var attribute = "data-clipboard-".concat(suffix);
                    if (!element.hasAttribute(attribute)) {
                      return;
                    }
                    return element.getAttribute(attribute);
                  }
                  var Clipboard2 = /* @__PURE__ */ function(_Emitter) {
                    _inherits(Clipboard3, _Emitter);
                    var _super = _createSuper(Clipboard3);
                    function Clipboard3(trigger, options) {
                      var _this;
                      _classCallCheck(this, Clipboard3);
                      _this = _super.call(this);
                      _this.resolveOptions(options);
                      _this.listenClick(trigger);
                      return _this;
                    }
                    _createClass(Clipboard3, [{
                      key: "resolveOptions",
                      value: function resolveOptions() {
                        var options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
                        this.action = typeof options.action === "function" ? options.action : this.defaultAction;
                        this.target = typeof options.target === "function" ? options.target : this.defaultTarget;
                        this.text = typeof options.text === "function" ? options.text : this.defaultText;
                        this.container = clipboard_typeof(options.container) === "object" ? options.container : document.body;
                      }
                      /**
                       * Adds a click event listener to the passed trigger.
                       * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
                       */
                    }, {
                      key: "listenClick",
                      value: function listenClick(trigger) {
                        var _this2 = this;
                        this.listener = listen_default()(trigger, "click", function(e) {
                          return _this2.onClick(e);
                        });
                      }
                      /**
                       * Defines a new `ClipboardAction` on each click event.
                       * @param {Event} e
                       */
                    }, {
                      key: "onClick",
                      value: function onClick(e) {
                        var trigger = e.delegateTarget || e.currentTarget;
                        var action = this.action(trigger) || "copy";
                        var text = actions_default({
                          action,
                          container: this.container,
                          target: this.target(trigger),
                          text: this.text(trigger)
                        });
                        this.emit(text ? "success" : "error", {
                          action,
                          text,
                          trigger,
                          clearSelection: function clearSelection() {
                            if (trigger) {
                              trigger.focus();
                            }
                            window.getSelection().removeAllRanges();
                          }
                        });
                      }
                      /**
                       * Default `action` lookup function.
                       * @param {Element} trigger
                       */
                    }, {
                      key: "defaultAction",
                      value: function defaultAction(trigger) {
                        return getAttributeValue("action", trigger);
                      }
                      /**
                       * Default `target` lookup function.
                       * @param {Element} trigger
                       */
                    }, {
                      key: "defaultTarget",
                      value: function defaultTarget(trigger) {
                        var selector = getAttributeValue("target", trigger);
                        if (selector) {
                          return document.querySelector(selector);
                        }
                      }
                      /**
                       * Allow fire programmatically a copy action
                       * @param {String|HTMLElement} target
                       * @param {Object} options
                       * @returns Text copied.
                       */
                    }, {
                      key: "defaultText",
                      /**
                       * Default `text` lookup function.
                       * @param {Element} trigger
                       */
                      value: function defaultText(trigger) {
                        return getAttributeValue("text", trigger);
                      }
                      /**
                       * Destroy lifecycle.
                       */
                    }, {
                      key: "destroy",
                      value: function destroy() {
                        this.listener.destroy();
                      }
                    }], [{
                      key: "copy",
                      value: function copy(target) {
                        var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {
                          container: document.body
                        };
                        return actions_copy(target, options);
                      }
                      /**
                       * Allow fire programmatically a cut action
                       * @param {String|HTMLElement} target
                       * @returns Text cutted.
                       */
                    }, {
                      key: "cut",
                      value: function cut(target) {
                        return actions_cut(target);
                      }
                      /**
                       * Returns the support of the given action, or all actions if no action is
                       * given.
                       * @param {String} [action]
                       */
                    }, {
                      key: "isSupported",
                      value: function isSupported() {
                        var action = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : ["copy", "cut"];
                        var actions = typeof action === "string" ? [action] : action;
                        var support = !!document.queryCommandSupported;
                        actions.forEach(function(action2) {
                          support = support && !!document.queryCommandSupported(action2);
                        });
                        return support;
                      }
                    }]);
                    return Clipboard3;
                  }(tiny_emitter_default());
                  var clipboard2 = Clipboard2;
                }
              ),
              /***/
              828: (
                /***/
                function(module2) {
                  var DOCUMENT_NODE_TYPE = 9;
                  if (typeof Element !== "undefined" && !Element.prototype.matches) {
                    var proto = Element.prototype;
                    proto.matches = proto.matchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector || proto.oMatchesSelector || proto.webkitMatchesSelector;
                  }
                  function closest(element, selector) {
                    while (element && element.nodeType !== DOCUMENT_NODE_TYPE) {
                      if (typeof element.matches === "function" && element.matches(selector)) {
                        return element;
                      }
                      element = element.parentNode;
                    }
                  }
                  module2.exports = closest;
                }
              ),
              /***/
              438: (
                /***/
                function(module2, __unused_webpack_exports, __webpack_require__2) {
                  var closest = __webpack_require__2(828);
                  function _delegate(element, selector, type, callback, useCapture) {
                    var listenerFn = listener.apply(this, arguments);
                    element.addEventListener(type, listenerFn, useCapture);
                    return {
                      destroy: function() {
                        element.removeEventListener(type, listenerFn, useCapture);
                      }
                    };
                  }
                  function delegate(elements, selector, type, callback, useCapture) {
                    if (typeof elements.addEventListener === "function") {
                      return _delegate.apply(null, arguments);
                    }
                    if (typeof type === "function") {
                      return _delegate.bind(null, document).apply(null, arguments);
                    }
                    if (typeof elements === "string") {
                      elements = document.querySelectorAll(elements);
                    }
                    return Array.prototype.map.call(elements, function(element) {
                      return _delegate(element, selector, type, callback, useCapture);
                    });
                  }
                  function listener(element, selector, type, callback) {
                    return function(e) {
                      e.delegateTarget = closest(e.target, selector);
                      if (e.delegateTarget) {
                        callback.call(element, e);
                      }
                    };
                  }
                  module2.exports = delegate;
                }
              ),
              /***/
              879: (
                /***/
                function(__unused_webpack_module, exports2) {
                  exports2.node = function(value) {
                    return value !== void 0 && value instanceof HTMLElement && value.nodeType === 1;
                  };
                  exports2.nodeList = function(value) {
                    var type = Object.prototype.toString.call(value);
                    return value !== void 0 && (type === "[object NodeList]" || type === "[object HTMLCollection]") && "length" in value && (value.length === 0 || exports2.node(value[0]));
                  };
                  exports2.string = function(value) {
                    return typeof value === "string" || value instanceof String;
                  };
                  exports2.fn = function(value) {
                    var type = Object.prototype.toString.call(value);
                    return type === "[object Function]";
                  };
                }
              ),
              /***/
              370: (
                /***/
                function(module2, __unused_webpack_exports, __webpack_require__2) {
                  var is = __webpack_require__2(879);
                  var delegate = __webpack_require__2(438);
                  function listen(target, type, callback) {
                    if (!target && !type && !callback) {
                      throw new Error("Missing required arguments");
                    }
                    if (!is.string(type)) {
                      throw new TypeError("Second argument must be a String");
                    }
                    if (!is.fn(callback)) {
                      throw new TypeError("Third argument must be a Function");
                    }
                    if (is.node(target)) {
                      return listenNode(target, type, callback);
                    } else if (is.nodeList(target)) {
                      return listenNodeList(target, type, callback);
                    } else if (is.string(target)) {
                      return listenSelector(target, type, callback);
                    } else {
                      throw new TypeError("First argument must be a String, HTMLElement, HTMLCollection, or NodeList");
                    }
                  }
                  function listenNode(node, type, callback) {
                    node.addEventListener(type, callback);
                    return {
                      destroy: function() {
                        node.removeEventListener(type, callback);
                      }
                    };
                  }
                  function listenNodeList(nodeList, type, callback) {
                    Array.prototype.forEach.call(nodeList, function(node) {
                      node.addEventListener(type, callback);
                    });
                    return {
                      destroy: function() {
                        Array.prototype.forEach.call(nodeList, function(node) {
                          node.removeEventListener(type, callback);
                        });
                      }
                    };
                  }
                  function listenSelector(selector, type, callback) {
                    return delegate(document.body, selector, type, callback);
                  }
                  module2.exports = listen;
                }
              ),
              /***/
              817: (
                /***/
                function(module2) {
                  function select(element) {
                    var selectedText;
                    if (element.nodeName === "SELECT") {
                      element.focus();
                      selectedText = element.value;
                    } else if (element.nodeName === "INPUT" || element.nodeName === "TEXTAREA") {
                      var isReadOnly = element.hasAttribute("readonly");
                      if (!isReadOnly) {
                        element.setAttribute("readonly", "");
                      }
                      element.select();
                      element.setSelectionRange(0, element.value.length);
                      if (!isReadOnly) {
                        element.removeAttribute("readonly");
                      }
                      selectedText = element.value;
                    } else {
                      if (element.hasAttribute("contenteditable")) {
                        element.focus();
                      }
                      var selection = window.getSelection();
                      var range = document.createRange();
                      range.selectNodeContents(element);
                      selection.removeAllRanges();
                      selection.addRange(range);
                      selectedText = selection.toString();
                    }
                    return selectedText;
                  }
                  module2.exports = select;
                }
              ),
              /***/
              279: (
                /***/
                function(module2) {
                  function E() {
                  }
                  E.prototype = {
                    on: function(name, callback, ctx) {
                      var e = this.e || (this.e = {});
                      (e[name] || (e[name] = [])).push({
                        fn: callback,
                        ctx
                      });
                      return this;
                    },
                    once: function(name, callback, ctx) {
                      var self = this;
                      function listener() {
                        self.off(name, listener);
                        callback.apply(ctx, arguments);
                      }
                      ;
                      listener._ = callback;
                      return this.on(name, listener, ctx);
                    },
                    emit: function(name) {
                      var data = [].slice.call(arguments, 1);
                      var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
                      var i = 0;
                      var len = evtArr.length;
                      for (i; i < len; i++) {
                        evtArr[i].fn.apply(evtArr[i].ctx, data);
                      }
                      return this;
                    },
                    off: function(name, callback) {
                      var e = this.e || (this.e = {});
                      var evts = e[name];
                      var liveEvents = [];
                      if (evts && callback) {
                        for (var i = 0, len = evts.length; i < len; i++) {
                          if (evts[i].fn !== callback && evts[i].fn._ !== callback)
                            liveEvents.push(evts[i]);
                        }
                      }
                      liveEvents.length ? e[name] = liveEvents : delete e[name];
                      return this;
                    }
                  };
                  module2.exports = E;
                  module2.exports.TinyEmitter = E;
                }
              )
              /******/
            };
            var __webpack_module_cache__ = {};
            function __webpack_require__(moduleId) {
              if (__webpack_module_cache__[moduleId]) {
                return __webpack_module_cache__[moduleId].exports;
              }
              var module2 = __webpack_module_cache__[moduleId] = {
                /******/
                // no module.id needed
                /******/
                // no module.loaded needed
                /******/
                exports: {}
                /******/
              };
              __webpack_modules__[moduleId](module2, module2.exports, __webpack_require__);
              return module2.exports;
            }
            !function() {
              __webpack_require__.n = function(module2) {
                var getter = module2 && module2.__esModule ? (
                  /******/
                  function() {
                    return module2["default"];
                  }
                ) : (
                  /******/
                  function() {
                    return module2;
                  }
                );
                __webpack_require__.d(getter, { a: getter });
                return getter;
              };
            }();
            !function() {
              __webpack_require__.d = function(exports2, definition) {
                for (var key in definition) {
                  if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports2, key)) {
                    Object.defineProperty(exports2, key, { enumerable: true, get: definition[key] });
                  }
                }
              };
            }();
            !function() {
              __webpack_require__.o = function(obj, prop) {
                return Object.prototype.hasOwnProperty.call(obj, prop);
              };
            }();
            return __webpack_require__(686);
          }().default
        );
      });
    }
  });

  // <stdin>
  var import_clipboard = __toESM(require_clipboard());
  var pre = document.getElementsByTagName("pre");
  for (i = 0; i < pre.length; ++i) {
    element = pre[i];
    mermaid = element.getElementsByClassName("language-mermaid")[0];
    if (mermaid == null) {
      element.insertAdjacentHTML("afterbegin", '<button class="btn btn-copy"></button>');
    }
  }
  var element;
  var mermaid;
  var i;
  var clipboard = new import_clipboard.default(".btn-copy", {
    target: function(trigger) {
      return trigger.nextElementSibling;
    }
  });
  clipboard.on("success", function(e) {
    e.clearSelection();
  });
  clipboard.on("error", function(e) {
    console.error("Action:", e.action);
    console.error("Trigger:", e.trigger);
  });
})();
/*! Bundled license information:

clipboard/dist/clipboard.js:
  (*!
   * clipboard.js v2.0.11
   * https://clipboardjs.com/
   *
   * Licensed MIT © Zeno Rocha
   *)
*/

;
(() => {
  // node_modules/instant.page/instantpage.js
  var mouseoverTimer;
  var lastTouchTimestamp;
  var prefetches = /* @__PURE__ */ new Set();
  var prefetchElement = document.createElement("link");
  var isSupported = prefetchElement.relList && prefetchElement.relList.supports && prefetchElement.relList.supports("prefetch") && window.IntersectionObserver && "isIntersecting" in IntersectionObserverEntry.prototype;
  var allowQueryString = "instantAllowQueryString" in document.body.dataset;
  var allowExternalLinks = "instantAllowExternalLinks" in document.body.dataset;
  var useWhitelist = "instantWhitelist" in document.body.dataset;
  var mousedownShortcut = "instantMousedownShortcut" in document.body.dataset;
  var DELAY_TO_NOT_BE_CONSIDERED_A_TOUCH_INITIATED_ACTION = 1111;
  var delayOnHover = 65;
  var useMousedown = false;
  var useMousedownOnly = false;
  var useViewport = false;
  if ("instantIntensity" in document.body.dataset) {
    const intensity = document.body.dataset.instantIntensity;
    if (intensity.substr(0, "mousedown".length) == "mousedown") {
      useMousedown = true;
      if (intensity == "mousedown-only") {
        useMousedownOnly = true;
      }
    } else if (intensity.substr(0, "viewport".length) == "viewport") {
      if (!(navigator.connection && (navigator.connection.saveData || navigator.connection.effectiveType && navigator.connection.effectiveType.includes("2g")))) {
        if (intensity == "viewport") {
          if (document.documentElement.clientWidth * document.documentElement.clientHeight < 45e4) {
            useViewport = true;
          }
        } else if (intensity == "viewport-all") {
          useViewport = true;
        }
      }
    } else {
      const milliseconds = parseInt(intensity);
      if (!isNaN(milliseconds)) {
        delayOnHover = milliseconds;
      }
    }
  }
  if (isSupported) {
    const eventListenersOptions = {
      capture: true,
      passive: true
    };
    if (!useMousedownOnly) {
      document.addEventListener("touchstart", touchstartListener, eventListenersOptions);
    }
    if (!useMousedown) {
      document.addEventListener("mouseover", mouseoverListener, eventListenersOptions);
    } else if (!mousedownShortcut) {
      document.addEventListener("mousedown", mousedownListener, eventListenersOptions);
    }
    if (mousedownShortcut) {
      document.addEventListener("mousedown", mousedownShortcutListener, eventListenersOptions);
    }
    if (useViewport) {
      let triggeringFunction;
      if (window.requestIdleCallback) {
        triggeringFunction = (callback) => {
          requestIdleCallback(callback, {
            timeout: 1500
          });
        };
      } else {
        triggeringFunction = (callback) => {
          callback();
        };
      }
      triggeringFunction(() => {
        const intersectionObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const linkElement = entry.target;
              intersectionObserver.unobserve(linkElement);
              preload(linkElement.href);
            }
          });
        });
        document.querySelectorAll("a").forEach((linkElement) => {
          if (isPreloadable(linkElement)) {
            intersectionObserver.observe(linkElement);
          }
        });
      });
    }
  }
  function touchstartListener(event) {
    lastTouchTimestamp = performance.now();
    const linkElement = event.target.closest("a");
    if (!isPreloadable(linkElement)) {
      return;
    }
    preload(linkElement.href);
  }
  function mouseoverListener(event) {
    if (performance.now() - lastTouchTimestamp < DELAY_TO_NOT_BE_CONSIDERED_A_TOUCH_INITIATED_ACTION) {
      return;
    }
    if (!("closest" in event.target)) {
      return;
    }
    const linkElement = event.target.closest("a");
    if (!isPreloadable(linkElement)) {
      return;
    }
    linkElement.addEventListener("mouseout", mouseoutListener, { passive: true });
    mouseoverTimer = setTimeout(() => {
      preload(linkElement.href);
      mouseoverTimer = void 0;
    }, delayOnHover);
  }
  function mousedownListener(event) {
    const linkElement = event.target.closest("a");
    if (!isPreloadable(linkElement)) {
      return;
    }
    preload(linkElement.href);
  }
  function mouseoutListener(event) {
    if (event.relatedTarget && event.target.closest("a") == event.relatedTarget.closest("a")) {
      return;
    }
    if (mouseoverTimer) {
      clearTimeout(mouseoverTimer);
      mouseoverTimer = void 0;
    }
  }
  function mousedownShortcutListener(event) {
    if (performance.now() - lastTouchTimestamp < DELAY_TO_NOT_BE_CONSIDERED_A_TOUCH_INITIATED_ACTION) {
      return;
    }
    const linkElement = event.target.closest("a");
    if (event.which > 1 || event.metaKey || event.ctrlKey) {
      return;
    }
    if (!linkElement) {
      return;
    }
    linkElement.addEventListener("click", function(event2) {
      if (event2.detail == 1337) {
        return;
      }
      event2.preventDefault();
    }, { capture: true, passive: false, once: true });
    const customEvent = new MouseEvent("click", { view: window, bubbles: true, cancelable: false, detail: 1337 });
    linkElement.dispatchEvent(customEvent);
  }
  function isPreloadable(linkElement) {
    if (!linkElement || !linkElement.href) {
      return;
    }
    if (useWhitelist && !("instant" in linkElement.dataset)) {
      return;
    }
    if (!allowExternalLinks && linkElement.origin != location.origin && !("instant" in linkElement.dataset)) {
      return;
    }
    if (!["http:", "https:"].includes(linkElement.protocol)) {
      return;
    }
    if (linkElement.protocol == "http:" && location.protocol == "https:") {
      return;
    }
    if (!allowQueryString && linkElement.search && !("instant" in linkElement.dataset)) {
      return;
    }
    if (linkElement.hash && linkElement.pathname + linkElement.search == location.pathname + location.search) {
      return;
    }
    if ("noInstant" in linkElement.dataset) {
      return;
    }
    return true;
  }
  function preload(url) {
    if (prefetches.has(url)) {
      return;
    }
    const prefetcher = document.createElement("link");
    prefetcher.rel = "prefetch";
    prefetcher.href = url;
    document.head.appendChild(prefetcher);
    prefetches.add(url);
  }
})();
/*! Bundled license information:

instant.page/instantpage.js:
  (*! instant.page v5.1.1 - (C) 2019-2020 Alexandre Dieulot - https://instant.page/license *)
*/

;
/**!
 * FlexSearch.js v0.7.31 (Bundle)
 * Copyright 2018-2022 Nextapps GmbH
 * Author: Thomas Wilkerling
 * Licence: Apache-2.0
 * https://github.com/nextapps-de/flexsearch
 */
(function _f(self){'use strict';try{if(module)self=module}catch(e){}self._factory=_f;var t;function u(a){return"undefined"!==typeof a?a:!0}function aa(a){const b=Array(a);for(let c=0;c<a;c++)b[c]=v();return b}function v(){return Object.create(null)}function ba(a,b){return b.length-a.length}function x(a){return"string"===typeof a}function C(a){return"object"===typeof a}function D(a){return"function"===typeof a};function ca(a,b){var c=da;if(a&&(b&&(a=E(a,b)),this.H&&(a=E(a,this.H)),this.J&&1<a.length&&(a=E(a,this.J)),c||""===c)){a=a.split(c);if(this.filter){b=this.filter;c=a.length;const d=[];for(let e=0,f=0;e<c;e++){const g=a[e];g&&!b[g]&&(d[f++]=g)}a=d}return a}return a}const da=/[\p{Z}\p{S}\p{P}\p{C}]+/u,ea=/[\u0300-\u036f]/g;
function fa(a,b){const c=Object.keys(a),d=c.length,e=[];let f="",g=0;for(let h=0,k,m;h<d;h++)k=c[h],(m=a[k])?(e[g++]=F(b?"(?!\\b)"+k+"(\\b|_)":k),e[g++]=m):f+=(f?"|":"")+k;f&&(e[g++]=F(b?"(?!\\b)("+f+")(\\b|_)":"("+f+")"),e[g]="");return e}function E(a,b){for(let c=0,d=b.length;c<d&&(a=a.replace(b[c],b[c+1]),a);c+=2);return a}function F(a){return new RegExp(a,"g")}function ha(a){let b="",c="";for(let d=0,e=a.length,f;d<e;d++)(f=a[d])!==c&&(b+=c=f);return b};var ja={encode:ia,F:!1,G:""};function ia(a){return ca.call(this,(""+a).toLowerCase(),!1)};const ka={},G={};function la(a){I(a,"add");I(a,"append");I(a,"search");I(a,"update");I(a,"remove")}function I(a,b){a[b+"Async"]=function(){const c=this,d=arguments;var e=d[d.length-1];let f;D(e)&&(f=e,delete d[d.length-1]);e=new Promise(function(g){setTimeout(function(){c.async=!0;const h=c[b].apply(c,d);c.async=!1;g(h)})});return f?(e.then(f),this):e}};function ma(a,b,c,d){const e=a.length;let f=[],g,h,k=0;d&&(d=[]);for(let m=e-1;0<=m;m--){const n=a[m],w=n.length,q=v();let r=!g;for(let l=0;l<w;l++){const p=n[l],z=p.length;if(z)for(let B=0,A,y;B<z;B++)if(y=p[B],g){if(g[y]){if(!m)if(c)c--;else if(f[k++]=y,k===b)return f;if(m||d)q[y]=1;r=!0}if(d&&(A=(h[y]||0)+1,h[y]=A,A<e)){const H=d[A-2]||(d[A-2]=[]);H[H.length]=y}}else q[y]=1}if(d)g||(h=q);else if(!r)return[];g=q}if(d)for(let m=d.length-1,n,w;0<=m;m--){n=d[m];w=n.length;for(let q=0,r;q<w;q++)if(r=
n[q],!g[r]){if(c)c--;else if(f[k++]=r,k===b)return f;g[r]=1}}return f}function na(a,b){const c=v(),d=v(),e=[];for(let f=0;f<a.length;f++)c[a[f]]=1;for(let f=0,g;f<b.length;f++){g=b[f];for(let h=0,k;h<g.length;h++)k=g[h],c[k]&&!d[k]&&(d[k]=1,e[e.length]=k)}return e};function J(a){this.l=!0!==a&&a;this.cache=v();this.h=[]}function oa(a,b,c){C(a)&&(a=a.query);let d=this.cache.get(a);d||(d=this.search(a,b,c),this.cache.set(a,d));return d}J.prototype.set=function(a,b){if(!this.cache[a]){var c=this.h.length;c===this.l?delete this.cache[this.h[c-1]]:c++;for(--c;0<c;c--)this.h[c]=this.h[c-1];this.h[0]=a}this.cache[a]=b};J.prototype.get=function(a){const b=this.cache[a];if(this.l&&b&&(a=this.h.indexOf(a))){const c=this.h[a-1];this.h[a-1]=this.h[a];this.h[a]=c}return b};const qa={memory:{charset:"latin:extra",D:3,B:4,m:!1},performance:{D:3,B:3,s:!1,context:{depth:2,D:1}},match:{charset:"latin:extra",G:"reverse"},score:{charset:"latin:advanced",D:20,B:3,context:{depth:3,D:9}},"default":{}};function ra(a,b,c,d,e,f,g){setTimeout(function(){const h=a(c?c+"."+d:d,JSON.stringify(g));h&&h.then?h.then(function(){b.export(a,b,c,e,f+1)}):b.export(a,b,c,e,f+1)})};function K(a,b){if(!(this instanceof K))return new K(a);var c;if(a){x(a)?a=qa[a]:(c=a.preset)&&(a=Object.assign({},c[c],a));c=a.charset;var d=a.lang;x(c)&&(-1===c.indexOf(":")&&(c+=":default"),c=G[c]);x(d)&&(d=ka[d])}else a={};let e,f,g=a.context||{};this.encode=a.encode||c&&c.encode||ia;this.register=b||v();this.D=e=a.resolution||9;this.G=b=c&&c.G||a.tokenize||"strict";this.depth="strict"===b&&g.depth;this.l=u(g.bidirectional);this.s=f=u(a.optimize);this.m=u(a.fastupdate);this.B=a.minlength||1;this.C=
a.boost;this.map=f?aa(e):v();this.A=e=g.resolution||1;this.h=f?aa(e):v();this.F=c&&c.F||a.rtl;this.H=(b=a.matcher||d&&d.H)&&fa(b,!1);this.J=(b=a.stemmer||d&&d.J)&&fa(b,!0);if(c=b=a.filter||d&&d.filter){c=b;d=v();for(let h=0,k=c.length;h<k;h++)d[c[h]]=1;c=d}this.filter=c;this.cache=(b=a.cache)&&new J(b)}t=K.prototype;t.append=function(a,b){return this.add(a,b,!0)};
t.add=function(a,b,c,d){if(b&&(a||0===a)){if(!d&&!c&&this.register[a])return this.update(a,b);b=this.encode(b);if(d=b.length){const m=v(),n=v(),w=this.depth,q=this.D;for(let r=0;r<d;r++){let l=b[this.F?d-1-r:r];var e=l.length;if(l&&e>=this.B&&(w||!n[l])){var f=L(q,d,r),g="";switch(this.G){case "full":if(2<e){for(f=0;f<e;f++)for(var h=e;h>f;h--)if(h-f>=this.B){var k=L(q,d,r,e,f);g=l.substring(f,h);M(this,n,g,k,a,c)}break}case "reverse":if(1<e){for(h=e-1;0<h;h--)g=l[h]+g,g.length>=this.B&&M(this,n,
g,L(q,d,r,e,h),a,c);g=""}case "forward":if(1<e){for(h=0;h<e;h++)g+=l[h],g.length>=this.B&&M(this,n,g,f,a,c);break}default:if(this.C&&(f=Math.min(f/this.C(b,l,r)|0,q-1)),M(this,n,l,f,a,c),w&&1<d&&r<d-1)for(e=v(),g=this.A,f=l,h=Math.min(w+1,d-r),e[f]=1,k=1;k<h;k++)if((l=b[this.F?d-1-r-k:r+k])&&l.length>=this.B&&!e[l]){e[l]=1;const p=this.l&&l>f;M(this,m,p?f:l,L(g+(d/2>g?0:1),d,r,h-1,k-1),a,c,p?l:f)}}}}this.m||(this.register[a]=1)}}return this};
function L(a,b,c,d,e){return c&&1<a?b+(d||0)<=a?c+(e||0):(a-1)/(b+(d||0))*(c+(e||0))+1|0:0}function M(a,b,c,d,e,f,g){let h=g?a.h:a.map;if(!b[c]||g&&!b[c][g])a.s&&(h=h[d]),g?(b=b[c]||(b[c]=v()),b[g]=1,h=h[g]||(h[g]=v())):b[c]=1,h=h[c]||(h[c]=[]),a.s||(h=h[d]||(h[d]=[])),f&&h.includes(e)||(h[h.length]=e,a.m&&(a=a.register[e]||(a.register[e]=[]),a[a.length]=h))}
t.search=function(a,b,c){c||(!b&&C(a)?(c=a,a=c.query):C(b)&&(c=b));let d=[],e;let f,g=0;if(c){a=c.query||a;b=c.limit;g=c.offset||0;var h=c.context;f=c.suggest}if(a&&(a=this.encode(""+a),e=a.length,1<e)){c=v();var k=[];for(let n=0,w=0,q;n<e;n++)if((q=a[n])&&q.length>=this.B&&!c[q])if(this.s||f||this.map[q])k[w++]=q,c[q]=1;else return d;a=k;e=a.length}if(!e)return d;b||(b=100);h=this.depth&&1<e&&!1!==h;c=0;let m;h?(m=a[0],c=1):1<e&&a.sort(ba);for(let n,w;c<e;c++){w=a[c];h?(n=sa(this,d,f,b,g,2===e,w,
m),f&&!1===n&&d.length||(m=w)):n=sa(this,d,f,b,g,1===e,w);if(n)return n;if(f&&c===e-1){k=d.length;if(!k){if(h){h=0;c=-1;continue}return d}if(1===k)return ta(d[0],b,g)}}return ma(d,b,g,f)};
function sa(a,b,c,d,e,f,g,h){let k=[],m=h?a.h:a.map;a.s||(m=ua(m,g,h,a.l));if(m){let n=0;const w=Math.min(m.length,h?a.A:a.D);for(let q=0,r=0,l,p;q<w;q++)if(l=m[q])if(a.s&&(l=ua(l,g,h,a.l)),e&&l&&f&&(p=l.length,p<=e?(e-=p,l=null):(l=l.slice(e),e=0)),l&&(k[n++]=l,f&&(r+=l.length,r>=d)))break;if(n){if(f)return ta(k,d,0);b[b.length]=k;return}}return!c&&k}function ta(a,b,c){a=1===a.length?a[0]:[].concat.apply([],a);return c||a.length>b?a.slice(c,c+b):a}
function ua(a,b,c,d){c?(d=d&&b>c,a=(a=a[d?b:c])&&a[d?c:b]):a=a[b];return a}t.contain=function(a){return!!this.register[a]};t.update=function(a,b){return this.remove(a).add(a,b)};
t.remove=function(a,b){const c=this.register[a];if(c){if(this.m)for(let d=0,e;d<c.length;d++)e=c[d],e.splice(e.indexOf(a),1);else N(this.map,a,this.D,this.s),this.depth&&N(this.h,a,this.A,this.s);b||delete this.register[a];if(this.cache){b=this.cache;for(let d=0,e,f;d<b.h.length;d++)f=b.h[d],e=b.cache[f],e.includes(a)&&(b.h.splice(d--,1),delete b.cache[f])}}return this};
function N(a,b,c,d,e){let f=0;if(a.constructor===Array)if(e)b=a.indexOf(b),-1!==b?1<a.length&&(a.splice(b,1),f++):f++;else{e=Math.min(a.length,c);for(let g=0,h;g<e;g++)if(h=a[g])f=N(h,b,c,d,e),d||f||delete a[g]}else for(let g in a)(f=N(a[g],b,c,d,e))||delete a[g];return f}t.searchCache=oa;
t.export=function(a,b,c,d,e){let f,g;switch(e||(e=0)){case 0:f="reg";if(this.m){g=v();for(let h in this.register)g[h]=1}else g=this.register;break;case 1:f="cfg";g={doc:0,opt:this.s?1:0};break;case 2:f="map";g=this.map;break;case 3:f="ctx";g=this.h;break;default:return}ra(a,b||this,c,f,d,e,g);return!0};t.import=function(a,b){if(b)switch(x(b)&&(b=JSON.parse(b)),a){case "cfg":this.s=!!b.opt;break;case "reg":this.m=!1;this.register=b;break;case "map":this.map=b;break;case "ctx":this.h=b}};la(K.prototype);function va(a){a=a.data;var b=self._index;const c=a.args;var d=a.task;switch(d){case "init":d=a.options||{};a=a.factory;b=d.encode;d.cache=!1;b&&0===b.indexOf("function")&&(d.encode=Function("return "+b)());a?(Function("return "+a)()(self),self._index=new self.FlexSearch.Index(d),delete self.FlexSearch):self._index=new K(d);break;default:a=a.id,b=b[d].apply(b,c),postMessage("search"===d?{id:a,msg:b}:{id:a})}};let wa=0;function O(a){if(!(this instanceof O))return new O(a);var b;a?D(b=a.encode)&&(a.encode=b.toString()):a={};(b=(self||window)._factory)&&(b=b.toString());const c="undefined"===typeof window&&self.exports,d=this;this.o=xa(b,c,a.worker);this.h=v();if(this.o){if(c)this.o.on("message",function(e){d.h[e.id](e.msg);delete d.h[e.id]});else this.o.onmessage=function(e){e=e.data;d.h[e.id](e.msg);delete d.h[e.id]};this.o.postMessage({task:"init",factory:b,options:a})}}P("add");P("append");P("search");
P("update");P("remove");function P(a){O.prototype[a]=O.prototype[a+"Async"]=function(){const b=this,c=[].slice.call(arguments);var d=c[c.length-1];let e;D(d)&&(e=d,c.splice(c.length-1,1));d=new Promise(function(f){setTimeout(function(){b.h[++wa]=f;b.o.postMessage({task:a,id:wa,args:c})})});return e?(d.then(e),this):d}}
function xa(a,b,c){let d;try{d=b?eval('new (require("worker_threads")["Worker"])("../dist/node/node.js")'):a?new Worker(URL.createObjectURL(new Blob(["onmessage="+va.toString()],{type:"text/javascript"}))):new Worker(x(c)?c:"worker/worker.js",{type:"module"})}catch(e){}return d};function Q(a){if(!(this instanceof Q))return new Q(a);var b=a.document||a.doc||a,c;this.K=[];this.h=[];this.A=[];this.register=v();this.key=(c=b.key||b.id)&&S(c,this.A)||"id";this.m=u(a.fastupdate);this.C=(c=b.store)&&!0!==c&&[];this.store=c&&v();this.I=(c=b.tag)&&S(c,this.A);this.l=c&&v();this.cache=(c=a.cache)&&new J(c);a.cache=!1;this.o=a.worker;this.async=!1;c=v();let d=b.index||b.field||b;x(d)&&(d=[d]);for(let e=0,f,g;e<d.length;e++)f=d[e],x(f)||(g=f,f=f.field),g=C(g)?Object.assign({},a,g):a,
this.o&&(c[f]=new O(g),c[f].o||(this.o=!1)),this.o||(c[f]=new K(g,this.register)),this.K[e]=S(f,this.A),this.h[e]=f;if(this.C)for(a=b.store,x(a)&&(a=[a]),b=0;b<a.length;b++)this.C[b]=S(a[b],this.A);this.index=c}function S(a,b){const c=a.split(":");let d=0;for(let e=0;e<c.length;e++)a=c[e],0<=a.indexOf("[]")&&(a=a.substring(0,a.length-2))&&(b[d]=!0),a&&(c[d++]=a);d<c.length&&(c.length=d);return 1<d?c:c[0]}function T(a,b){if(x(b))a=a[b];else for(let c=0;a&&c<b.length;c++)a=a[b[c]];return a}
function U(a,b,c,d,e){a=a[e];if(d===c.length-1)b[e]=a;else if(a)if(a.constructor===Array)for(b=b[e]=Array(a.length),e=0;e<a.length;e++)U(a,b,c,d,e);else b=b[e]||(b[e]=v()),e=c[++d],U(a,b,c,d,e)}function V(a,b,c,d,e,f,g,h){if(a=a[g])if(d===b.length-1){if(a.constructor===Array){if(c[d]){for(b=0;b<a.length;b++)e.add(f,a[b],!0,!0);return}a=a.join(" ")}e.add(f,a,h,!0)}else if(a.constructor===Array)for(g=0;g<a.length;g++)V(a,b,c,d,e,f,g,h);else g=b[++d],V(a,b,c,d,e,f,g,h)}t=Q.prototype;
t.add=function(a,b,c){C(a)&&(b=a,a=T(b,this.key));if(b&&(a||0===a)){if(!c&&this.register[a])return this.update(a,b);for(let d=0,e,f;d<this.h.length;d++)f=this.h[d],e=this.K[d],x(e)&&(e=[e]),V(b,e,this.A,0,this.index[f],a,e[0],c);if(this.I){let d=T(b,this.I),e=v();x(d)&&(d=[d]);for(let f=0,g,h;f<d.length;f++)if(g=d[f],!e[g]&&(e[g]=1,h=this.l[g]||(this.l[g]=[]),!c||!h.includes(a)))if(h[h.length]=a,this.m){const k=this.register[a]||(this.register[a]=[]);k[k.length]=h}}if(this.store&&(!c||!this.store[a])){let d;
if(this.C){d=v();for(let e=0,f;e<this.C.length;e++)f=this.C[e],x(f)?d[f]=b[f]:U(b,d,f,0,f[0])}this.store[a]=d||b}}return this};t.append=function(a,b){return this.add(a,b,!0)};t.update=function(a,b){return this.remove(a).add(a,b)};
t.remove=function(a){C(a)&&(a=T(a,this.key));if(this.register[a]){for(var b=0;b<this.h.length&&(this.index[this.h[b]].remove(a,!this.o),!this.m);b++);if(this.I&&!this.m)for(let c in this.l){b=this.l[c];const d=b.indexOf(a);-1!==d&&(1<b.length?b.splice(d,1):delete this.l[c])}this.store&&delete this.store[a];delete this.register[a]}return this};
t.search=function(a,b,c,d){c||(!b&&C(a)?(c=a,a=""):C(b)&&(c=b,b=0));let e=[],f=[],g,h,k,m,n,w,q=0;if(c)if(c.constructor===Array)k=c,c=null;else{a=c.query||a;k=(g=c.pluck)||c.index||c.field;m=c.tag;h=this.store&&c.enrich;n="and"===c.bool;b=c.limit||b||100;w=c.offset||0;if(m&&(x(m)&&(m=[m]),!a)){for(let l=0,p;l<m.length;l++)if(p=ya.call(this,m[l],b,w,h))e[e.length]=p,q++;return q?e:[]}x(k)&&(k=[k])}k||(k=this.h);n=n&&(1<k.length||m&&1<m.length);const r=!d&&(this.o||this.async)&&[];for(let l=0,p,z,B;l<
k.length;l++){let A;z=k[l];x(z)||(A=z,z=A.field,a=A.query||a,b=A.limit||b);if(r)r[l]=this.index[z].searchAsync(a,b,A||c);else{d?p=d[l]:p=this.index[z].search(a,b,A||c);B=p&&p.length;if(m&&B){const y=[];let H=0;n&&(y[0]=[p]);for(let X=0,pa,R;X<m.length;X++)if(pa=m[X],B=(R=this.l[pa])&&R.length)H++,y[y.length]=n?[R]:R;H&&(p=n?ma(y,b||100,w||0):na(p,y),B=p.length)}if(B)f[q]=z,e[q++]=p;else if(n)return[]}}if(r){const l=this;return new Promise(function(p){Promise.all(r).then(function(z){p(l.search(a,b,
c,z))})})}if(!q)return[];if(g&&(!h||!this.store))return e[0];for(let l=0,p;l<f.length;l++){p=e[l];p.length&&h&&(p=za.call(this,p));if(g)return p;e[l]={field:f[l],result:p}}return e};function ya(a,b,c,d){let e=this.l[a],f=e&&e.length-c;if(f&&0<f){if(f>b||c)e=e.slice(c,c+b);d&&(e=za.call(this,e));return{tag:a,result:e}}}function za(a){const b=Array(a.length);for(let c=0,d;c<a.length;c++)d=a[c],b[c]={id:d,doc:this.store[d]};return b}t.contain=function(a){return!!this.register[a]};t.get=function(a){return this.store[a]};
t.set=function(a,b){this.store[a]=b;return this};t.searchCache=oa;t.export=function(a,b,c,d,e){e||(e=0);d||(d=0);if(d<this.h.length){const f=this.h[d],g=this.index[f];b=this;setTimeout(function(){g.export(a,b,e?f:"",d,e++)||(d++,e=1,b.export(a,b,f,d,e))})}else{let f,g;switch(e){case 1:f="tag";g=this.l;break;case 2:f="store";g=this.store;break;default:return}ra(a,this,c,f,d,e,g)}};
t.import=function(a,b){if(b)switch(x(b)&&(b=JSON.parse(b)),a){case "tag":this.l=b;break;case "reg":this.m=!1;this.register=b;for(let d=0,e;d<this.h.length;d++)e=this.index[this.h[d]],e.register=b,e.m=!1;break;case "store":this.store=b;break;default:a=a.split(".");const c=a[0];a=a[1];c&&a&&this.index[c].import(a,b)}};la(Q.prototype);var Ba={encode:Aa,F:!1,G:""};const Ca=[F("[\u00e0\u00e1\u00e2\u00e3\u00e4\u00e5]"),"a",F("[\u00e8\u00e9\u00ea\u00eb]"),"e",F("[\u00ec\u00ed\u00ee\u00ef]"),"i",F("[\u00f2\u00f3\u00f4\u00f5\u00f6\u0151]"),"o",F("[\u00f9\u00fa\u00fb\u00fc\u0171]"),"u",F("[\u00fd\u0177\u00ff]"),"y",F("\u00f1"),"n",F("[\u00e7c]"),"k",F("\u00df"),"s",F(" & ")," and "];function Aa(a){var b=a=""+a;b.normalize&&(b=b.normalize("NFD").replace(ea,""));return ca.call(this,b.toLowerCase(),!a.normalize&&Ca)};var Ea={encode:Da,F:!1,G:"strict"};const Fa=/[^a-z0-9]+/,Ga={b:"p",v:"f",w:"f",z:"s",x:"s","\u00df":"s",d:"t",n:"m",c:"k",g:"k",j:"k",q:"k",i:"e",y:"e",u:"o"};function Da(a){a=Aa.call(this,a).join(" ");const b=[];if(a){const c=a.split(Fa),d=c.length;for(let e=0,f,g=0;e<d;e++)if((a=c[e])&&(!this.filter||!this.filter[a])){f=a[0];let h=Ga[f]||f,k=h;for(let m=1;m<a.length;m++){f=a[m];const n=Ga[f]||f;n&&n!==k&&(h+=n,k=n)}b[g++]=h}}return b};var Ia={encode:Ha,F:!1,G:""};const Ja=[F("ae"),"a",F("oe"),"o",F("sh"),"s",F("th"),"t",F("ph"),"f",F("pf"),"f",F("(?![aeo])h(?![aeo])"),"",F("(?!^[aeo])h(?!^[aeo])"),""];function Ha(a,b){a&&(a=Da.call(this,a).join(" "),2<a.length&&(a=E(a,Ja)),b||(1<a.length&&(a=ha(a)),a&&(a=a.split(" "))));return a||[]};var La={encode:Ka,F:!1,G:""};const Ma=F("(?!\\b)[aeo]");function Ka(a){a&&(a=Ha.call(this,a,!0),1<a.length&&(a=a.replace(Ma,"")),1<a.length&&(a=ha(a)),a&&(a=a.split(" ")));return a||[]};G["latin:default"]=ja;G["latin:simple"]=Ba;G["latin:balance"]=Ea;G["latin:advanced"]=Ia;G["latin:extra"]=La;const W=self;let Y;const Z={Index:K,Document:Q,Worker:O,registerCharset:function(a,b){G[a]=b},registerLanguage:function(a,b){ka[a]=b}};(Y=W.define)&&Y.amd?Y([],function(){return Z}):W.exports?W.exports=Z:W.FlexSearch=Z;}(this));

;
(() => {
  // <stdin>
  if (document.querySelector("#sidebar-default") !== null) {
    let sidebar = document.getElementById("sidebar-default");
    let pos = sessionStorage.getItem("sidebar-scroll");
    if (pos !== null) {
      sidebar.scrollTop = parseInt(pos, 10);
    }
    window.addEventListener("beforeunload", () => {
      sessionStorage.setItem("sidebar-scroll", sidebar.scrollTop);
    });
  }
})();
