
/* 
let eyecolor = new Map([
  ["jane", "blue"],
  ["jake", "brown"],
  ["josh", "blue"],
  ["jojo", "black"],
  ["jill", "blue"],
]);
 */

export function mapFrequencySorted(mapObj) {
  // Step 1: Count frequency of each elem
  const count = new Map();
  for (let value of mapObj.values()) {
      count.set(value, (count.get(value) || 0) + 1);
  }
  
  // Step 2: Convert to array and sort by frequency
  const result = Array.from(count.entries())
      .sort((a, b) => b[1] - a[1])  // Sort descending by count
      .map(entry => ({
          value: entry[0],
          count: entry[1]
      }));
  
  return result;
}
// @test mapFrequencySorted
//const sortedColors = mapFrequencySorted(eyecolor);
//console.log(sortedColors);

//@result
/* 
[
  { value: 'blue', count: 3 }, 
  { value: 'brown', count: 1 },
  { value: 'black', count: 1 } 
]
 */