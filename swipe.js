/*
 * Swipe 2.0.0
 * Brad Birdsall
 * https://github.com/thebird/Swipe
 * Copyright 2013-2015, MIT License
 *
*/

class Swipe {

    constructor(container, options) {

        const self = this;
        this.noop = function () { };
        this.offloadFn = function (fn) { setTimeout(fn || self.noop, 0); };

        // check browser capabilities
        this.browser = {
            addEventListener: !!window.addEventListener,
            touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch,
            transitions: (function (temp) {
                var props = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
                for (var i in props) if (temp.style[props[i]] !== undefined) return true;
                return false;
            })(document.createElement('swipe'))
        };

        // quit if no root element
        if (!container) return;
        this.container = container;
        this.element = container.children[0];

        // var slides, self.slidePos, width, length;
        this.options = options || {};
        this.index = parseInt(options.startSlide, 10) || 0;
        this.speed = options.speed || 300;
        this.continuous = options.continuous = options.continuous !== undefined ? options.continuous : true;


        // setup auto slideshow
        this.delay = options.auto || 0;
        this.interval = null;

        // setup initial vars
        this.start = {};
        this.delta = {};
        this.isScrolling;

        // setup event capturing
        
        this.events = {

            handleEvent: function (event) {

                switch (event.type) {
                    case 'touchstart': this.start(event); break;
                    case 'touchmove': this.move(event); break;
                    case 'touchend': self.offloadFn(this.end(event)); break;
                    case 'webkitTransitionEnd':
                    case 'msTransitionEnd':
                    case 'oTransitionEnd':
                    case 'otransitionend':
                    case 'transitionend': self.offloadFn(this.transitionEnd(event)); break;
                    case 'resize': self.offloadFn(self._setup); break;
                }

                if (options.stopPropagation) event.stopPropagation();

            },
            start: function (event) {

                var touches = event.touches[0];

                // measure start values
                self.start = {

                    // get initial touch coords
                    x: touches.pageX,
                    y: touches.pageY,

                    // store time to determine touch duration
                    time: +new Date()

                };

                // used for testing first move event
                self.isScrolling = undefined;

                // reset self.delta and end measurements
                self.delta = {};

                // attach touchmove and touchend listeners
                self.element.addEventListener('touchmove', this, false);
                self.element.addEventListener('touchend', this, false);

            },
            move: function (event) {

                // ensure swiping with one touch and not pinching
                if (event.touches.length > 1 || event.scale && event.scale !== 1) return;

                if (options.disableScroll) return;

                var touches = event.touches[0];

                // measure change in x and y
                self.delta = {
                    x: touches.pageX - self.start.x,
                    y: touches.pageY - self.start.y
                };

                // determine if scrolling test has run - one time test
                if (typeof self.isScrolling == 'undefined') {
                    self.isScrolling = !!(self.isScrolling || Math.abs(self.delta.x) < Math.abs(self.delta.y));
                }

                // if user is not trying to scroll vertically
                if (!self.isScrolling) {

                    // prevent native scrolling
                    event.preventDefault();

                    // stop slideshow
                    self._stop();

                    // increase resistance if first or last slide
                    if (self.continuous ) { // we don't add resistance at the end

                        self._translate(self._circle(self.index - 1), self.delta.x + self.slidePos[self._circle(self.index - 1)], 0);
                        self._translate(self.index, self.delta.x + self.slidePos[self.index], 0);
                        self._translate(self._circle(self.index + 1), self.delta.x + self.slidePos[self._circle(self.index + 1)], 0);

                        
                    } else {

                        self.delta.x =
                            self.delta.x /
                            ((!self.index && self.delta.x > 0 ||         // if first slide and sliding left
                                self.index == self.slides.length - 1 &&     // or if last slide and sliding right
                                self.delta.x < 0                       // and if sliding at all
                            ) ?
                                (Math.abs(self.delta.x) / self.width + 1)      // determine resistance level
                                : 1);                                 // no resistance if false

                        // translate 1:1
                        self._translate(self.index - 1, self.delta.x + self.slidePos[self.index - 1], 0);
                        self._translate(self.index, self.delta.x + self.slidePos[self.index], 0);
                        self._translate(self.index + 1, self.self.delta.x + self.slidePos[self.index + 1], 0);
                    }
                    options.swiping && options.swiping(-self.delta.x / self.width);

                }

            },
            end: function (event) {

                // measure duration
                var duration = +new Date() - self.start.time;

                // determine if slide attempt triggers next/prev slide
                var isValidSlide =
                    Number(duration) < 250 &&         // if slide duration is less than 250ms
                    Math.abs(self.delta.x) > 20 ||         // and if slide amt is greater than 20px
                    Math.abs(self.delta.x) > self.width / 2;      // or if slide amt is greater than half the width

                // determine if slide attempt is past start and end
                var isPastBounds =
                    !self.index && self.delta.x > 0 ||                      // if first slide and slide amt is greater than 0
                    self.index == self.slides.length - 1 && self.delta.x < 0;    // or if last slide and slide amt is less than 0

                if (self.continuous) isPastBounds = false;

                // determine direction of swipe (true:right, false:left)
                var direction = self.delta.x < 0;

                // if not scrolling vertically
                if (!self.isScrolling) {

                    if (isValidSlide && !isPastBounds) {

                        if (direction) {

                            if (self.continuous) { // we need to get the next in this direction in place

                                self._move(self._circle(self.index - 1), -self.width, 0);
                                self._move(self._circle(self.index + 2), self.width, 0);

                            } else {
                                self._move(self.index - 1, -self.width, 0);
                            }

                            
                            self._move(self.index, self.slidePos[self.index] - self.width, self.speed);
                            self._move(self._circle(self.index + 1), self.slidePos[self._circle(self.index + 1)] - self.width, self.speed);
                            self.index = self._circle(self.index + 1);

                        } else {

                            if (self.continuous) { // we need to get the next in this direction in place

                                self._move(self._circle(self.index + 1), self.width, 0);
                                self._move(self._circle(self.index - 2), -self.width, 0);

                            } else {
                                self._move(self.index + 1, self.width, 0);
                            }

                            self._move(self.index, self.slidePos[self.index] + self.width, self.speed);
                            self._move(self._circle(self.index - 1), self.slidePos[self._circle(self.index - 1)] + self.width, self.speed);
                            self.index = self._circle(self.index - 1);

                        }
                        let index = self.special ? self.index % 2 : self.index;
                        options.callback && options.callback(index, self.slides[index]);

                    } else {

                        if (self.continuous) {

                            self._move(self._circle(self.index - 1), -self.width, self.speed);
                            self._move(self.index, 0, self.speed);
                            self._move(self._circle(self.index + 1), self.width, self.speed);

                        } else {

                            self._move(self.index - 1, -self.width, self.speed);
                            self._move(self.index, 0, self.speed);
                            self._move(self.index + 1, self.width, self.speed);
                        }

                    }

                }

                // kill touchmove and touchend event listeners until touchstart called again
                self.element.removeEventListener('touchmove', self.events, false);
                self.element.removeEventListener('touchend', self.events, false);
                self.element.removeEventListener('touchforcechange', function () { }, false);
                

            },
            transitionEnd: function (event) {

                if (parseInt(event.target.getAttribute('data-self.index'), 10) == self.index) {

                    if (self.delay) {
                        self._begin();
                    }

                    options.transitionEnd && options.transitionEnd.call(event, self.index, self.slides[self.index]);

                }

            }

        };


        // trigger setup
        this._setup();

        // add event listeners
        if (this.browser.addEventListener) {

            // set touchstart event on element
            if (this.browser.touch) {
                this.element.addEventListener('touchstart', this.events, false);
                this.element.addEventListener('touchforcechange', function () { }, false);
            }

            if (this.browser.transitions) {
                this.element.addEventListener('webkitTransitionEnd', this.events, false);
                this.element.addEventListener('msTransitionEnd', this.events, false);
                this.element.addEventListener('oTransitionEnd', this.events, false);
                this.element.addEventListener('otransitionend', this.events, false);
                this.element.addEventListener('transitionend', this.events, false);
            }

            // set resize event on window
            window.addEventListener('resize', this.events, false);

        } else {

            window.onresize = function () { this._setup(); }; // to play nice with old IE

        }

        // start auto slideshow if applicable
        if (this.delay) {

            this._begin();

        }


    }

    _setup() {

        // cache slides
        this.slides = this.element.children;

        this.length = this.slides.length;

        // set continuous to false if only one slide
        this.continuous = this.slides.length < 2 ? false : this.options.continuous;

        //special case if two slides
        this.special = false;
        if (this.browser.transitions && this.continuous && this.slides.length < 3) {
          this.element.appendChild(this.slides[0].cloneNode(true));
          this.element.appendChild(this.element.children[1].cloneNode(true));
          this.slides = this.element.children;
          
          this.special = true;
        }

        // create an array to store current positions of each slide
        this.slidePos = new Array(this.slides.length);

        // determine width of each slide
        this.width = Math.round(this.container.getBoundingClientRect().width || this.container.offsetWidth);

        this.element.style.width = (this.slides.length * this.width) + 'px';

        // stack elements
        let pos = this.slides.length;
        while (pos--) {

            var slide = this.slides[pos];

            slide.style.width = this.width + 'px';
            slide.setAttribute('data-self.index', pos);

            if (this.browser.transitions) {
                slide.style.left = (pos * -this.width) + 'px';
                this._move(pos, this.index > pos ? -this.width : (this.index < pos ? this.width : 0), 0);
            }

        }

        // reposition elements before and after self.index
        if (this.continuous && this.browser.transitions) {
            this._move(this._circle(this.index - 1), -this.width, 0);
            this._move(this._circle(this.index + 1), this.width, 0);
        }

        if (!this.browser.transitions) this.element.style.left = (this.index * -this.width) + 'px';

        this.container.style.visibility = 'visible';

    }

    _prev() {

        if (this.continuous) this._slide(this.index - 1);
        else if (this.index) this._slide(this.index - 1);

    }

    _next() {

        if (this.continuous) {
            this._slide(this.index + 1);
        } else if (this.index < this.slides.length - 1) {
            this._slide(this.index + 1);
        }

    }

    _circle(index) {

        // a simple positive modulo using slides.length
        return (this.slides.length + (index % this.slides.length)) % this.slides.length;

    }

    _slide(to, slideSpeed) {

        // do nothing if already on requested slide
        if (this.index == to) return;

        if (this.browser.transitions) {

            var direction = Math.abs(this.index - to) / (this.index - to); // 1: backward, -1: forward

            // get the actual position of the slide
            if (this.continuous) {
                var natural_direction = direction;
                direction = -this.slidePos[this._circle(to)] / this.width;

                // if going forward but to < self.index, use to = slides.length + to
                // if going backward but to > self.index, use to = -slides.length + to
                if (direction !== natural_direction) to = -direction * this.slides.length + to;

            }

            var diff = Math.abs(this.index - to) - 1;
            // move all the slides between self.index and to in the right direction
            while (diff--) this._move(
                this._circle(
                    (to > this.index ? to : this.index) - diff - 1), this.width * direction, 0);

            to = this._circle(to);

            this._move(this.index, this.width * direction, slideSpeed || this.speed);
            this._move(to, 0, slideSpeed || this.speed);

            if (this.continuous) {
                this._move(this._circle(to - direction), -(this.width * direction), 0);
            }

        } else {

            to = this._circle(to);
            this._animate(this.index * -this.width, to * -this.width, slideSpeed || this.speed);
            //no fallback for a circular continuous if the browser does not accept transitions
        }

        this.index = to;
        let index = this.special ? this.index % 2 : this.index;
        this.offloadFn(this.options.callback && this.options.callback(index, this.slides[index]));
    }

    _move(index, dist, speed) {

        this._translate(index, dist, speed);
        this.slidePos[index] = dist;

    }

    _translate(index, dist, speed) {

        var slide = this.slides[index];
        var style = slide && slide.style;

        if (!style) return;

        style.webkitTransitionDuration =
            style.MozTransitionDuration =
            style.msTransitionDuration =
            style.OTransitionDuration =
            style.transitionDuration = speed + 'ms';

        style.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)';
        style.msTransform =
            style.MozTransform =
            style.OTransform = 'translateX(' + dist + 'px)';

    }

    _animate(from, to, speed) {

        // if not an animation, just reposition
        if (!speed) {

            this.element.style.left = to + 'px';
            return;

        }

        var start = +new Date();

        var timer = setInterval(function () {

            var timeElap = +new Date() - start;

            if (timeElap > speed) {

                this.element.style.left = to + 'px';

                if (this.delay) {
                    this._begin();
                }

                // options.transitionEnd && options.transitionEnd.call(event, self.index, slides[self.index]);

                clearInterval(timer);
                return;

            }

            this.element.style.left = (((to - from) * (Math.floor((timeElap / speed) * 100) / 100)) + from) + 'px';

        }, 4);

    }

    _begin() {

        clearTimeout(this.interval);
        this.interval = setTimeout(this._next.bind(this), this.delay);

    }

    _stop() {

        this.delay = 0;
        clearTimeout(this.interval);

    }

    setup() {

        this._setup();

    }

    slide(to, speed) {

        // cancel slideshow
        this._stop();

        this._slide(to, speed);

    }

    prev() {

        // cancel slideshow
        this._stop();

        this._prev();

    }

    next() {

        // cancel slideshow
        this._stop();

        this._next();

    }

    stop() {

        // cancel slideshow
        this._stop();

    }

    getPos() {

        // return current self.index position
        return this.index;

    }

    getNumSlides() {

        // return total number of slides
        return this.length;
    }

    kill() {

        // cancel slideshow
        this._stop();

        // reset element
        this.element.style.width = '';
        this.element.style.left = '';

        // reset slides
        var pos = this.slides.length;
        while (pos--) {

            var slide = this.slides[pos];
            slide.style.width = '';
            slide.style.left = '';

            if (this.browser.transitions) {
                this._translate(pos, 0, 0);
            }
        }

        // removed event listeners
        if (this.browser.addEventListener) {

            // remove current event listeners
            this.element.removeEventListener('touchstart', this.events, false);
            this.element.removeEventListener('webkitTransitionEnd', this.events, false);
            this.element.removeEventListener('msTransitionEnd', this.events, false);
            this.element.removeEventListener('oTransitionEnd', this.events, false);
            this.element.removeEventListener('otransitionend', this.events, false);
            this.element.removeEventListener('transitionend', this.events, false);
            window.removeEventListener('resize', this.events, false);

        } else {
            window.onresize = null;
        }
    }
}

// export default Swipe;
module.exports = Swipe;
