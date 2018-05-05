import React, {Component} from 'react';
import PropTypes from 'prop-types';

class Swipe extends Component {

    constructor(props) {
        super(props);

        this.state = {
            interval: null,
        }

        let options = props.options;

        this.indata = {
            noop: ()=>{},
            offloadFn: function(fn) { setTimeout(fn || this.indata.noop, 0); },
            browser: {
                addEventListener: !!window.addEventListener,
                touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch,
                transitions: (function(temp) {
                    let prop = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
                    for ( var i in prop ) if (temp.style[ prop[i] ] !== undefined) return true;
                    return false;
                })(document.createElement('swipe'))
            },
            index: parseInt(options.startSlide, 10) || 0,
            speed: options.speed || 300,
            continuous: options.continuous !== undefined ? options.continuous : true,
            delay: options.auto || 0,
            start: {},
            delta: {},

        }

        this.element = props.container.children[0];

        this.events = {

            handleEvent: function(event) {

                switch (event.type) {
                case 'touchstart': this.start(event); break;
                case 'touchmove': this.move(event); break;
                case 'touchend': this.indata.offloadFn(this.end(event)); break;
                case 'webkitTransitionEnd':
                case 'msTransitionEnd':
                case 'oTransitionEnd':
                case 'otransitionend':
                case 'transitionend': this.indata.offloadFn(this.transitionEnd(event)); break;
                case 'resize': this.indata.offloadFn(setup); break;
                }

                if (options.stopPropagation) event.stopPropagation();

            },
            start: function(event) {

                var touches = event.touches[0];

                // measure start values
                start = {

                // get initial touch coords
                x: touches.pageX,
                y: touches.pageY,

                // store time to determine touch duration
                time: +new Date()

                };

                // used for testing first move event
                isScrolling = undefined;

                // reset delta and end measurements
                delta = {};

                // attach touchmove and touchend listeners
                element.addEventListener('touchmove', this, false);
                element.addEventListener('touchend', this, false);

            },
            move: function(event) {

                // ensure swiping with one touch and not pinching
                if ( event.touches.length > 1 || event.scale && event.scale !== 1) return;

                if (options.disableScroll) return;

                var touches = event.touches[0];

                // measure change in x and y
                delta = {
                x: touches.pageX - start.x,
                y: touches.pageY - start.y
                };

                // determine if scrolling test has run - one time test
                if ( typeof isScrolling == 'undefined') {
                isScrolling = !!( isScrolling || Math.abs(delta.x) < Math.abs(delta.y) );
                }

                // if user is not trying to scroll vertically
                if (!isScrolling) {

                // prevent native scrolling
                event.preventDefault();

                // stop slideshow
                stop();

                // increase resistance if first or last slide
                if (continuous) { // we don't add resistance at the end

                    translate(circle(index-1), delta.x + slidePos[circle(index-1)], 0);
                    translate(index, delta.x + slidePos[index], 0);
                    translate(circle(index+1), delta.x + slidePos[circle(index+1)], 0);

                } else {

                    delta.x =
                    delta.x /
                        ( (!index && delta.x > 0 ||         // if first slide and sliding left
                        index == slides.length - 1 &&     // or if last slide and sliding right
                        delta.x < 0                       // and if sliding at all
                        ) ?
                        ( Math.abs(delta.x) / width + 1 )      // determine resistance level
                        : 1 );                                 // no resistance if false

                    // translate 1:1
                    translate(index-1, delta.x + slidePos[index-1], 0);
                    translate(index, delta.x + slidePos[index], 0);
                    translate(index+1, delta.x + slidePos[index+1], 0);
                }
                options.swiping && options.swiping(-delta.x / width);

                }

            },
            end: function(event) {

                // measure duration
                var duration = +new Date() - start.time;

                // determine if slide attempt triggers next/prev slide
                var isValidSlide =
                    Number(duration) < 250 &&         // if slide duration is less than 250ms
                    Math.abs(delta.x) > 20 ||         // and if slide amt is greater than 20px
                    Math.abs(delta.x) > width/2;      // or if slide amt is greater than half the width

                // determine if slide attempt is past start and end
                var isPastBounds =
                    !index && delta.x > 0 ||                      // if first slide and slide amt is greater than 0
                    index == slides.length - 1 && delta.x < 0;    // or if last slide and slide amt is less than 0

                if (continuous) isPastBounds = false;

                // determine direction of swipe (true:right, false:left)
                var direction = delta.x < 0;

                // if not scrolling vertically
                if (!isScrolling) {

                if (isValidSlide && !isPastBounds) {

                    if (direction) {

                    if (continuous) { // we need to get the next in this direction in place

                        move(circle(index-1), -width, 0);
                        move(circle(index+2), width, 0);

                    } else {
                        move(index-1, -width, 0);
                    }

                    move(index, slidePos[index]-width, speed);
                    move(circle(index+1), slidePos[circle(index+1)]-width, speed);
                    index = circle(index+1);

                    } else {
                    if (continuous) { // we need to get the next in this direction in place

                        move(circle(index+1), width, 0);
                        move(circle(index-2), -width, 0);

                    } else {
                        move(index+1, width, 0);
                    }

                    move(index, slidePos[index]+width, speed);
                    move(circle(index-1), slidePos[circle(index-1)]+width, speed);
                    index = circle(index-1);

                    }

                    options.callback && options.callback(index, slides[index]);

                } else {

                    if (continuous) {

                    move(circle(index-1), -width, speed);
                    move(index, 0, speed);
                    move(circle(index+1), width, speed);

                    } else {

                    move(index-1, -width, speed);
                    move(index, 0, speed);
                    move(index+1, width, speed);
                    }

                }

                }

                // kill touchmove and touchend event listeners until touchstart called again
                element.removeEventListener('touchmove', events, false);
                element.removeEventListener('touchend', events, false);
                element.removeEventListener('touchforcechange', function() {}, false);

            },
            transitionEnd: function(event) {

                if (parseInt(event.target.getAttribute('data-index'), 10) == index) {

                if (delay) begin();

                options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);

                }

            }

            }

            // bind events

            // init 
            //  1. 获取container及child
            //  2. 启动

            // function begin, stop, 
        
    }

    setup() {

      let options = this.props.options;
      let container = this.props.container;
      let browser = this.indata.browser;

      // cache slides
      this.indata['slides'] = this.element.children;
      
      const {slides} = this.indata;

      let length = slides.length;

      // set continuous to false if only one slide
      let continuous = slides.length < 2 ? false : options.continuous;

      // create an array to store current positions of each slide
      this.indata['slidePos'] = new Array(slides.length);
    //   this.slidePos = new Array(slides.length);

      // determine width of each slide
      let width = Math.round(container.getBoundingClientRect().width || container.offsetWidth);

      this.element.style.width = (slides.length * width) + 'px';

      // stack elements
      let pos = slides.length;
      while(pos--) {

        let slide = slides[pos];

        slide.style.width = width + 'px';
        slide.setAttribute('data-index', pos);

        if (browser.transitions) {
          slide.style.left = (pos * -width) + 'px';
          move(pos, index > pos ? -width : (index < pos ? width : 0), 0);
        }

      }

      // reposition elements before and after index
      if (continuous && browser.transitions) {
        move(circle(index-1), -width, 0);
        move(circle(index+1), width, 0);
      }

      if (!browser.transitions) element.style.left = (index * -width) + 'px';

      container.style.visibility = 'visible';

    }

    move(index, dist, speed) {

      const {slidePos} = this.indata;

      translate(index, dist, speed);
      lidePos[index] = dist;

    }

    circle(index) {

      const {slides} = this.indata;
      // a simple positive modulo using slides.length
      return (slides.length + (index % slides.length)) % slides.length;

    }

    begin() {
      const {interval} = this.state;
      const {delay} = this.indata;

      clearTimeout(interval);
      this.setState({
          interval: setTimeout(this.next, delay),
      })

    }

    stop() {
      const {interval} = this.state;

      this.indata.delay = 0;
      clearTimeout(interval);

    }

    render() {

    }
}

Swipe.propTypes = {
    container: PropTypes.element.isRequired,
    options: PropTypes.object,
}

Swipe.defaultProps = {
    options: {}
}

module.exports = Swipe;