// vector in 2D Euclidean space
export default class Vec {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(other) {
    return new Vec(this.x + other.x, this.y + other.y);
  }

  minus(other) {
    return new Vec(this.x - other.x, this.y - other.y);
  }

  times(c) {
    return new Vec(c * this.x, c * this.y );
  }

  // Bit of a hack :(
  coord(num) {
    if (num == 0) {
      return this.x;
    }
    return this.y;
  }

  get magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  get unitvec() {
    let magnitude = Math.sqrt(this.x * this.x + this.y * this.y);
    return new Vec(this.x/magnitude, this.y/magnitude);
  }
}
