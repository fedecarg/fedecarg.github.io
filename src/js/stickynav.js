/*!============================================================
 * stickynav.js
 * Copyright (c) 2018 Federico Cargnelutti <fedecarg@gmail.com>
 * http://www.fedecarg.com/
 ============================================================*/

(function($) {

  $.fn.stickynav = function(options) {

    const DEFAULT_SELECTORS = {
      navContainerSelector: 'header',        // Nav container id, class or tag selector
      navActiveClass:       'nav--active',   // Selected nav item modifier class
      navStickyClass:       'nav--sticky',   // Sticky nav modifier class
      sectionSelector:      'section'        // Section id, class or tag selector
    };

    // Merge options with defaults
    const selectors = $.extend({}, DEFAULT_SELECTORS, options);

    // Set jQuery DOM elements
    const $nav = this;
    const $navContainer = selectors.navContainerSelector ? $(selectors.navContainerSelector) : $nav;
    const $navLinks = $nav.find('a');
    const $sections = $(selectors.sectionSelector);

    const navHeight = $navContainer.height();
    const scrollTopOffset = $sections.first().height() / 2;

    let currentScrollPosition = 0;
    let sectionOffsetArray = [];


    function initialise() {
      calculateOffsets();
      bindEvents();
    }

    function bindEvents() {
      $navLinks.on('click', onClick);
      $(window).on('scroll', throttle(onScroll, 50));
    }

    function onClick(e) {
      e.preventDefault();
      const targetEl = $(this).attr('href');

      if ($(targetEl).length) {
        selectNavItem(this);

        if (window.scroll) {
          window.scroll({
            top: $(targetEl).offset().top - navHeight,
            left: 0,
            behavior: 'smooth'
          });
        } else {
          $('html, body').animate({
            scrollTop: $(targetEl).offset().top - navHeight
          });
        }
      }
    }

    function onScroll() {
      const scrollTop = $(document).scrollTop() + navHeight;
      const closestPosition = findClosestNumber(scrollTop, sectionOffsetArray);

      // select navbar item
      if (closestPosition !== currentScrollPosition) {
        selectNavItem('.section-offset-' + closestPosition);
        currentScrollPosition = closestPosition;
      }

      // fix navbar
      if (scrollTop > scrollTopOffset) {
        $navContainer.addClass(selectors.navStickyClass);
      } else {
        $navContainer.removeClass(selectors.navStickyClass);
      }
    }

    function calculateOffsets() {
      $sections.each(function(index) {
        const el = $(this)[0];
        const offsetTop = getOffsetTop(el);

        sectionOffsetArray.push(offsetTop);
        getNavItem(el).addClass('section-offset-' + offsetTop);
      });
    }

    function getOffsetTop(el) {
        const rect = el.getBoundingClientRect(),
              scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        return Math.round(rect.top + scrollTop);
    }

    function getNavItem(el) {
      return $('nav a[href="#' + $(el).attr('id') + '"]');
    }

    function selectNavItem(el) {
      if (!$navContainer.hasClass(selectors.navStickyClass)) {
        $navContainer.addClass(selectors.navStickyClass);
      }

      $navLinks.removeClass(selectors.navActiveClass);
      $(el).addClass(selectors.navActiveClass);
    }

    function findClosestNumber(num, arr) {
      return arr.reduce(function(prev, curr) {
        return (Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev);
      });
    }

    function throttle(func, delay) {
      let timer = 0;

      return function() {
        const context = this,
        args = [].slice.call(arguments);

        clearTimeout(timer);
        timer = setTimeout(function() {
          func.apply(context, args);
        }, delay);
      };
    }

    initialise();
  };

}(jQuery));