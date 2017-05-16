import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import { canUseDOM } from 'fbjs/lib/ExecutionEnvironment'

const textTags = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p',
]

class Orphanage extends Component {
  
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
    isFontLoaded: PropTypes.bool,
    waitForFontLoad: PropTypes.bool,
  }

  static defaultProps = {
    className: 'Orphanage',
    waitForFontLoad: false,
    isFontLoaded: false,
  }

  textElements = []

  setNodeRef = (node) => { this.node = node }

  setPadding(el, padding, textAlign = 'center') {
    switch (textAlign.toLowerCase()) {
      case 'left':
        el.style.paddingRight = `${padding}px`
        break
      case 'center':
        el.style.paddingLeft = `${padding}px`
        el.style.paddingRight = `${padding}px`
        break
      case 'right':
        el.style.paddingLeft = `${padding}px`
        break
    }
  }

  unsetPadding(el) {
    el.style.paddingLeft = null
    el.style.paddingRight = null
  }

  // TODO: Support right aligned, left padded elements?
  // TODO: Support asymetrically padded elements?
  getPadding(style) {
    let paddingRight = style.getPropertyValue('padding-right')
    paddingRight = paddingRight.replace(/px/g, '')
    paddingRight = new Number(paddingRight) || 0
    return paddingRight
  }

  getLineHeight(style) {
    let lineHeight = style.getPropertyValue('line-height')
    lineHeight = lineHeight.replace(/px/g, '')
    lineHeight = new Number(lineHeight)
    return lineHeight
  }

  getTextAlign(style) {
    const textAlign = style.getPropertyValue('text-align')
    return textAlign
  }

  findOptimalPadding(options) {
    // Destructure options / defaults
    const {
      el,
      minPadding = 0,
      maxPadding = Infinity,
      height = 0,
      textAlign = 'center',
    } = options
    // Bail out when the distance is less than one pixel
    if (maxPadding - minPadding < 1) { return minPadding }
    // Pick a padding value half-way between min and max
    const newPadding = minPadding + (maxPadding - minPadding) / 2
    // Try on the new padding
    this.setPadding(el, newPadding, textAlign)
    // Measure the new height
    const { height: newHeight } = el.getBoundingClientRect() 
    // See if we broke the layout
    const newPadTooBig = newHeight > height
    // Recurse 
    return this.findOptimalPadding({
      el, height, textAlign,
      // Try a bolder padding if we didn't break the layout
      minPadding: (!newPadTooBig) ? newPadding : minPadding,
      // Try a weaker padding if we broke the layout
      maxPadding: (newPadTooBig) ? newPadding : maxPadding,
    })
  }

  balanceElements() {
    this.textElements.forEach((el) => {
      // Get dimensions
      const { height, width } = el.getBoundingClientRect()
      // Get CSS
      const textStyle = canUseDOM && window.getComputedStyle(el)
      // Don't balance empty elements
      if (height == 0) {
        return false
      }
      // Get line height
      const lineHeight = this.getLineHeight(textStyle)
      // Don't balance one-liners
      if (Math.floor(lineHeight) == Math.floor(height)) {
        return false
      }
      // Get padding
      const paddingRight = this.getPadding(textStyle)
      // Get text align
      const textAlign = this.getTextAlign(textStyle)
      // recursively find optimal padding
      const padding = this.findOptimalPadding({
        el, height, textAlign,
        // start with existing padding
        minPadding: paddingRight,
        // dont pad more than half width
        maxPadding: width / 5,
      })
      // ensure optimal padding is set
      const { height: newHeight } = el.getBoundingClientRect()
      if (newHeight > height) {
        this.setPadding(el, paddingRight, textAlign)
      } else {
        this.setPadding(el, padding, textAlign)
      }
    })
  }

  unbalanceElement = (el) => {
    this.unsetPadding(el)
  }

  collectTextElements(domEl) {
    return textTags.reduce((found, tagName) => {
      const children = domEl.getElementsByTagName(tagName)
      return found.concat(Array.from(children))
    }, [])
  }

  componentDidMount() {
    if (!canUseDOM) { return false }

    const { isFontLoaded } = this.props
    const domEl = ReactDOM.findDOMNode(this.node)

    this.textElements = this.collectTextElements(domEl)

    if ((waitForFontLoad == false) ||
        (isFontLoaded == true)) {
      this.balanceElements()
    }

    canUseDOM && window.addEventListener('resize', this.onWindowResize, false)
  }

  componentDidUpdate(oldProps) {
    if (!canUseDOM) { return false }

    const { isFontLoaded } = this.props
    const { isFontLoaded: wasFontLoaded } = oldProps
    // Rebalance element if font was loaded late
    if (isFontLoaded == true && wasFontLoaded == false) {
      this.balanceElements()      
    }
  }

  unbalanceElements() {
    this.textElements.forEach(this.unbalanceElement)
  }

  onWindowResize = () => {
    this.unbalanceElements()
    canUseDOM && window.removeEventListener('resize', this.onWindowResize)
    // TODO: Schedule throttled or timed-out rebalancing of elements 
  }

  render() {
    const {
      children, className, waitForFontLoad, isFontLoaded, ...rest
    } = this.props
        
    return (<div className={ className } ref={ this.setNodeRef } { ...rest }>
      { children }
    </div>)
  }

}

// Example: Connect `isFontLoaded` to global state with Redux
//
// import { connect } from 'react-redux'
// const redux = (state) => ({
//   isFontLoaded: state.getIn(['global', 'isFontLoaded'])
// })
// export default connect(redux)(Orphanage)

export default Orphanage
