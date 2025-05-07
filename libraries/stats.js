//import'./simple-statistics.min.js'
import ss from './simple-statistics.js'

export default class Stats {

  static dataAnalysis(dataset){
    const sum = Stats.sum(dataset)
    const mean = Stats.mean(dataset)
    const min = Stats.findMin(dataset)
    const max = Stats.findMax(dataset)
    const confidenceInterval = Stats.confidenceInterval(dataset)
    const variance = Stats.variance(dataset)
    const stdDeviation = Stats.stdDeviation(dataset)
    const skewness = dataset.length>=3 ? ss.sampleSkewness(dataset) : undefined;
    return {sum, mean, min, max, confidenceInterval, variance, stdDeviation, skewness}
  }

  static findMax(arr) {
    if (arr.length === 0) return null; // Handle empty array
    let max = arr[0]; // Initialize with first element
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] > max) {
        max = arr[i];
      }
    }
    return max;
  }

  static max(arr) {
    if (arr.length === 0) return null; // Handle empty array
    let max = arr[0]; // Initialize with first element
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] > max) {
        max = arr[i];
      }
    }
    return max;
  }

  static findMin(arr) {
    if (arr.length === 0) return null; // Handle empty array
    let min = arr[0]; // Initialize with first element
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] < min) {
        min = arr[i];
      }
    }
    return min;
  }

  static min(arr) {
    if (arr.length === 0) return null; // Handle empty array
    let min = arr[0]; // Initialize with first element
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] < min) {
        min = arr[i];
      }
    }
    return min;
  }

  static sum(data) {
    if (!data || data.length === 0) {
      throw new Error("Data array cannot be empty");
    }
    return data.reduce((sum, x) => sum + x, 0);
  }

  static mean(data) {
    if (!data || data.length === 0) {
      throw new Error("Data array cannot be empty");
    }
    return data.reduce((sum, x) => sum + x, 0) / data.length;
  }

  static variance(data) {
    if (!data || data.length === 0) {
      throw new Error("Data array cannot be empty");
    }
    const mean = Stats.mean(data);
    return (
      data.reduce((sum, x) => sum + (x - mean) ** 2, 0) / (data.length - 1)
    );
  }

  static stdDeviation(data) {
    return Math.sqrt(Stats.variance(data));
  }



  static confidenceInterval(data, confidence = 0.95) {
    if (!data || data.length === 0) {
      throw new Error("Data array cannot be empty");
    }
    if (confidence <= 0 || confidence >= 1) {
      throw new Error("Confidence level must be between 0 and 1");
    }

    const mean = Stats.mean(data);
    const stdDev = Stats.stdDeviation(data);
    const n = data.length;

    // Z-scores for common confidence levels
    const zScores = { 0.9: 1.645, 0.95: 1.96, 0.99: 2.576 };
    const z = zScores[confidence] || 1.96; // Default to 95%

    const marginError = z * (stdDev / Math.sqrt(n));
    return [mean - marginError, mean + marginError];
  }

  static generateUniformIntSamples(min = 0, max = 10, size = 1) {
    const samples = [];
    for (let i = 0; i < size; i++) {
        samples.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return size === 1 ? samples[0] : samples;
}

  static generateSingleNormalDistributionValue(mean, stdDev) {
    // Box-Muller transform to generate standard normal random variable
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    
    // Scale and shift to desired mean and standard deviation
    return mean + stdDev * z;
  }

  static generateNormalDistributionSamples(mean=50, stdDev=13, count=100) {
    const results = [];
    for (let i = 0; i < count; i++) {
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        results.push(mean + stdDev * z);
    }
    return results;
  }

  static trimDecimal(num, decimals){
    const factor = Math.pow(10, decimals)
    return Math.round(num * factor) / factor
  }
  
  static __trimDecimal(num, decimals) {
    return parseFloat(num.toFixed(decimals))
  }

  static shortenNumber(num) {
    // Check if the input is a valid number
    if (isNaN(num) || typeof num !== 'number'){
      //throw new Error("The input is not a valid number")
      return num
    }
  
    // Define suffixes and their thresholds
    const suffixes = [
      { suffix: 'T', threshold: 1e12 }, // Trillion
      { suffix: 'B', threshold: 1e9 },  // Billion
      { suffix: 'M', threshold: 1e6 },  // Million
      { suffix: 'K', threshold: 1e3 },  // Thousand
      { suffix: '', threshold: 1 }      // No suffix
    ];
  
    // Convert number to absolute value to handle negative numbers
    const isNegative = num < 0;
    const absNum = Math.abs(num);
  
    // Find the appropriate suffix
    for (const { suffix, threshold } of suffixes) {
      if (absNum >= threshold) {
        // Divide number by threshold and round to 1 decimal place
        let shortened = absNum / threshold;
        shortened = Math.round(shortened * 10) / 10; // Round to 1 decimal place
  
        // Remove decimal if it's a whole number
        const result = shortened % 1 === 0 ? shortened : shortened.toFixed(1);
        
        // Return with negative sign if original number was negative
        return `${isNegative ? '-' : ''}${result}${suffix}`;
      }
    }
  
    // Return the number as is if it's less than 1
    return `${isNegative ? '-' : ''}${absNum}`;
  }

  static shortenNumberLog(num) {
    if (isNaN(num) || typeof num !== 'number'){
      throw new Error("The input is not a valid number")
    }
  
    const isNegative = num < 0;
    const absNum = Math.abs(num);
  
    if (absNum < 1000) return `${isNegative ? '-' : ''}${absNum}`;
  
    const units = ['', 'K', 'M', 'B', 'T'];
    const exponent = Math.min(Math.floor(Math.log10(absNum) / 3), units.length - 1);
    const shortened = absNum / Math.pow(1000, exponent);
    const result = shortened % 1 === 0 ? shortened : shortened.toFixed(1);
  
    return `${isNegative ? '-' : ''}${result}${units[exponent]}`;
  }
  
  static generateSingleExponentialDistributionValue(rate=1){
    if (rate <= 0) {
      throw new Error("Rate parameter must be positive.");
    }
    return -Math.log(1 - Math.random()) / rate;
  }

  static generateExponentialSamples(rate=1, size = 100) {
    /**
     * Generate random samples from an exponential distribution.
     * f(x) = λe^(-λx) for x ≥ 0.
     * rate - The rate parameter (lambda) of the exponential distribution (must be positive).
     * size - Number of samples to generate.
     */
    if (rate <= 0) {
        throw new Error("Rate parameter must be positive.");
    }
    
    // Generate an array of samples
    const samples = new Array(size);
    for (let i = 0; i < size; i++) {
        samples[i] = -Math.log(1 - Math.random()) / rate;
    }
    return samples;
  }

  static gammaRandom(k, theta) {
/*     
    k < 1: Skewed, heavy-tailed, peaks near 0.
    k = 1: Exponential distribution (special case).
    k > 1: Becomes more bell-shaped, less skewed as ( k ) increases.
    theta: Stretches or compresses the distribution. Larger theta 
           spreads values out (increases mean and variance).
*/

    if (k < 1) {
        // For k < 1, use the property Gamma(k) + Gamma(1) = Gamma(k+1)
        return Stats.gammaRandom(1 + k, theta) * Math.pow(Math.random(), 1 / k);
    }

    // Marsaglia & Tsang's algorithm for k >= 1
    let d = k - 1 / 3;
    let c = 1 / Math.sqrt(9 * d);
    while (true) {
        let x, v, u;
        do {
            x = Math.random() * 2 - 1; // Normal approximation via Box-Muller
            v = 1 + c * x;
        } while (v <= 0);
        v = v * v * v;
        u = Math.random();
        if (u < 1 - 0.0331 * x * x * x * x) return d * v * theta;
        if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v * theta;
    }
}

// Generate n samples from Gamma(k, theta)
static generateGammaSamples(n, k, theta) {
    let samples = [];
    for (let i = 0; i < n; i++) {
        samples.push(Stats.gammaRandom(k, theta));
    }
    return samples;
}

static betaRandom(alpha, beta) {
  let x = Stats.gammaRandom(alpha, 1); // Gamma(alpha, 1)
  let y = Stats.gammaRandom(beta, 1);  // Gamma(beta, 1)
  return x / (x + y);
}

// Generate n samples from Beta(alpha, beta)
static generateBetaSamples(n, alpha, beta) {
  let samples = [];
  for (let i = 0; i < n; i++) {
      samples.push(Stats.betaRandom(alpha, beta));
  }
  return samples;
}

// Generate Binomial Samples
static generateBinomialSamples(n, p, size = 1) {
  // n: number of trials
  // p: probability of success
  // size: number of samples to generate
  const samples = [];
  
  for (let i = 0; i < size; i++) {
      let successes = 0;
      for (let j = 0; j < n; j++) {
          if (Math.random() < p) {
              successes++;
          }
      }
      samples.push(successes);
  }
  
  return size === 1 ? samples[0] : samples;
}

static generatePoissonSamples(lambda, size = 1) {
  // Knuth Algorithm
  // lambda: expected number of events
  // size: number of samples to generate
  const samples = [];
  
  for (let i = 0; i < size; i++) {
      let k = 0;
      let p = 1.0;
      const L = Math.exp(-lambda);
      
      do {
          k++;
          p *= Math.random();
      } while (p > L);
      
      samples.push(k - 1);
  }
  
  return size === 1 ? samples[0] : samples;
}

static generateWeibullSample(shape, scale, size = 1) {
  // Uses the inverse transform method: generates uniform random 
  // numbers and transforms them to Weibull-distributed values
  // Takes parameters: 
  //    shape (k, controls distribution shape), 
  //    scale (λ, controls spread), and optional size (number of samples)
  //    size: number of samples to generate
  const samples = [];
  
  for (let i = 0; i < size; i++) {
      const u = Math.random();
      const sample = scale * Math.pow(-Math.log(1 - u), 1 / shape);
      samples.push(sample);
  }
  
  return size === 1 ? samples[0] : samples;
}

  static _generateEqualIntervals(data, intervalCount){
    const analysis = Stats.dataAnalysis(data)
    let {min, max} = analysis
    let intervals = Array(intervalCount+1).fill(0)
    let step = (max-min)/intervalCount
    intervals.map((e,i,arr) => {
      arr[i] = min + i*step
    })
    intervals.at(-1) = max

    return intervals
  }

  static generateEqualIntervals(dataset, intervalCount) {
    // Find min and max values in dataset
    const analysis = Stats.dataAnalysis(dataset)
    let {min, max} = analysis
    
    // Calculate interval size
    const intervalSize = (max - min) / intervalCount;
    
    // Generate intervals
    const intervals = [];
    for (let i = 0; i <= intervalCount; i++) {
        intervals.push(min + (i * intervalSize));
    }
    
    return intervals;
  }

  static generateFrequencyArray(dataset, intervals) {
    const frequencyArray = [];
    
    // Iterate through intervals to create ranges
    for (let i = 0; i < intervals.length - 1; i++) {
        const lowerBound = intervals[i];
        const upperBound = intervals[i + 1];
        
        // Count numbers in dataset that fall within [lowerBound, upperBound)
        const frequency = dataset.filter(num => 
            num >= lowerBound && num < upperBound
        ).length;
        
        // Add range and frequency to result
        frequencyArray.push({
            range: [lowerBound, upperBound],
            frequency: frequency
        });
    }
    
    return frequencyArray;
  }
/*
Chropleth Bins(Intervals) Generating Approaches
  Equal-Width Intervals:
  - Divides the range of the data (min to max) into equal-sized intervals.
  - Best for uniformly distributed data but can be misleading for skewed or clustered data, 
    as some intervals may be empty or overly populated.

  Natural Breaks (Jenks Optimization):
  - Uses a clustering algorithm to minimize variance within intervals and maximize variance between intervals.
  - Ideal for revealing natural groupings in the data, especially for non-uniform distributions.

  Standard Deviation Intervals:
  - Creates intervals based on the mean and standard deviation of the data.
  - Suitable for normally distributed (Gaussian) data, highlighting deviations from the mean.

  Geometric or Logarithmic Intervals:
  - Uses exponentially increasing interval sizes.
  - Effective for highly skewed data, such as exponential or log-normal distributions.

  K-Means Clustering:
  - Groups data into clusters based on value similarity, then uses cluster boundaries as intervals.
  - Good for multimodal data with distinct clusters.

  Custom Thresholds:
  - Defines intervals based on domain-specific thresholds (e.g., policy-relevant cutoffs like poverty levels).
  - Requires prior knowledge of meaningful boundaries.

  Quantile Based Approach
  - Adaptability: Quantile-based intervals adapt to any data distribution (uniform, normal, exponential, multimodal, etc.).
  - Balanced Representation: Each interval contains roughly the same number of data points, ensuring that the 
    choropleth map visually represents the data distribution well.
  - Robustness: Handles outliers and clustered data effectively compared to equal-width intervals.



*/
  
static generateQuantaileChoroplethIntervals(dataset, intervalCount) {
  // This algorihm uses "quantile-based approach" which is 
  // effective for ensuring equal data counts per interval

  // Input validation
  if (!Array.isArray(dataset) || dataset.length === 0) {
      throw new Error("Dataset must be a non-empty array");
  }
  if (!Number.isInteger(intervalCount) || intervalCount < 2) {
      throw new Error("Interval count must be an integer >= 2");
  }

  // Sort the dataset in ascending order
  const sortedData = [...dataset].sort((a, b) => a - b);

  // Get min and max values
  const minValue = sortedData[0];
  const maxValue = sortedData[sortedData.length - 1];

  // If intervalCount is greater than dataset length, reduce it to unique values
  const uniqueValues = [...new Set(sortedData)];
  const effectiveIntervalCount = Math.min(intervalCount, uniqueValues.length);

  // If only one unique value, return [min, max]
  if (effectiveIntervalCount === 1) {
      return [minValue, maxValue];
  }

  // Calculate quantile boundaries
  const intervals = [minValue]; // Start with min value
  const step = sortedData.length / effectiveIntervalCount;

  for (let i = 1; i < effectiveIntervalCount; i++) {
      const index = Math.floor(i * step);
      // Use the value at the index or interpolate for smoother boundaries
      const value = sortedData[index];
      intervals.push(value);
  }

  // Ensure max value is included as the last boundary
  if (intervals[intervals.length - 1] !== maxValue) {
      intervals.push(maxValue);
  }

  // Remove duplicates in case of clustered data
  return [...new Set(intervals)];
}

static generateEqualIntervals(dataset, intervalCount) {
/*
  Works well for uniformly distributed data.
  Intuitive for users expecting consistent interval sizes.
  Less effective for skewed or clustered data, as some intervals may contain no data.
*/

  if (!Array.isArray(dataset) || dataset.length === 0) {
      throw new Error("Dataset must be a non-empty array.");
  }
  if (!Number.isInteger(intervalCount) || intervalCount < 2) {
      throw new Error("intervalCount must be an integer >= 2.");
  }

  const min = Math.min(...dataset);
  const max = Math.max(...dataset);
  const range = max - min;
  const step = range / intervalCount;

  const intervals = [];
  for (let i = 0; i <= intervalCount; i++) {
      intervals.push(min + i * step);
  }

  return intervals;
}

static generateJenksIntervals(dataset, intervalCount) {
/*
  Adapts to natural clusters in the data.
  Minimizes within-interval variance, making intervals meaningful.
*/
  if (!Array.isArray(dataset) || dataset.length === 0) {
      throw new Error("Dataset must be a non-empty array.");
  }
  if (!Number.isInteger(intervalCount) || intervalCount < 2) {
      throw new Error("intervalCount must be an integer >= 2.");
  }

  // Sort the dataset
  const sortedData = [...dataset].sort((a, b) => a - b);
  const n = sortedData.length;
  if (intervalCount > n) {
      intervalCount = n;
  }

  // Initialize arrays for dynamic programming
  const lowerClassLimits = Array.from({ length: n + 1 }, () => Array(intervalCount + 1).fill(0));
  const varianceCombinations = Array.from({ length: n + 1 }, () => Array(intervalCount + 1).fill(Infinity));

  // Compute variance for each segment
  varianceCombinations[0][0] = 0;

  for (let i = 1; i <= n; i++) {
      let sum = 0,
          sumSquares = 0,
          w = 0;

      for (let m = 1; m <= i; m++) {
          const lowerIndex = i - m + 1;
          const val = sortedData[lowerIndex - 1];
          w++;
          sum += val;
          sumSquares += val * val;
          const variance = sumSquares - (sum * sum) / w;

          if (lowerIndex !== 1) {
              for (let j = 1; j <= intervalCount; j++) {
                  if (varianceCombinations[i][j] > varianceCombinations[lowerIndex - 1][j - 1] + variance) {
                      lowerClassLimits[i][j] = lowerIndex;
                      varianceCombinations[i][j] = varianceCombinations[lowerIndex - 1][j - 1] + variance;
                  }
              }
          }
      }

      lowerClassLimits[i][1] = 1;
      varianceCombinations[i][1] = sumSquares - (sum * sum) / w;
  }

  // Extract breaks
  const intervals = [sortedData[0]];
  let k = n;
  for (let j = intervalCount; j >= 2; j--) {
      const id = lowerClassLimits[k][j] - 1;
      intervals.push(sortedData[id]);
      k = lowerClassLimits[k][j] - 1;
  }
  intervals.push(sortedData[n - 1]);

  return [...new Set(intervals.sort((a, b) => a - b))];
}

static generateStandardDeviationIntervals(dataset, intervalCount) {
/*
  Best for normally distributed (Gaussian) data.
  Highlights how data deviates from the mean.
  Less effective for non-normal distributions.
*/
  if (!Array.isArray(dataset) || dataset.length === 0) {
      throw new Error("Dataset must be a non-empty array.");
  }
  if (!Number.isInteger(intervalCount) || intervalCount < 2) {
      throw new Error("intervalCount must be an integer >= 2.");
  }

  // Calculate mean and standard deviation
  const n = dataset.length;
  const mean = dataset.reduce((sum, val) => sum + val, 0) / n;
  const variance = dataset.reduce((sum, val) => sum + (val - mean) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);

  // Generate intervals based on standard deviations
  const intervals = [];
  const steps = (intervalCount - 1) / 2; // Number of steps on each side of the mean
  const stepSize = stdDev;

  // Add intervals below and above the mean
  for (let i = -steps; i <= steps; i++) {
      intervals.push(mean + i * stepSize);
  }

  // Ensure intervals cover the data range
  const min = Math.min(...dataset);
  const max = Math.max(...dataset);
  if (intervals[0] > min) intervals.unshift(min);
  if (intervals[intervals.length - 1] < max) intervals.push(max);

  return [...new Set(intervals.sort((a, b) => a - b))];
}

static generateGeometricIntervals(dataset, intervalCount) {
/*
  Ideal for logarithmic or exponential distributions.
  Works well when data is concentrated at lower values with a long tail.
  Effective for skewed or exponential data.
  Captures long-tail distributions.
*/
  if (!Array.isArray(dataset) || dataset.length === 0) {
      throw new Error("Dataset must be a non-empty array.");
  }
  if (!Number.isInteger(intervalCount) || intervalCount < 2) {
      throw new Error("intervalCount must be an integer >= 2.");
  }

  const min = Math.min(...dataset);
  const max = Math.max(...dataset);

  // Handle case where min and max are the same
  if (min === max) {
      return [min, max];
  }

  // Transform data to logarithmic scale if positive
  const isPositive = min > 0;
  const logMin = isPositive ? Math.log(min) : 0;
  const logMax = isPositive ? Math.log(max) : Math.log(max - min + 1);

  const intervals = [];
  const logStep = (logMax - logMin) / intervalCount;

  for (let i = 0; i <= intervalCount; i++) {
      const logValue = logMin + i * logStep;
      let value = isPositive ? Math.exp(logValue) : Math.exp(logValue) + min - 1;
      intervals.push(value);
  }

  // Adjust boundaries to include min and max
  intervals[0] = min;
  intervals[intervals.length - 1] = max;

  return [...new Set(intervals.sort((a, b) => a - b))];
}

static generateKMeansIntervals(dataset, intervalCount) {
/*
- Suitable for datasets with distinct clusters.
- Similar to Jenks but more flexible for non-optimal clustering.
- Computationally intensive for large datasets.

Pros:
- Captures natural clusters effectively.
- Flexible for various data distributions.
Cons:
- Sensitive to initial centroid placement.
- Computationally intensive.
*/
  if (!Array.isArray(dataset) || dataset.length === 0) {
      throw new Error("Dataset must be a non-empty array.");
  }
  if (!Number.isInteger(intervalCount) || intervalCount < 2) {
      throw new Error("intervalCount must be an integer >= 2.");
  }

  const data = dataset.map(x => [x]);
  const n = data.length;
  if (intervalCount > n) {
      intervalCount = n;
  }

  // Initialize centroids randomly
  const sortedData = [...dataset].sort((a, b) => a - b);
  let centroids = [];
  for (let i = 0; i < intervalCount; i++) {
      centroids.push([sortedData[Math.floor(i * (n - 1) / (intervalCount - 1))]]);
  }

  // K-means clustering
  let assignments = new Array(n).fill(0);
  let changed = true;
  const maxIterations = 100;

  for (let iter = 0; iter < maxIterations && changed; iter++) {
      changed = false;

      // Assign points to nearest centroid
      for (let i = 0; i < n; i++) {
          let minDist = Infinity;
          let newCluster = 0;
          for (let j = 0; j < intervalCount; j++) {
              const dist = Math.abs(data[i][0] - centroids[j][0]);
              if (dist < minDist) {
                  minDist = dist;
                  newCluster = j;
              }
          }
          if (assignments[i] !== newCluster) {
              changed = true;
              assignments[i] = newCluster;
          }
      }

      // Update centroids
      const counts = new Array(intervalCount).fill(0);
      const sums = new Array(intervalCount).fill(0);
      for (let i = 0; i < n; i++) {
          sums[assignments[i]] += data[i][0];
          counts[assignments[i]]++;
      }
      for (let j = 0; j < intervalCount; j++) {
          centroids[j][0] = counts[j] > 0 ? sums[j] / counts[j] : centroids[j][0];
      }
  }

  // Sort centroids and create intervals
  const sortedCentroids = centroids.map(c => c[0]).sort((a, b) => a - b);
  const intervals = [sortedData[0]];
  for (let i = 1; i < intervalCount; i++) {
      intervals.push((sortedCentroids[i - 1] + sortedCentroids[i]) / 2);
  }
  intervals.push(sortedData[n - 1]);

  return [...new Set(intervals.sort((a, b) => a - b))];
}


static generateBins(data, mode="a", count) {
    // Input validation
    if (!Array.isArray(data) || data.length === 0 || !Number.isInteger(count) || count < 1) {
        throw new Error('Invalid input: data must be a non-empty array and count must be a positive integer.');
    }
    let modes = {
      "equal": "e",
      "quantile": "q",
      "logarithmic": "l",
      "k-mean": "k",
      "jenks": "j",
      "gaussian": "g",
      "fraction": "f",
      "percentage": "p",
      "auto": "a",
    }
    mode = mode.length > 1 ? modes[mode] : mode;

    if (!Object.values(modes).includes(mode) ) {
        throw new Error('Invalid mode: must be one of "e", "q", "l", "k", "j", "g" "a".');
    }


    // Filter out non-numeric values and sort
    const cleanedData = data.filter(x => typeof x === 'number' && !isNaN(x)).sort((a, b) => a - b);
    if (cleanedData.length === 0) {
        throw new Error('No valid numeric data provided.');
    }

    const min = cleanedData[0];
    const max = cleanedData[cleanedData.length - 1];

    // Generate bins based on mode
    let bins;
    switch (mode) {
        case 'e':
            bins = Stats.equalIntervalBins(min, max, count);
            break;
        case 'q':
            bins = cleanedData.length >= count ? Stats.quantileBins(cleanedData, count) : Stats.equalIntervalBins(min, max, count);
            break;
        case 'l':
            bins = Stats.logarithmicBins(cleanedData, count);
            break;
        case 'k':
            bins = Stats.kMeansBins(cleanedData, count);
            break;
        case 'j':
            bins = Stats.jenksBins(cleanedData, count);
            break;
        case 'g':
            bins = Stats.normalBins(cleanedData, count);
            break;
        case 'f':
            bins = [0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1]
            break;
        case 'p':
            bins = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
            break;
        case 'a':
            bins = Stats.autoGenerateBins(cleanedData, count);
            break;
    }

    // Ensure unique, sorted bins
    bins = [...new Set(bins)].sort((a, b) => a - b);
    return bins;
}

static autoGenerateBins(data, count) {
  const skewness = ss.sampleSkewness(data);
  const mode = Math.abs(skewness) < 0.5 ? 'g' : skewness > 1 ? 'l' : 'q';
  return generateBins(data, mode, count);
}

// Equal Interval Bins ('e')
static equalIntervalBins(min, max, count) {
    const range = max - min;
    const binWidth = range / count;
    const bins = [];
    for (let i = 0; i <= count; i++) {
        bins.push(min + i * binWidth);
    }
    return bins;
}

// Quantile Bins ('q')
static quantileBins(data, count) {
    const bins = [];
    for (let i = 0; i <= count; i++) {
        const quantile = i / count;
        bins.push(ss.quantileSorted(data, quantile));
    }
    return bins;
}

// Logarithmic Bins ('l')
static logarithmicBins(data, count) {
    // Handle negative/zero values by shifting data to positive
    const minPositive = Math.min(...data.filter(x => x > 0)) || 1;
    const shift = Math.min(0, Math.min(...data)) <= 0 ? -Math.min(...data) + minPositive : 0;
    const shiftedData = data.map(x => x + shift);

    const min = Math.min(...shiftedData);
    const max = Math.max(...shiftedData);
    const logMin = Math.log(min);
    const logMax = Math.log(max);
    const logRange = logMax - logMin;
    const logBinWidth = logRange / count;

    const bins = [];
    for (let i = 0; i <= count; i++) {
        bins.push(Math.exp(logMin + i * logBinWidth) - shift);
    }
    return bins;
}

// K-Means Bins ('k')
static kMeansBins(data, count) {
    // Prepare data for k-means (simple-statistics expects 1D array)
    const clusters = ss.ckmeans(data, count);
    const bins = [Math.min(...data)];
    clusters.forEach(cluster => {
        bins.push(Math.max(...cluster));
    });
    return bins;
}

// Jenks Natural Breaks ('j')
static jenksBins(data, count) {
    const breaks = ss.jenks(data, count);
    return breaks; // Already includes min and max, length is count + 1
}

// Normal Distribution Bins ('g')
static normalBins(data, count) {
    const mean = ss.mean(data);
    const stdDev = ss.standardDeviation(data);

    // Create symmetric bins based on standard deviations
    // For count bins, use (count/2) std devs on each side of mean
    const bins = [];
    const step = 2 / count; // Spread bins over ±2 std devs
    for (let i = 0; i <= count; i++) {
        const z = -1 + (i * step); // Z-score from -1 to +1
        bins.push(mean + z * stdDev * 2);
    }
    return bins;
}

static datasetStats(dataset){
  if(!Array.isArray(dataset) || dataset.length < 1) return {};
  const isNumericString = (value) => !isNaN(parseFloat(value)) && isFinite(value);
  const numericValuePercentage = (dataset) => dataset.filter(x => isNumericString(x)).length / dataset.length;
  const nonEmptystringValuePercentage = (dataset) => dataset.filter(x => typeof x === 'string' && x.length > 0 && !isNumericString(x)).length / dataset.length;
  const uniqueValuePercentage = (dataset) => new Set(dataset).size / dataset.length;
  const emptyValuePercentage = (dataset) => dataset.filter(x => ["", null, undefined].includes(x)).length / dataset.length;

  return {
    numeric: numericValuePercentage(dataset),
    nonEmptyString: nonEmptystringValuePercentage(dataset),
    unique: uniqueValuePercentage(dataset),
    empty: emptyValuePercentage(dataset),
  }
}

static matchPercentage(dataset1, dataset2){
 if(!Array.isArray(dataset1) || dataset1.length < 1 || !Array.isArray(dataset2) || dataset2.length < 1)  
  return 0;
 return dataset1.filter(x => dataset2.includes(x)).length / dataset1.length;
}

}

/* // Example usage:
try {
  const sampleData = [2.5, 3.1, 4.2, 3.8, 2.9, 4.0];
  console.log("Mean:", Stats.mean(sampleData));
  console.log("Variance:", Stats.variance(sampleData));
  console.log("Standard Deviation:", Stats.stdDeviation(sampleData));
  console.log("Sum:", Stats.sum(sampleData));
  console.log(
    "95% Confidence Interval:",
    Stats.confidenceInterval(sampleData, 0.95)
  );
} catch (error) {
  console.error(error.message);
} */


  //let data = Stats.generateNormalDistributionSamples()
  //let data = Stats.generateExponentialSamples()

/*   let data = Stats.generateGammaSamples(100, 3,21)
  console.log(data.map(num => Stats.trimDecimal(num,1)))
  console.log(Stats.dataAnalysis(data)) */


/*   let data = Stats.generateBetaSamples(100, 3, 7)
  data = data.map(num => num*200)
  console.log(data)
  console.log(Stats.dataAnalysis(data)) */

  // if(module && module.exports) module.exports = Stats;