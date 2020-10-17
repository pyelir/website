import Graph from "./graph.js";
import Layout from "./layouts.js";
import Vec from "./vec.js";

export default class Draw {
  static getExtrema(positions){
    // Ugly hack, but initializes extrema to xMin=xMax= first x coordinate and
    // yMin=yMax=first y coordinate
    let extrema;
    for (let k of positions.keys()) {
      let firstPos = positions.get(k);
      extrema = new Extrema(firstPos.x, firstPos.y);
      break;
    }
    for (let node of positions.keys()) {
      let newPos = positions.get(node);
      let newY = newPos.y;
      let newX = newPos.x;
      if (newY < extrema.getMinY()) {
        extrema.setMinY(newY);
      }
      if (newY > extrema.getMaxY()) {
        extrema.setMaxY(newY);
      }
      if (newX < extrema.getMinX()) {
        extrema.setMinX(newX);
      }
      if (newX > extrema.getMaxX()) {
        extrema.setMaxX(newX);
      }
    }
    return extrema;
  }

  static draw(G, positions, cvs) {
    let extrema = Draw.getExtrema(positions);
    let scale = new Coords(extrema, cvs)
    for (let v = 0; v < G.nodes; v++) {
      for (let u of G.getNeighbors(v).keys()) {
        if (v < u) {
          Draw.drawLine(u,v,cvs,positions,scale);
        }
      }
    }
  }

  static redraw(G, positions, cvs) {
    const context = cvs.getContext('2d');
    context.clearRect(0, 0, cvs.width, cvs.height);
    Draw.draw(G, positions, cvs);
  }

  static drawLine(u, v, cvs, positions, coords) {
    let cx = cvs.getContext("2d");
    cx.beginPath();
    cx.strokeStyle = "grey";
    cx.lineWidth = 1;
    let x1 = coords.scale(positions.get(v).x, 0);
  //  let x1 = Math.round(width * positions.get(v).x);
    let y1 = coords.scale(positions.get(v).y, 1);
  //  let y1 =  Math.round(height * positions.get(v).y);
    let x2 = coords.scale(positions.get(u).x, 0);
  //  let x2 = Math.round(width * positions.get(u).x);
    let y2 = coords.scale(positions.get(u).y, 1);
  //  let y2 = Math.round(height * positions.get(u).y);
    cx.moveTo(x1, y1);
    cx.lineTo(x2, y2);
    cx.stroke();
  }
}

class Extrema {
  constructor(x, y) {
    this.minX = x;
    this.maxX = x;
    this.minY = y;
    this.maxY = y;
  }

  setMinY(newY) {
    this.minY = newY;
  }

  setMaxY(newY) {
    this.maxY = newY;
  }

  setMinX(newX) {
    this.minX = newX;
  }

  setMaxX(newX) {
    this.maxX = newX;
  }
  getMaxX() {
    return this.maxX;
  }

  getMinX() {
    return this.minX;
  }

  getMaxY() {
    return this.maxY;
  }

  getMinY() {
    return this.minY;
  }

  getMinCoord(idx) {
    if (idx == 0) {
      return this.minX;
    }
    return this.minY;
  }

  getMaxCoord(idx) {
    if (idx == 0) {
      return this.maxX;
    }
    return this.maxY;
  }
}

class Coords {
  // Takes an array representing the extrema of the points in each dimension
  // extrema = [[x1min, x1max], [x2min, x2max], ..., [xNmin, xNmax]]
  // and a canvas object.  (Implicitly assumes dimension 2 here)
  constructor(extrema, cvs) {
    this.extrema = extrema;
    this.dims = [cvs.width, cvs.height];
  }

  scale(val, dim){
    let M = this.extrema.getMaxCoord(dim);
    let m = this.extrema.getMinCoord(dim);
    let dxi = M - m;
    let result = Math.round(this.dims[dim] * ((val - m)/dxi));
    if (result < 0) {
      return 0;
    }
    if (result > this.dims[dim]) {
      return this.dims[dim];
    }
    return result;
  }
}


// draw(H, Layout.KamadaKawaiLayout(H), document.querySelector("canvas"));
