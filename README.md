# mw-carousel

[![build status](http://img.shields.io/travis/voronianski/react-swipe.svg?style=flat)](https://travis-ci.org/voronianski/react-swipe)
[![npm version](http://badge.fury.io/js/react-swipe.svg)](http://badge.fury.io/js/react-swipe)
[![Download Count](http://img.shields.io/npm/dm/react-swipe.svg?style=flat)](http://www.npmjs.com/package/react-swipe)

mw-carousel based on ![react-swipe](https://www.npmjs.com/package/react-swipe). So the basic usage will be similar.

## Demo

Check out the [demo](http://voronianski.github.io/react-swipe/demo/) from a mobile device (real or emulated).

<img src="https://user-images.githubusercontent.com/974035/34205307-30965ccc-e582-11e7-9384-fe1ce991ff4f.gif" width="600" />

## Install

```bash
npm install mw-carousel
```

## Usage

### Example

```javascript
import React from 'react'
import ReactDOM from 'react-dom';
import ReactSwipe from 'react-swipe';

class Carousel extends React.Component {
    render() {
        return (
            <ReactSwipe className="carousel" swipeOptions={{continuous: false}}>
                <div>PANE 1</div>
                <div>PANE 2</div>
                <div>PANE 3</div>
            </ReactSwipe>
        );
    }
}

ReactDOM.render(
    <Carousel />, 
    document.getElementById('app')
);
```

### Props

- `swipeOptions: ?Object` - supports all original options from 
- `style: ?Object` - object with 3 keys (see [defaults](https://github.com/voronianski/react-swipe/blob/gh-pages/src/reactSwipe.js#L28)):
    -  `container: ?Object`
    -  `wrapper: ?Object`
    -  `child: ?Object` 
- regular props as `className`, `id` for root component are also supported

|property name（字段名称）|类型| default(默认值)|
|---|---|----|
|swipeOptions.startSlide|PropTypes.number|0|
|swipeOptions.speed|PropTypes.number|300(ms)|
|swipeOptions.auto|PropTypes.number|3000(ms),停顿时间|
|swipeOptions.continuous|PropTypes.bool|false, 是否循环播放|
|swipeOptions.disableScroll|PropTypes.bool|true, 禁止滚动|
|swipeOptions.stopPropagation|PropTypes.bool|true|
|swipeOptions.callback|PropTypes.func|(index, slide) => {...} index: 序号；slide: 当前element|
|id|PropTypes.string|id|
|className|PropTypes.string|classname|
|style.container|PropTypes.object|{height: '300px'}...|
|style.wrapper|PropTypes.object|{height: '300px'}...|
|style.child|PropTypes.object|{height: '300px'}...|

## Methods

Component proxies all [Swipe.js instance methods](https://github.com/thebird/swipe#swipe-api).

```javascript
<ReactSwipe>
    {images}
</ReactSwipe>
```

---

**MIT Licensed**