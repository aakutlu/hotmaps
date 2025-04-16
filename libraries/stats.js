
export default class Stats {

  static dataAnalysis(data){
    const sum = Stats.sum(data)
    const mean = Stats.mean(data)
    const min = Stats.findMin(data)
    const max = Stats.findMax(data)
    const confidenceInterval = Stats.confidenceInterval(data)
    const variance = Stats.variance(data)
    const stdDeviation = Stats.stdDeviation(data)
    return {sum, mean, min, max, confidenceInterval, variance, stdDeviation}
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