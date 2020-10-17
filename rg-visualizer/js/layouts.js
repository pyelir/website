import Graph from "./graph.js"
import Vec from "./vec.js"

// Get random positions

export default class Layout {
  static randomLayout(G) {
    let positions = new Map();
    for (let v = 0; v < G.nodes; v++) {
      positions.set(v, new Vec(Math.random(), Math.random()));
    }
    return positions;
  }

  // Used for basic, Eades-style force-directed spring graph layout
  static getForce(G, v, layout) {
    const c1 = 2;
    const c2 = 1;
    const c3 = 1;
    const c4 = 0.1;
    const M  = 100;
    let force = new Vec(0,0);
    for (let u = 0; u < G.nodes; u++) {
      if (u != v) {
        let vu = layout.get(u).minus(layout.get(v));
        if (G.areAdjacent(u,v)) {
          let strength = (-1) * c1 * Math.log(vu.magnitude / c2);
          force = force.add(vu.unitvec.times(strength));
        } else {
          let strength = c3 / (vu.magnitude * vu.magnitude);
          force = force.add(vu.unitvec.times(strength));
        }
      }
    }
    return force;
  }

  // Generate a force-directed graph layout
  // Algorithm taken from (say where algo is from)
  static springLayout(G) {
    // parameters we don't need the user to touch
    const c1 = 2;
    const c2 = 1;
    const c3 = 1;
    const c4 = 0.1;
    const M  = 100;
    let layout = Layout.randomLayout(G);
    let increments = new Map();
    for (let i = 0; i < M; i++) {
      for (let v = 0; v < G.nodes; v++) {
        increments.set(v, Layout.getForce(G,v, layout));
    }
      for (let v = 0; v < G.nodes; v++) {
        let newPos = layout.get(v);
        newPos = newPos.add(increments.get(v).times(c4));
        layout.set(v, newPos);
      }
    }
    return layout;
  }

  static firstPartial(G, pos, Kij, Lij, node, coord) {
    let total = 0;
    for (let u = 0; u < G.nodes; u++) {
      if (u != node) {
        let numerator = Lij.get(u).get(node) * (pos.get(node).coord(coord) - pos.get(u).coord(coord));
        let denominator = (pos.get(node).x-pos.get(u).x) ** 2 + (pos.get(node).y-pos.get(u).y) ** 2;
        denominator = Math.sqrt(denominator);
        let multiplicand = (pos.get(node).coord(coord) - pos.get(u).coord(coord)) - (numerator / denominator);
        total = total + (Kij.get(u).get(node) * multiplicand);
      }
    }
    return total;
  }

  // gets spring coeffs
  static getKij(G, Dij) {
    let Kij = new Map();
    let K = 1.0;
    for (let u = 0; u < G.nodes; u++) {
      let newRow = new Map();
      for (let v = 0; v < G.nodes; v++) {
        if (u != v) {
          newRow.set(v, K / (Dij.get(u).get(v) ** 2));
        }
      }
      Kij.set(u, newRow);
    }
    return Kij;
  }

  // Computes the second partial derivative of the energy function
  // with respect to coord of node
  static getSecondPartial(G, pos, Kij, Lij, node, coord) {
    // switching coord simplifies calculations
    let opposite = Math.abs(coord - 1);
    let total = 0;
    for (let u = 0; u < G.nodes; u++) {
      if (u != node) {
        let numerator = Lij.get(u).get(node) *
                        ( (pos.get(node).coord(opposite)
                          - pos.get(u).coord(opposite) )
                        ** 2);
        let denominator = (pos.get(node).x - pos.get(u).x) ** 2 + (pos.get(node).y - pos.get(u).y) ** 2;
        denominator = Math.pow(denominator, 3/2);
        total = total + Kij.get(u).get(node) * (1 - (numerator/denominator));
      }
    }
    return total;
  }

// Clairut's theorem tells us that d^2E/dXmdYm = d^2E/dYmdXm
// Upshot: just need this function :)
  static getSecondMixedPartial(G, pos, Kij, Lij, node) {
    let total = 0;
    for (let u = 0; u < G.nodes; u++) {
      if (u != node) {
        let numerator =    Lij.get(u).get(node)
                        * (pos.get(node).x - pos.get(u).x)
                        * (pos.get(node).y - pos.get(u).y);
        let denominator =   (pos.get(node).x - pos.get(u).x) ** 2
                          + (pos.get(node).y - pos.get(u).y) ** 2;
        denominator = Math.pow(denominator, 3/2);
        total = total + Kij.get(u).get(node)*(numerator/denominator);
      }
    }
    return total;
  }

// Returns the next step in our iteration to minimize one single
// node's energy
  static getDelta(G, v, pos, Kij, Lij) {
    let a = Layout.getSecondPartial(G, pos, Kij, Lij, v, 0); // a = d^2E/dX_m^2
    let b = Layout.getSecondMixedPartial(G, pos, Kij, Lij, v);
    let c = (-1) * Layout.firstPartial(G, pos, Kij, Lij, v, 0);
    let e = Layout.getSecondMixedPartial(G, pos, Kij, Lij, v); // yes, e is just b
    let f = Layout.getSecondPartial(G, pos, Kij, Lij, v, 1);
    let g = (-1) * Layout.firstPartial(G, pos, Kij, Lij, v, 1);

    // Solve the linear equation by hand to get this
    let dx = (c * f - b * g) / (a * f - b * e);
    let dy = (c * e - a * g) / (e * b - f * a);
    return new Vec(dx, dy);
  }

  // gets largest gradient magnitude
  static getDi(G, pos, Kij, Lij) {
    let Di = new Map();
    for (let v = 0; v < G.nodes; v++) {
      let dEdXm = Layout.firstPartial(G, pos, Kij, Lij, v, 0);
      let dEdYm = Layout.firstPartial(G, pos, Kij, Lij, v, 1);
      Di.set(v, Math.sqrt(dEdXm ** 2 + dEdYm ** 2));
    }
    return Di;
  }

  static updateDi(G, pos, Kij, Lij, node, Di) {
    let dEdXm = Layout.firstPartial(G, pos, Kij, Lij, node, 0);
    let dEdYm = Layout.firstPartial(G, pos, Kij, Lij, node, 1);
    Di.set(node, Math.sqrt(dEdXm ** 2 + dEdYm ** 2));
    return Di;
  }

  // Gets ideal lengths
  static getLij(G, Dij) {
    let L = 1/Dij.get("max");
    let Lij = new Map();
    for (let u = 0; u < G.nodes; u++) {
      Lij.set(u, new Map());
      for (let v = 0; v<G.nodes; v++) {
        if (u != v) {
          Lij.get(u).set(v, L * Dij.get(u).get(v));
        }
      }
    }
    return Lij;
  }

  static KamadaKawaiLayout(G) {
    const tol = 10**(-2);
    let Dij = Graph.getAPSP(G);
    let Lij = Layout.getLij(G, Dij);
    let Kij = Layout.getKij(G, Dij);
    // Initialize with a random layout
    let pos = Layout.randomLayout(G);
    let Delta_i = Layout.getDi(G, pos, Kij, Lij);
    // get the node with the highest value Di
    let maxm = [...Delta_i.entries()].reduce((a, e) => e[1] > a[1] ? e : a)[0];
    // let OUTERCOUNT = 0;
    while (Delta_i.get(maxm) > tol) {
      let ITERCOUNT = 0;
      // let INNERCOUNT = 0;
      while (Delta_i.get(maxm) > tol) {
        // If we get stuck, kick it around a bit
        if (ITERCOUNT >= 15) {
          pos.set(maxm, new Vec(Math.random(), Math.random()));
          ITERCOUNT = 0;
        }
        /* if (INNERCOUNT > 20) {
          console.log("Inner loop too long");
          break;
        } */
        else {
          let dv = Layout.getDelta(G, maxm, pos, Kij, Lij);
          let newvec = pos.get(maxm).add(dv);
          pos.set(maxm, newvec);
          ITERCOUNT += 1;
          // INNERCOUNT += 1;
        }
        // console.log(`Comparison: tol is ${tol}, Delta_i is ${Delta_i}`);
        // console.log(`Before update: ${Delta_i.get(maxm)}`);
        Delta_i = Layout.updateDi(G, pos, Kij, Lij, maxm, Delta_i);
        // console.log(`After update: ${Delta_i.get(maxm)}`);

      }
      //console.log("Finished moving one of the points");

      /* if (OUTERCOUNT > 20) {
        console.log("Outercount too long");
        break;
      } */
      Delta_i = Layout.getDi(G, pos, Kij, Lij);
      maxm = [...Delta_i.entries()].reduce((a, e) => e[1] > a[1] ? e : a)[0];
      // OUTERCOUNT++;
    }
    return pos;
  }
}

//let G = Graph.getMST(Graph.getGnp(80), 0);
//console.log(KamadaKawaiLayout(G));
