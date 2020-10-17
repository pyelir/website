
export default class PriorityQueue {
  constructor() {
    /* every element is an Object {key, obj} */
    this.elems = [];
    /* using this as a map obj -> index of Ojbect holding obj in this.elems */
    this.indices = new Map();
    /* just length of this.elems but maintaining for convenience */
    this.heapsize = 0;
  }

  /* parent, left, and right are helper functions for index calculations */
  parent(idx) {
    return Math.floor((idx-1)/2);
  }

  left(idx) {
    return 2*idx+1;
  }

  right(idx) {
    return 2*idx + 2;
  }

  swap(idx1, idx2) {
    let tmp = this.elems[idx1];
    this.elems[idx1] = this.elems[idx2];
    this.elems[idx2] = tmp;
    // Update so we can find indices give an object
    this.indices.set(this.elems[idx1].obj, idx1);
    this.indices.set(this.elems[idx2].obj, idx2);

  }

  /* min-heapify assumes that left and right children of index i are
     well-mannered binary min-heaps, but that i might be larger than one of its
     children.  it'll correct such a heap, if necessary.  */

  min_heapify(i) {
    let l = this.left(i);
    let r = this.right(i);
    let smallest;
    /* Nested conditionals needed to check if a child at left (resp. right)
       index exists before comparing it to the root of the subtree we're
       currently inspecting.
       */
    if (l < this.heapsize) {
      if (this.elems[l].key < this.elems[i].key) {
        smallest = l;
      }
      else {
        smallest = i;
      }
    } else {
      smallest = i;
    }
    if (r < this.heapsize) {
       if (this.elems[r].key < this.elems[smallest].key) {
         smallest = r;
       }
    }
    if (smallest != i) {
      this.swap(i, smallest);
      this.min_heapify(smallest);
    }
  }

  extract_min() {
    if (this.heapsize < 1) {
      throw "heap underflow";
    }

    let min = this.elems[0];
    this.elems[0] = this.elems[this.heapsize - 1];
    this.heapsize--;
    this.elems = this.elems.slice(0,-1);
    if (this.heapsize > 0) {
      this.indices.set(this.elems[0].obj, 0);
      this.indices.delete(min.obj);
      this.min_heapify(0);
    }
    return min.obj;
  }

  decrease_key(obj, newkey) {
    let i = this.indices.get(obj);
    if (newkey > this.elems[i].key) {
      throw "new key bigger than old key";
    }
    this.elems[i].key = newkey;
    while ((i > 0) && (this.elems[this.parent(i)].key > this.elems[i].key)) {
      this.swap(i, this.parent(i));
      i = this.parent(i);
    }
  }

  heap_insert(elem,key) {
      this.elems[this.heapsize] = {'obj': elem, 'key': Infinity};
      this.indices.set(elem, this.heapsize);
      this.heapsize++;
      this.decrease_key(elem, key);
  }

  is_empty() {
    return this.heapsize == 0;
  }

  contains(elem) {
    return this.indices.has(elem);
  }

  getkey(queryObj) {
    return this.elems[this.indices.get(queryObj)].key;
  }

}

/* testing code
let test = new PriorityQueue();
let fruits = ['apple', 'orange', 'banana', 'pear', 'persimmon'];
for (let i = 0; i < 5; i++) {
  test.heap_insert(fruits[i], i);
}
console.log(test.contains("orange"));
console.log(test.contains("grapefruit"));
test.decrease_key('persimmon', 0.5)
while (!test.is_empty()) {
  console.log(test.extract_min());
}
*/
