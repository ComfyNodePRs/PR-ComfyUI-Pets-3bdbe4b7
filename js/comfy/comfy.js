import { api as _api } from '../../../scripts/api.js';
import { app as _app } from '../../../scripts/app.js';
import { ComfyWidgets as _ComfyWidgets } from "../../../scripts/widgets.js";
import { ComfyDialog as _ComfyDialog, $el as _$el } from "../../../scripts/ui.js";

export const api          = _api;
export const app          = _app;
export const ComfyWidgets = _ComfyWidgets;
export const ComfyDialog  = _ComfyDialog;
export const $el          = _$el;
export const LGraphNode   = LiteGraph.LGraphNode;

/**
 * This class exposes an intuitive render engine API 
 * for game dev in a ComfyUI node
 */
export class ComfyNode extends LiteGraph.LGraphNode {
  constructor() {
    super()
    if (!this.properties) {
      this.properties = {};
    }
    this.widgets_start_y = 10;
    this.serialize_widgets = true;
    this.isVirtualNode = true;

    this.renderCount = 0;

    this.buttons = []
  }

  /**
   * Implementation of LiteGraph.LGraphNode method
   * @private
   */
  onDrawForeground(ctx) {
    if(this.renderCount == 0) {
      this.renderOnce(ctx)
    }

    this.render(ctx)
    this.renderButtons(ctx)

    // This animation loop renders frames
    // continuously, not only when mouse moves.
    // It is disabled because after ~4mins it 
    // starts degrading the fps.
    /*
    // animation loop
    const render = () => {
      this.setDirtyCanvas(true, true)
      requestAnimationFrame(render)
    }
    render(ctx)
    */
    this.renderCount++;
  }

  /**
   * Returns mouse pos relative to this node
   * @note - the Y is wrong for this because it doesn't
   * take into account the node's header
   */
  getRelativeMouseWithinNode() {
    const [boundingX, boundingY, boundingWidth, boundingHeight] = this.getBounding();
    const [mouseX, mouseY] = app.canvas.canvas_mouse; 

    // Litegraph node header size
    var font_size = LiteGraph.DEFAULT_GROUP_FONT_SIZE || 24;
    var height = font_size * 1.4;

    const relativeMouseX = mouseX - boundingX;
    const relativeMouseY = mouseY - boundingY;

    // is mouse within node?
    if(
      relativeMouseX > 0 && 
      relativeMouseX < boundingWidth &&
      relativeMouseY > 0 &&
      relativeMouseY < boundingHeight
    ) {
      return [relativeMouseX, relativeMouseY - height];
    } else {
      return false
    }
  }

  renderButtons(ctx) {
    for (let i = 0; i < this.buttons.length; i++) {
      const button = this.buttons[i];
      button.render(ctx)

    }
  }

  onMouseDown() {
    const [mouseX, mouseY] = this.getRelativeMouseWithinNode()

    for (let i = 0; i < this.buttons.length; i++) {
      const button = this.buttons[i];
      if(button.inBounds(mouseX, mouseY)) {
        button.onClick()
      }
    }
  }


  /**
   * Add a button to the ComfyUI node
   */
  addButton(buttonText, options, callback) {
    //this.addWidget("button", buttonText, "image", callback)
    var b = new Button("Hello world", '#eeaa00', '#001122')
    b.onClick = callback 
    this.buttons.push(b)

    return b;
  }

  /**
   * Only renders when the user moves their mouse
   */
  // eslint-disable-next-line
  render(ctx) {
    // This function renders a single frame. It is called
    // every time you move your mouse
  }

  /**
   * Renders on init
   */
  // eslint-disable-next-line
  renderOnce(ctx) {
    // This function renders a single frame when the node 
    // is initialized
  }
}

export class Button {
  constructor(text, fillColor, textColor) {
    this.x = 0;
    this.y = 0;
    this.width = 100;
    this.height = 48;
    this.text = text;
    this.color = textColor;
    this.fillColor = fillColor;

    this.fontSize = "16";
    this.fontFamily = "Arial";
    this.fontWeight = "regular";
  }

  inBounds(mouseX, mouseY) {
    return !(mouseX < this.x || mouseX > this.x + this.width || mouseY < this.y || mouseY > this.y + this.height);
  }

  onClick() {
    // implement
  }

  /**
   * Default button styles
   */
  render(ctx) {
    ctx.fillStyle = this.fillColor;
    ctx.beginPath();
    ctx.roundRect(
      this.x, 
      this.y, 
      this.width, 
      this.height,
      8
    );  
    ctx.fill()

    // draw the button text
    ctx.fillStyle = "#fff"//this.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    //console.log(this.fontSize, this.fontWeight, this.fontFamily)

    if(this.fontWeight == 'regular') {
      ctx.font = `${this.fontSize}px ${this.fontFamily}`;
    } else {
      ctx.font = `${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`;
    }

    ctx.fillText(
      this.text, 
      this.x + this.width / 2,
      this.y + this.height / 2,
      //this.button
    );
  }
}
