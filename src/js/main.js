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
    // initMasks();
    // initSelectric();

    // extra stuff
    // initLazyLoad();
    // initPerfectScrollbar();
    initScrollMonitor();
    initValidations();
    // initTeleport();

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
    .on('click', '[js-hamburger]', function(){
      $(this).toggleClass('is-active');
      $('.mobile-navi').toggleClass('is-active');
    })

  function closeMobileMenu(){
    $('[js-hamburger]').removeClass('is-active');
    $('.mobile-navi').removeClass('is-active');
  }

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
    }
  }

  function closeMenu(name){
    var target = $('[data-menu="'+name+'"]');
    if ( target ){
      $('[data-target-menu]').toggleClass('is-active');
      target.toggleClass('is-active');
      $('.page').removeClass('is-muted');
    }
  }

  function closeAllMenus(){
    $('[data-target-menu]').removeClass('is-active');
    $('[data-menu]').removeClass('is-active');
    $('.page').removeClass('is-muted');
  }

  // master function to close everything
  // specially usefull for barba page transitions
  function closeAllActives(){
    closeMobileMenu();
    closeAllMenus();
  }



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
        var setPaddingPx = 0

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

      })
    }
  }

  function stickyBgElements(){

    var productsOval = $('[js-sticky-products-oval]');
    var productsTriangle = $('[js-sticky-products-triangle]');

    if (productsOval){
      var anchor = $('.products-card[data-for-prodcuts-oval]');
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
    if (productsTriangle){
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
  function initSliders(){

    // EXAMPLE SWIPER
    var testimonialsSlider = new Swiper('[js-testimonials-slider]', {
      wrapperClass: "swiper-wrapper",
      slideClass: "testimonials-card",
      direction: 'horizontal',
      loop: false,
      watchOverflow: true,
      setWrapperSize: false,
      spaceBetween: 30,
      slidesPerView: 2,
      normalizeSlideIndex: true,
      freeMode: false,
      // effect: 'flip',
      breakpoints: {
        // when window width is <= 992px
        992: {
          slidesPerView: 1,
        }
      }
    })

    // custom nav
    // _document.on('click', '[js-testimonials-slider-nav] .testimonials__logo', function(){
    //   var targetSlide = parseInt( $(this).data('slideTo') ) - 1;
    //   testimonialsSlider.slideTo( targetSlide );
    // })

    // BLOG SWIPER
    var blogSliderProgress = $('[js-set-swiper-progress]')
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
      freeMode: true,
      watchSlidesProgress: true,
      slidesOffsetAfter: 50,
      pagination: {
        el: '.blog__nav-fraction',
        type: 'fraction',
      },
      navigation: {
        nextEl: '.blog__navigation-next',
        prevEl: '.blog__navigation-prev',
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
    $.get(blogAPIEndpointPosts, function(data){
      $.each(data, function(index, post){
        // get featured media element
        try{
          $.get(blogAPIEndpointMedia + post.featured_media, function(media){
            addBlogSlides(index, post, media)
          })
        } catch(err){
          console.log(err)
        }

      })
    })

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

  function initSvgAnimations(){
    var easingSwing = [.02, .01, .47, 1]; // default jQuery easing for anime.js

    // first
    var el = $('[js-animation-1] svg');
    var socialIcons = el.get(0).querySelectorAll('.social-icon')

    anime({
      targets: socialIcons,
      translateX: '4%',
      direction: 'alternate',
      loop: true,
      easing: 'linear',
      duration: 1000,
    })

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
    $("input[type='tel']").mask("+7 (000) 000-0000", {placeholder: "+7 (___) ___-____"});
  }

  // selectric
  function initSelectric(){
    $('select').selectric({
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
          var PHONE_MASK = '+X (XXX) XXX-XXXX';
          if (!value || value === PHONE_MASK) {
              return value;
          } else {
              return value.replace(/[^\d]/g, '');
          }
      },
      minlength: 11,
      digits: true
    }

    ////////
    // FORMS


    /////////////////////
    // REGISTRATION FORM
    ////////////////////
    $("[js-validate-signup]").validate({
      errorPlacement: validateErrorPlacement,
      highlight: validateHighlight,
      unhighlight: validateUnhighlight,
      submitHandler: validateSubmitHandler,
      rules: {
        last_name: "required",
        first_name: "required",
        email: {
          required: true,
          email: true
        },
      },
      messages: {
        email: {
            required: "Preencha este campo",
            email: "Ops! Veja se está tudo certo com seu e-mail."
        },
      }
    });
  }

  ////////////
  // TELEPORT PLUGIN
  ////////////
  function initTeleport(){
    $('[js-teleport]').each(function (i, val) {
      var self = $(val)
      var objHtml = $(val).html();
      var target = $('[data-teleport-target=' + $(val).data('teleport-to') + ']');
      var conditionMedia = $(val).data('teleport-condition').substring(1);
      var conditionPosition = $(val).data('teleport-condition').substring(0, 1);

      if (target && objHtml && conditionPosition) {

        function teleport() {
          var condition;

          if (conditionPosition === "<") {
            condition = _window.width() < conditionMedia;
          } else if (conditionPosition === ">") {
            condition = _window.width() > conditionMedia;
          }

          if (condition) {
            target.html(objHtml)
            self.html('')
          } else {
            self.html(objHtml)
            target.html("")
          }
        }

        teleport();
        _window.on('resize', debounce(teleport, 100));


      }
    })
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
    closeMobileMenu();

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
