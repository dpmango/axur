$(document).ready(function(){

  //////////
  // Global variables
  //////////

  var _window = $(window);
  var _document = $(document);

  ////////////
  // READY - triggered when PJAX DONE
  ////////////
  function pageReady(){
    // layout
    legacySupport();
    initTeleport(); // teleport first because might be a time-lag for next func
    // initTypograph();
    closeAllActives(); // close all hamburgers, menus, etc.
    updateHeaderActiveClass(); // set is-active class for header nav
    // initHeaderScroll();
    adjustAsyncLayout(); // set padding-left|right for async layout
    _window.on('resize', debounce(adjustAsyncLayout, 100));
    stickyBgElements(); // adjust svg bg elements positions
    _window.on('resize', debounce(stickyBgElements, 100))

    // functional
    initSliders();
    initPopups();
    initSvgAnimations();
    initSticky();
    initTypewriter(); // typewriter (i.e hero section)

    // ui
    initMasks();
    initSelectric();

    // extra stuff
    // initLazyLoad();
    // initPerfectScrollbar();
    initScrollMonitor();
    initValidations();

    initMap();

    // development helper
    _window.on('resize', debounce(setBreakpoint, 200))

  }

  // this is a master function which should have all functionality
  pageReady();


  // some plugins work best with onload triggers
  _window.on('load', function(){
    // your functions
  })


  //////////
  // COMMON
  //////////

  function legacySupport(){
    // svg support for laggy browsers
    svg4everybody();

    // Viewport units buggyfill
    window.viewportUnitsBuggyfill.init({
      force: false,
      refreshDebounceWait: 150,
      appendToBody: true
    });
  }

  function initTypograph(){
    var tp = new Typograf({
      locale: ['es']
    });
    var elem = document.querySelector('.page__content');
    elem.innerHTML = tp.execute(elem.innerHTML);
  }


  // detectors
  function isRetinaDisplay() {
    if (window.matchMedia) {
        var mq = window.matchMedia("only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)");
        return (mq && mq.matches || (window.devicePixelRatio > 1));
    }
  }

  function isMobile(){
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
      return true
    } else {
      return false
    }
  }

  function msieversion() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
      return true
    } else {
      return false
    }
  }

  if ( msieversion() ){
    $('body').addClass('is-ie');
  }

  if ( isMobile() ){
    $('body').addClass('is-mobile');
  }

  //////////////////
  // CLICK HANDLERS, (etc)
  /////////////////

  // Prevent # behavior
	_document
    .on('click', '[href="#"]', function(e) {
      e.preventDefault();
    })
    .on('click', '[data-href]', function(e) {
      e.preventDefault();
      e.stopPropogation();

      window.location.href = $(this).data('href')
    })

  // Menu controls
  _document
    .on('click', '[js-toggle-menu]', function(){
      var target = $(this).data('target-menu')
      toggleMenu(target);
    })
    .on('click', '[js-close-menu]', function(){
      var target = $(this).closest('.menu').data('menu')
      closeMenu(target);
    })
    .on('click', function(e){
      var $target = $(e.target);
      if (
        !$target.closest('.menu').length > 0 &&
        !$target.closest('.header').length > 0
      ){
        closeAllMenus();
      }
    })

  function toggleMenu(name){
    var target = $('[data-menu="'+name+'"]');
    if ( target ){
      $('[data-target-menu]').toggleClass('is-active');
      target.toggleClass('is-active');
      $('.page').toggleClass('is-muted');
      $('.header').toggleClass('is-menu-opened');
    }

    var $fixer = $('a[js-toggle-menu]');
    var fixPos = $fixer.offset().left + ($fixer.width() / 2)
    $('[js-triangle-fix]').css({
      'left': fixPos
    })
  }

  function closeMenu(name){
    var target = $('[data-menu="'+name+'"]');
    if ( target ){
      $('[data-target-menu]').toggleClass('is-active');
      target.toggleClass('is-active');
      $('.page').removeClass('is-muted');
      $('.header').removeClass('is-menu-opened');
    }
  }

  function closeAllMenus(){
    $('[data-target-menu]').removeClass('is-active');
    $('[data-menu]').removeClass('is-active');
    $('.page').removeClass('is-muted');
    $('.header').removeClass('is-menu-opened');
  }

  // Footer mobile toggler controls
  _document
    .on('click', '[js-footer-mobile-toggler]', function(){
      var menu = $(this).parent();
      var menuElements = menu.find('.footer__menu, p')
      menu.toggleClass('is-active');

      menuElements.slideToggle();
    })

  // when going from mobile to desktop
  // - reset all classes from toggler
  function resetFooterNav(){
    if ( _window.width() > 768 ){
      var menuElements = $('.footer').find('.footer__menu, p');
      menuElements.attr("style", " ");
      $('.footer__navi-col, .footer__contacts').removeClass('is-active');
    }
  }
  _window.on('resize', debounce(resetFooterNav, 100));

  // master function to close everything
  // specially usefull for barba page transitions
  function closeAllActives(){
    closeAllMenus();
  }


  // faq toggler
  _document
    .on('click', '[js-faq-toggler]', function(){
      var panel = $(this).parent();
      var panelSiblings = panel.siblings();
      var panelContent = panel.find('.panel__content');

      // accardeon
      panelSiblings.find('.panel__content').hide();
      panelSiblings.removeClass('is-active');

      if ( panel.is('.is-active') ){
        panelContent.fadeOut();
        panel.removeClass('is-active');
      } else {
        panelContent.fadeIn();
        panel.addClass('is-active');
      }
    })

  // plans toggler
  _document
    .on('click', '[js-select-plan] label, [js-select-plan] .plans__switch-toggle', function(){
      var $this = $(this);
      var $plansContainer = $this.closest('[js-plans-container]');
      var $relatedCards = $plansContainer.find('.plan-card');
      var $switchSelect = $this.closest('[js-select-plan]');
      var $toggle = $switchSelect.find('.plans__switch-toggle');
      var $labels = $switchSelect.find('label');
      var discountPerYear = 15;
      var dataAllowed = $switchSelect.data('allowed').split(';');

      // dynamic variables
      var inputValue, moveDirection;

      if ( $this.is('label') ){
        if ( $this.index() == 1 ){
          moveDirection = "left"
        } else if ( $this.index() == 3 ){
          moveDirection = "right"
        }
      } else {
        if ( $toggle.is('.move-right') ){
          moveDirection = "left"
        } else {
          moveDirection = "right"
        }
      }

      // update toggle
      if ( moveDirection === "left" ){
        $toggle.removeClass('move-right').addClass('move-left');

        $($labels[0]).addClass('is-active');
        $($labels[1]).removeClass('is-active');

        $switchSelect.find('input[type="hidden"]').val(dataAllowed[0]);

      } else if ( moveDirection === "right" ){
        $toggle.removeClass('move-left').addClass('move-right');

        $($labels[0]).removeClass('is-active');
        $($labels[1]).addClass('is-active');

        $switchSelect.find('input[type="hidden"]').val(dataAllowed[1]);
      }

      // change price on the cards
      $relatedCards.each(function(i, card){
        var $card = $(card);
        var $price = $card.find('.plan-card__price-num');
        var $priceVal = $price.find('span:first-child');
        // var $pricePer = $price.find('span:last-child');

        // R$1.200
        if ( moveDirection === "left" ){
          $priceVal.html( $priceVal.data('per-month')  )
        } else if ( moveDirection == "right" ){
          $priceVal.html( $priceVal.data('per-year')  )
        }

      })
    })


  // header lang mouseover
  _document
    .on('mouseenter', '.header__lang a', function(){
      var siblings = $(this).parent().siblings()
      var $this = $(this)

      $.each(siblings, function(i,el){
        if ( $(el).data('lang') !== $this.parent().data('lang') ){
          $(el).addClass('is-muted')
        }
      });
    })
    .on('mouseleave', '.header__lang a', function(){
      $('.header__lang li').removeClass('is-muted')
    })


  // Product cards
  _document
    .on('mouseenter', '[js-diminish-hover-cards] .products-card', function(){
      var siblings = $(this).closest('.products__grid').find('.products-card');
      var $this = $(this)

      $.each(siblings, function(i,el){
        if ( $(el).data('id') !== $this.data('id') ){
          $(el).addClass('is-muted')
        }
      });
    })
    .on('mouseleave', '[js-diminish-hover-cards] .products-card', function(){
      $('.products-card').removeClass('is-muted')
    })


  /////////////////
  // functional blocks
  ////////////////


  // SET ACTIVE CLASS IN HEADER
  // * could be removed in production and server side rendering when header is inside barba-container
  function updateHeaderActiveClass(){
    $('.header__menu li').each(function(i,val){
      if ( $(val).find('a').attr('href') == window.location.pathname.split('/').pop() ){
        $(val).addClass('is-active');
      } else {
        $(val).removeClass('is-active')
      }
    });
  }

  // HEADER SCROLL
  // add .header-static for .page or body
  // to disable sticky header
  function initHeaderScroll(){
    _window.on('scroll', throttle(function(e) {
      var vScroll = _window.scrollTop();
      var header = $('.header').not('.header--static');
      var headerHeight = header.height();
      var firstSection = _document.find('.page__content div:first-child()').height() - headerHeight;
      var visibleWhen = Math.round(_document.height() / _window.height()) >  2.5

      if (visibleWhen){
        if ( vScroll > headerHeight ){
          header.addClass('is-fixed');
        } else {
          header.removeClass('is-fixed');
        }
        if ( vScroll > firstSection ){
          header.addClass('is-fixed-visible');
        } else {
          header.removeClass('is-fixed-visible');
        }
      }
    }, 10));
  }

  ////////////////
  // Adjust layout
  ////////////////
  function adjustAsyncLayout(){
    // makes layout sides sticky to edges
    // while preserving the container
    if ( $('[js-layout-padding]').length > 0 ){

      var wWidth = _window.width();
      var containerPadding = wWidth > 568 ? 50 : 20

      $('[js-layout-padding]').each(function(i, el){
        var $el = $(el);
        var containerWidth = $el.data('container-width') || 1250
        var type = $el.data('type')
        var stopWatching = $el.data('stop') ? mediaCondition($el.data('stop')) : null
        var setPaddingPx = 0;

        if ( stopWatching === null || !stopWatching ){
          // calculate base container diff
          var widthDiff = wWidth - containerWidth

          // if the diff within max-width: 1250 + pad - just add default padding
          if ( widthDiff < containerPadding * 2 ){
            setPaddingPx = containerPadding
          } else {
            // get container diff with window size
            var containerDiff = widthDiff - (containerPadding * 2)
            setPaddingPx = containerPadding + (containerDiff / 2)
          }

          // set values
          if ( type === "container-left" ){
            $el.css({ 'padding-left': setPaddingPx })
          } else if ( type === "container-right" ){
            $el.css({ 'padding-right': setPaddingPx })
          }
        } else {
          $el.attr("style", "")
          // $el.css({
          //   'padding-left': 0,
          //   'padding-right': 0
          // })
        }

      })
    }
  }

  function stickyBgElements(){

    var productsOval = $('[js-sticky-products-oval]');
    var productsTriangle = $('[js-sticky-products-triangle]');

    if (productsOval.length > 0){
      var anchor = _window.width() > 568 ? $('.products-card[data-for-prodcuts-oval]') : $('.products-card[data-for-prodcuts-oval-mobile]');
      var anchorOffsetX = Math.floor(anchor.offset().left);
      var anchorOffsetY = Math.floor( Math.abs( $('.products').offset().top - anchor.offset().top ));
      // will be position X by the center of a card - so, need width of oval and anchor
      var ovalWidth = productsOval.outerWidth()
      var anchorWidth = anchor.outerWidth();
      var anchorCenterOffsetX =  Math.floor(anchorOffsetX + (anchorWidth / 2))

      // TO DO
      // watch product info to prevent overlowing the element?

      // oval is positioned abs to products seciton (full-width container)
      var calcOvalPosition = {
        x: Math.floor(anchorCenterOffsetX - (ovalWidth / 2) + 30),
        y: anchorOffsetY - 42
      }

      productsOval.css({
        'left': calcOvalPosition.x,
        'top': calcOvalPosition.y
      })
    }

    // logic for the triagle
    if (productsTriangle.length > 0){
      var anchor = $('[data-for-prodcuts-triangle]');
      var anchorOffsetY = Math.floor( Math.abs( $('.products').offset().top - anchor.offset().top ) );
      // get values to do it as a sticky to the bottom
      var anchorHeight = anchor.outerHeight();
      var triangleHeight = productsTriangle.outerHeight();
      var anchorBottomPosition = anchorOffsetY + (anchorHeight - triangleHeight)

      // triangle is also positioned abs to products seciton (full-width container)
      var calcTriabglePosition = anchorBottomPosition - 100

      productsTriangle.css({
        'top': calcTriabglePosition,
        'bottom': 'auto'
      })
    }

  }


  //////////
  // SLIDERS
  //////////
  var blogAPIDone = false;
  function initSliders(){

    // PRODUCTS MOBILE SWIPER
    var productsSliderProgress = $('[js-set-products-progress]')
    var productsSliderMobile = new Swiper('[js-products-slider-mobile]', {
      wrapperClass: "swiper-wrapper",
      // slideClass: "products__col-swiper",
      slideClass: "products-card",
      direction: 'horizontal',
      loop: false,
      watchOverflow: true,
      setWrapperSize: false,
      spaceBetween: 0,
      slidesPerView: 'auto',
      normalizeSlideIndex: true,
      freeMode: false,
      slidesOffsetAfter: 50,
      // slidesOffsetBefore: 30,
      pagination: {
        el: '.swiper-nav__fraction',
        type: 'fraction',
      },
      on: {
        progress: function(progress){
          var reverseTransform = Math.floor(progress * 100) - 100
          productsSliderProgress.css({
            'transform': 'translate('+ reverseTransform + '%,0)'
          })
        }
      }
      // effect: 'flip',
    })

    // TESTIMONIALS SWIPER
    // var testimonialsSlider = new Swiper('[js-testimonials-slider]', {
    //   wrapperClass: "swiper-wrapper",
    //   slideClass: "testimonials-card",
    //   direction: 'horizontal',
    //   loop: false,
    //   watchOverflow: true,
    //   setWrapperSize: false,
    //   spaceBetween: 30,
    //   slidesPerView: 2,
    //   normalizeSlideIndex: true,
    //   freeMode: false,
    //   // effect: 'flip',
    //   breakpoints: {
    //     // when window width is <= 992px
    //     992: {
    //       slidesPerView: 1,
    //     }
    //   }
    // })

    // custom nav
    // _document.on('click', '[js-testimonials-slider-nav] .testimonials__logo', function(){
    //   var targetSlide = parseInt( $(this).data('slideTo') ) - 1;
    //   testimonialsSlider.slideTo( targetSlide );
    // })

    // BLOG SWIPER
    var blogSliderProgress = $('[js-set-blog-progress]')
    var blogSlider = new Swiper('[js-blog-slider]', {
      wrapperClass: "swiper-wrapper",
      slideClass: "blog__slide",
      direction: 'horizontal',
      loop: false,
      watchOverflow: true,
      setWrapperSize: false,
      spaceBetween: 0,
      slidesPerView: 'auto',
      normalizeSlideIndex: true,
      freeMode: false,
      watchSlidesProgress: true,
      slidesOffsetAfter: 50,
      pagination: {
        el: '.swiper-nav__fraction',
        type: 'fraction',
      },
      navigation: {
        nextEl: '.swiper-nav__navigation-next',
        prevEl: '.swiper-nav__navigation-prev',
      },
      on: {
        progress: function(progress){
          var reverseTransform = Math.floor(progress * 100) - 100
          blogSliderProgress.css({
            'transform': 'translate('+ reverseTransform + '%,0)'
          })
        }
        // sliderMove: function(e){
        //   console.log(blogSlider.progress)
        // }
      }
    })

    // blog API
    var blogAPIEndpointPosts = "https://blog.axur.com/wp-json/wp/v2/posts";
    var blogAPIEndpointMedia = "https://blog.axur.com/wp-json/wp/v2/media/";

    // get last 10 posts & media
    if ( !blogAPIDone && $('[js-blog-slider]').length > 0 ){
      $.get(blogAPIEndpointPosts, function(data){
        $.each(data, function(index, post){
          // get featured media element
          try{
            $.get(blogAPIEndpointMedia + post.featured_media, function(media){
              addBlogSlides(index, post, media);
            })
          } catch(err){
            console.log(err)
          }
        })
      })
      blogAPIDone = true;
    }

    function addBlogSlides(index, post, media){
      // date convert
      var utcTime = new Date(post.date + 'Z')
      var renderDate = post.date
      try { // just in case. will render api resp in case of failture
        renderDate = utcTime.renderDate() // + prototype on Date (in the of the file)
      } catch(err){
        console.log(err)
      }

      // var mediaThumb = media.media_details.sizes["extra-image-square-medium"].source_url
      var mediaThumb = media.media_details.sizes["extra-image-medium"].source_url

      var blogSlideTpl = '<div class="blog__slide">' +
        '<a href="'+post.link+'" target="_blank" class="blog-card" data-id="'+post.id+'">' +
          '<div class="blog-card__image">' +
            '<img src="'+mediaThumb+'"/>' +
          '</div>' +
          '<div class="blog-card__title t-p1 c-orange">'+post.title.rendered+'</div>' +
          '<div class="blog-card__description"></div>' +
          '<div class="blog-card__date t-p3">'+renderDate+'</div>' +
        '</a>' +
      '</div>';

      // blogSlider.appendSlide(blogSlideTpl) // append slide to swiper
      // index is required to prevent showing later posts by date in front of the que
      blogSlider.addSlide(index, blogSlideTpl)
    }

    // PRODUCTS MOBILE SWIPER
    var plansSliderMobile = $('[js-plans-slider]');
    var plansSliderMobileOptions = {
      wrapperClass: "swiper-wrapper",
      slideClass: "plans__col",
      direction: 'horizontal',
      loop: false,
      watchOverflow: true,
      setWrapperSize: false,
      spaceBetween: 8,
      slidesPerView: 'auto',
      normalizeSlideIndex: true,
      freeMode: false,
      slidesOffsetAfter: 50,
      pagination: {
        el: '.swiper-nav__fraction',
        type: 'fraction',
      },
      on: {
        progress: function(progress){
          var reverseTransform = Math.floor(progress * 100) - 100
          $('[js-set-plans-progress]').css({
            'transform': 'translate('+ reverseTransform + '%,0)'
          })
        }
      }
    };

    // PRODUCTS MOBILE SWIPER
    var usecasesSliderMobile = $('[js-usecases-slider]');
    var usecasesSliderMobileOptions = {
      wrapperClass: "use-cases__wrapper",
      slideClass: "use-cases__col",
      direction: 'horizontal',
      loop: false,
      watchOverflow: true,
      setWrapperSize: false,
      spaceBetween: 30,
      slidesPerView: 'auto',
      normalizeSlideIndex: true,
      freeMode: false,
      slidesOffsetAfter: 30,
      pagination: {
        el: '.swiper-nav__fraction',
        type: 'fraction',
      },
      on: {
        progress: function(progress){
          var reverseTransform = Math.floor(progress * 100) - 100
          $('[js-set-usecases-progress]').css({
            'transform': 'translate('+ reverseTransform + '%,0)'
          })
        }
      }
    };




    initMobileSwipers()
    _window.on('resize', debounce(initMobileSwipers, 200));

    function initMobileSwipers(){
      if ( _window.width() > 992 ) {
        if (plansSliderMobile.hasClass('swiper-container-horizontal')) {
          plansSliderMobile[0].swiper.destroy(true, true);
        }
        if (usecasesSliderMobile.hasClass('swiper-container-horizontal')) {
          usecasesSliderMobile[0].swiper.destroy(true, true);
        }
        return
      }
      if (!plansSliderMobile.hasClass('swiper-container-horizontal')) {
        new Swiper(plansSliderMobile[0], plansSliderMobileOptions);
      }
      if (!usecasesSliderMobile.hasClass('swiper-container-horizontal')) {
        new Swiper(usecasesSliderMobile[0], usecasesSliderMobileOptions);
      }

    }
  }

  //////////
  // MODALS
  //////////
  function initPopups(){
    // Magnific Popup
    var startWindowScroll = 0;
    $('[js-popup]').magnificPopup({
      type: 'inline',
      fixedContentPos: true,
      fixedBgPos: true,
      overflowY: 'auto',
      closeBtnInside: true,
      preloader: false,
      midClick: true,
      removalDelay: 300,
      mainClass: 'popup-buble',
      callbacks: {
        beforeOpen: function() {
          startWindowScroll = _window.scrollTop();
          // $('html').addClass('mfp-helper');
        },
        close: function() {
          // $('html').removeClass('mfp-helper');
          _window.scrollTop(startWindowScroll);
        }
      }
    });

    $('[js-popup-gallery]').magnificPopup({
  		delegate: 'a',
  		type: 'image',
  		tLoading: 'Загрузка #%curr%...',
  		mainClass: 'popup-buble',
  		gallery: {
  			enabled: true,
  			navigateByImgClick: true,
  			preload: [0,1]
  		},
  		image: {
  			tError: '<a href="%url%">The image #%curr%</a> could not be loaded.'
  		}
  	});

    $('[js-popupVideo]').magnificPopup({
      // disableOn: 700,
      type: 'iframe',
      fixedContentPos: true,
      fixedBgPos: true,
      overflowY: 'auto',
      closeBtnInside: false,
      preloader: false,
      midClick: true,
      removalDelay: 300,
      mainClass: 'popup-buble',
      callbacks: {
        beforeOpen: function() {
          // startWindowScroll = _window.scrollTop();
          // $('html').addClass('mfp-helper');
        }
      },
      patterns: {
        youtube: {
          index: 'youtube.com/',
          id: 'v=', // String that splits URL in a two parts, second part should be %id%
          // Or null - full URL will be returned
          // Or a function that should return %id%, for example:
          // id: function(url) { return 'parsed id'; }

          src: '//www.youtube.com/embed/%id%?autoplay=1&controls=0&showinfo=0' // URL that will be set as a source for iframe.
        }
      },
      closeMarkup: '<button class="mfp-close"><svg class="ico ico-close"><use xlink:href="img/sprite.svg#ico-close"></use></svg></button>'
    });

  }

  function closeMfp(){
    $.magnificPopup.close();
  }


  //////////
  // SVG animations with anime.js
  /////////

  var animation_1, animation_1_mobile, animation_2, animation_3, animation_4, animation_5, animation_6, animation_7

  function initSvgAnimations(teleportable){
    var easingSwing = [.02, .01, .47, 1]; // default jQuery easing for anime.js

    // first
    // var el = $('[js-animation-1] svg');
    // var socialIcons = el.get(0).querySelectorAll('.social-icon')
    //
    // anime({
    //   targets: socialIcons,
    //   translateX: '4%',
    //   direction: 'alternate',
    //   loop: true,
    //   easing: 'linear',
    //   duration: 1000,
    // })

    if ( $('#include-anim-2').length > 0 ) {
      animation_2 = lottie.loadAnimation({
        container: document.getElementById('include-anim-2'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/animation-json/anima_2.json'
      })
    }

    if ( $('#include-anim-1').length > 0 ) {
      animation_1 = lottie.loadAnimation({
        container: document.getElementById('include-anim-1'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/animation-json/anima_1.json'
      })
    }

    if ( $('#include-anim-1-mobile').length > 0 ) {
      animation_1_mobile = lottie.loadAnimation({
        container: document.getElementById('include-anim-1-mobile'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/animation-json/anima_1.json'
      })
    }

    if ( $('#include-anim-3').length > 0 ) {
      var animation_3 = lottie.loadAnimation({
        container: document.getElementById('include-anim-3'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/animation-json/anima_3.json'
      })
    }

    if ( $('#include-anim-4').length > 0 ) {
      var animation_4 = lottie.loadAnimation({
        container: document.getElementById('include-anim-4'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/animation-json/anima_4.json'
      })
    }

    if ( $('#include-anim-5').length > 0 ) {
      var animation_5 = lottie.loadAnimation({
        container: document.getElementById('include-anim-5'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/animation-json/anima_5.json'
      })
    }

    if ( $('#include-anim-6').length > 0 ) {
      var animation_6 = lottie.loadAnimation({
        container: document.getElementById('include-anim-6'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/animation-json/anima_6.json'
      })
    }

    if ( $('#include-anim-7').length > 0 ) {
      var animation_7 = lottie.loadAnimation({
        container: document.getElementById('include-anim-7'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/animation-json/anima_7.json'
      })
    }

  }

  /////////////
  // STICKY KIT
  /////////////

  function initSticky(){
    if ( $('[js-stick-in-parent]').length > 0 ){
      $('[js-stick-in-parent]').each(function(i,el){
        $(el).stick_in_parent();
      });
    }
  }

  /////////////
  // TypeWritter
  /////////////

  function initTypewriter(){
    if ( $('[js-typewriter]').length > 0 ){
      $('[js-typewriter]').each(function(i,el){
        var typewriter = new Typewriter(el, {
          loop: true
        });
        var strings = $(el).data("type").split(';');

        $.each(strings, function(i,str){
          typewriter = typewriter
            .typeString(str)
            .pauseFor(2000)
            .deleteAll()
        })
        typewriter
          .start();

      })
    }
  }


  ////////////
  // UI
  ////////////

  // textarea autoExpand
  _document
    .one('focus.autoExpand', '.ui-group textarea', function(){
        var savedValue = this.value;
        this.value = '';
        this.baseScrollHeight = this.scrollHeight;
        this.value = savedValue;
    })
    .on('input.autoExpand', '.ui-group textarea', function(){
        var minRows = this.getAttribute('data-min-rows')|0, rows;
        this.rows = minRows;
        rows = Math.ceil((this.scrollHeight - this.baseScrollHeight) / 17);
        this.rows = minRows + rows;
    });

  // Masked input
  function initMasks(){
    $("[js-dateMask]").mask("99.99.99",{placeholder:"ДД.ММ.ГГ"});
    $("[js-mask-phone]").mask("+65 9999-9999", {placeholder: "+65 ____-____"});
  }

  // selectric
  function initSelectric(){
    $('[js-selectric]').selectric({
      maxHeight: 300,
      arrowButtonMarkup: '<b class="button"><svg class="ico ico-select-down"><use xlink:href="img/sprite.svg#ico-select-down"></use></svg></b>',

      onInit: function(element, data){
        var $elm = $(element),
            $wrapper = $elm.closest('.' + data.classes.wrapper);

        $wrapper.find('.label').html($elm.attr('placeholder'));
      },
      onBeforeOpen: function(element, data){
        var $elm = $(element),
            $wrapper = $elm.closest('.' + data.classes.wrapper);

        $wrapper.find('.label').data('value', $wrapper.find('.label').html()).html($elm.attr('placeholder'));
      },
      onBeforeClose: function(element, data){
        var $elm = $(element),
            $wrapper = $elm.closest('.' + data.classes.wrapper);

        $wrapper.find('.label').html($wrapper.find('.label').data('value'));
      }
    });
  }

  //////////
  // LAZY LOAD
  //////////
  function initLazyLoad(){
    _document.find('[js-lazy]').Lazy({
      threshold: 500,
      enableThrottle: true,
      throttle: 100,
      scrollDirection: 'vertical',
      effect: 'fadeIn',
      effectTime: 350,
      // visibleOnly: true,
      // placeholder: "data:image/gif;base64,R0lGODlhEALAPQAPzl5uLr9Nrl8e7...",
      onError: function(element) {
          console.log('error loading ' + element.data('src'));
      },
      beforeLoad: function(element){
        // element.attr('style', '')
      }
    });
  }


  ////////////
  // SCROLLBAR
  ////////////
  function initPerfectScrollbar(){
    if ( $('[js-scrollbar]').length > 0 ){
      $('[js-scrollbar]').each(function(i, scrollbar){
        var ps;

        function initPS(){
          ps = new PerfectScrollbar(scrollbar, {
            // wheelSpeed: 2,
            // wheelPropagation: true,
            minScrollbarLength: 20
          });
        }

        initPS();

        // toggle init destroy
        function checkMedia(){
          if ( $(scrollbar).data('disable-on') ){

            if ( mediaCondition($(scrollbar).data('disable-on')) ){
              if ( $(scrollbar).is('.ps') ){
                ps.destroy();
                ps = null;
              }
            } else {
              if ( $(scrollbar).not('.ps') ){
                initPS();
              }
            }
          }
        }

        checkMedia();
        _window.on('resize', debounce(checkMedia, 250));

      })
    }
  }


  ////////////
  // SCROLLMONITOR - WOW LIKE
  ////////////
  function initScrollMonitor(){
    $('.wow').each(function(i, el){

      var elWatcher = scrollMonitor.create( $(el) );

      var delay;
      if ( $(window).width() < 768 ){
        delay = 0
      } else {
        delay = $(el).data('animation-delay');
      }

      var animationClass = $(el).data('animation-class') || "wowFadeUp"

      var animationName = $(el).data('animation-name') || "wowFade"

      elWatcher.enterViewport(throttle(function() {
        $(el).addClass(animationClass);
        $(el).css({
          'animation-name': animationName,
          'animation-delay': delay,
          'visibility': 'visible'
        });
      }, 100, {
        'leading': true
      }));
      // elWatcher.exitViewport(throttle(function() {
      //   $(el).removeClass(animationClass);
      //   $(el).css({
      //     'animation-name': 'none',
      //     'animation-delay': 0,
      //     'visibility': 'hidden'
      //   });
      // }, 100));
    });

  }

  ////////////////
  // FORM VALIDATIONS
  ////////////////

  // jQuery validate plugin
  // https://jqueryvalidation.org
  function initValidations(){
    // GENERIC FUNCTIONS
    var validateErrorPlacement = function(error, element) {
      error.addClass('ui-input__validation');
      error.appendTo(element.parent("div"));
    }
    var validateHighlight = function(element) {
      $(element).parent('div').addClass("has-error");
    }
    var validateUnhighlight = function(element) {
      $(element).parent('div').removeClass("has-error");
    }
    var validateSubmitHandler = function(form) {
      $(form).addClass('loading');
      $.ajax({
        type: "POST",
        url: $(form).attr('action'),
        data: $(form).serialize(),
        success: function(response) {
          $(form).removeClass('loading');
          var data = $.parseJSON(response);
          if (data.status == 'success') {
            // do something I can't test
          } else {
              $(form).find('[data-error]').html(data.message).show();
          }
        }
      });
    }

    var validatePhone = {
      required: true,
      normalizer: function(value) {
        var PHONE_MASK = '+XX XXXX-XXXX';
        if (!value || value === PHONE_MASK) {
          return value;
        } else {
          return value.replace(/[^\d]/g, '');
        }
      },
      minlength: 10,
      digits: true
    }

    ////////
    // FORMS


    /////////////////////
    // REGISTRATION FORM
    ////////////////////
    $("[js-validate-contact-form]").validate({
      errorPlacement: validateErrorPlacement,
      highlight: validateHighlight,
      unhighlight: validateUnhighlight,
      submitHandler: validateSubmitHandler,
      rules: {
        name: "required",
        email: {
          required: true,
          email: true
        },
        phone: validatePhone
      },
      messages: {
        name: "Preencha este campo",
        email: {
          required: "Preencha este campo",
          email: "Ops! Veja se está tudo certo com seu e-mail."
        },
        phone: {
          required: "Preencha este campo",
          minlength: "Digite o telefone correto"
        }
      }
    });


    $("[js-validate-apply-form]").validate({
      errorPlacement: validateErrorPlacement,
      highlight: validateHighlight,
      unhighlight: validateUnhighlight,
      submitHandler: validateSubmitHandler,
      rules: {
        name: "required",
        email: {
          required: true,
          email: true
        },
        phone: validatePhone
      },
      messages: {
        name: "Preencha este campo",
        email: {
          required: "Preencha este campo",
          email: "Ops! Veja se está tudo certo com seu e-mail."
        },
        phone: {
          required: "Preencha este campo",
          minlength: "Digite o telefone correto"
        }
      }
    });


    var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    // BETTER CUSTOM VALIDATOR FOR SIMPLE EMAIL ONLY VALIDATION
    if ( $("[js-validate-signup]").length > 0 ){
      $("[js-validate-signup]").each(function(i, form){

        var $form = $(this);
        var email = $form.find("input[name=email]");
        var emailContainer = email.parent();

        $form.on('submit', function(e){
          e.stopPropagation();
          e.preventDefault();

          var emailVal = $(email).val();
          var emailIsValid = emailRegex.test(emailVal);
          var validationMessage = "";

          if ( emailVal == "" ){
            $form.addClass('is-shaking');
            setTimeout(function(){
              $form.removeClass('is-shaking');
            }, 1000)
          } else if ( !emailIsValid ){
            validationMessage = "Ops! Veja se está tudo certo com seu e-mail."
          } else {
            // sucess
            // to some ajax stuff
            clearValidation();
            alert('form is valid. write some ajax stuff here');

            // erase input
            email.val("");
          }

          // validation message
          if ( validationMessage !== "" ){
            emailContainer.addClass('has-error');
            $form.addClass('validation-spacing');
            emailContainer.append('<div class="ui-input__validation">'+validationMessage+'</div>')
          }
        })

        // clear validation
        email.focusin(clearValidation);

        function clearValidation(){
          emailContainer.removeClass('has-error');
          $form.removeClass('validation-spacing');
          emailContainer.find(".ui-input__validation").remove();
        }

      })
    }

  }

  ////////////
  // TELEPORT PLUGIN
  ////////////
  function initTeleport(){
    $('[js-teleport]').each(function (i, el) {
      var $origin = $(el)
      var originHtml = $origin.html();
      var $target = $('[data-teleport-target=' + $origin.data('teleport-to') + ']');
      var condition = $origin.data('teleport-condition');

      if ($target && originHtml && condition) {

        function teleport() {
          if ( mediaCondition(condition) ) {
            // when should be teleported
            // if (!$.contains(document.documentElement, $origin[0])) {
            //   console.log('$origin already detached')
            //   return; // '$origin already detached'
            // }

            if ( $target.html().length > 0 ){
              return
            }

            // $origin.detach();
            // $target.append(originHtml)

            // old method
            $target.html(originHtml)
            $origin.html("")

            reInit();
          } else {
            // when back to original place
            // if ($.contains(document.documentElement, $origin[0])) {
            //   console.log('$origin already attached')
            //   return; // '$origin already attached'
            // }
            if ( $origin.html().length > 0 ){
              return
            }

            // $target.detach();
            // $target.prependTo($origin)

            // old method
            $origin.html(originHtml)
            $target.html("")

            reInit();
          }

          // repeat some critical functions
          function reInit(){
            initValidations();
            initPopups();
            initSliders();
            initSticky();
            initScrollMonitor();
            stickyBgElements();
            // initSvgAnimations(true);
          }
        }

        teleport();
        _window.on('resize', debounce(teleport, 200));

      }
    })
  }



  //////////
  // MAP INITIALIZATION
  //////////
  function initMap(){

  }

  //////////
  // BARBA PJAX
  //////////
  var easingSwing = [.02, .01, .47, 1]; // default jQuery easing for anime.js

  Barba.Pjax.Dom.containerClass = "page";

  var FadeTransition = Barba.BaseTransition.extend({
    start: function() {
      Promise
        .all([this.newContainerLoading, this.fadeOut()])
        .then(this.fadeIn.bind(this));
    },

    fadeOut: function() {
      var deferred = Barba.Utils.deferred();

      anime({
        targets: this.oldContainer,
        opacity : .5,
        easing: easingSwing, // swing
        duration: 300,
        complete: function(anim){
          deferred.resolve();
        }
      })

      return deferred.promise
    },

    fadeIn: function() {
      var _this = this;
      var $el = $(this.newContainer);

      $(this.oldContainer).hide();

      $el.css({
        visibility : 'visible',
        opacity : .5
      });

      anime({
        targets: "html, body",
        scrollTop: 1,
        easing: easingSwing, // swing
        duration: 150
      });

      anime({
        targets: this.newContainer,
        opacity: 1,
        easing: easingSwing, // swing
        duration: 300,
        complete: function(anim) {
          triggerBody()
          _this.done();
        }
      });
    }
  });

  // set barba transition
  Barba.Pjax.getTransition = function() {
    return FadeTransition;
  };

  Barba.Prefetch.init();
  Barba.Pjax.start();

  Barba.Dispatcher.on('newPageReady', function(currentStatus, oldStatus, container, newPageRawHTML) {
    pageReady();
  });

  // some plugins get bindings onNewPage only that way
  function triggerBody(){
    _window.scrollTop(0);
    $(window).scroll();
    $(window).resize();
  }

  //////////
  // MEDIA Condition helper function
  //////////
  function mediaCondition(cond){
    var disabledBp;
    var conditionMedia = cond.substring(1);
    var conditionPosition = cond.substring(0, 1);

    if (conditionPosition === "<") {
      disabledBp = _window.width() < conditionMedia;
    } else if (conditionPosition === ">") {
      disabledBp = _window.width() > conditionMedia;
    }

    return disabledBp
  }

  //////////
  // DEVELOPMENT HELPER
  //////////
  function setBreakpoint(){
    var wHost = window.location.host.toLowerCase()
    var displayCondition = wHost.indexOf("localhost") >= 0 || wHost.indexOf("surge") >= 0
    if (displayCondition){
      var wWidth = _window.width();

      var content = "<div class='dev-bp-debug'>"+wWidth+"</div>";

      $('.page').append(content);
      setTimeout(function(){
        $('.dev-bp-debug').fadeOut();
      },1000);
      setTimeout(function(){
        $('.dev-bp-debug').remove();
      },1500)
    }
  }

});


// When the window has finished loading create our google map below

if ( $('#google-map').length > 0 ){
google.maps.event.addDomListener(window, 'load', init);
}

function init() {

  var mapOptions = {
    zoom: 3,
    center: new google.maps.LatLng(-5.655688, -80.521547),
    styles: [{"featureType":"all","elementType":"geometry.fill","stylers":[{"weight":"2.00"}]},{"featureType":"all","elementType":"geometry.stroke","stylers":[{"color":"#9c9c9c"}]},{"featureType":"all","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#eeeeee"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#7b7b7b"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#c8d7d4"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#070707"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]}]
  };

  var mapElement = document.getElementById('google-map');
  var map = new google.maps.Map(mapElement, mapOptions);

  // markers
  var markers = [
    {
      position: new google.maps.LatLng(-30.006795, -51.198727),
      title: 'Porto Alegri'
    },
    {
      position: new google.maps.LatLng(-23.574160, -46.656552),
      title: 'San Paulu'
    },
    {
      position: new google.maps.LatLng(37.740718, -122.428274),
      title: 'San Francisco'
    }
  ]

  markers.forEach(function(marker) {
    new google.maps.Marker({
      position: marker.position,
      icon: '/img/pin.png',
      map: map,
      title: marker.title
    });
  });

}

// Propotyes
Date.prototype.renderDate = function() {
  var mm = this.getMonth();
  var dd = this.getDate();

  var monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // https://stackoverflow.com/questions/15397372/javascript-new-date-ordinal-st-nd-rd-th
  function nth(d) {
    if(d>3 && d<21) return 'th';
    switch (d % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
      }
  }

  var dateArr = [
    (dd>9 ? '' : '0') + dd + nth(dd),
    monthNames[mm],
    this.getFullYear()
  ]

  return dateArr.join(' ');
};
