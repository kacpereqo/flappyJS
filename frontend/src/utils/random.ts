export class Random {

     static lastValue = 0;
     static multipier = 75;
     static modulus = 65537;
     static increment= 74;

  static random(start: number = 0, end: number = 65537): number {

    Random.lastValue = (Random.multipier * Random.lastValue + Random.increment) % Random.modulus;
    return Random.lastValue%end + start;    
}

 static seed(seed: number): void {
    Random.lastValue = seed;  
  }

}