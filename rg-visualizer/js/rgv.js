/* Random graph visualizer JS scripts
 * By: Riley Price
 * Date: Sept. 18, 2020
 */

import Draw from "./drawtest.js";
import Layout from "./layouts.js";
import Graph from "./graph.js";


let slider = document.getElementById("pval");
let output = document.getElementById("pview");
let G = Graph.getGnp(50);
let T = Graph.getMST(G, 0);
let pos = Layout.KamadaKawaiLayout(T);
let cvs = document.getElementById("drawsurface");
cvs.height = window.innerHeight * 0.7;
cvs.width = window.innerWidth * 0.9;
Draw.draw(Graph.getPartialGnp(G, slider.value), pos, cvs);
output.appendChild(document.createTextNode(`p=${Number(slider.value).toFixed(3)}, `));
slider.addEventListener("input", () => {
  Draw.redraw(Graph.getPartialGnp(G, slider.value), pos, document.getElementById("drawsurface"))
  console.log(G);
  output.removeChild(output.childNodes[0]);
  output.appendChild(document.createTextNode(`p=${Number(slider.value).toFixed(3)}, `));
});
