export const shuffleArray = (arr: any[], n: number = arr.length) =>
{
 
    // Start from the last element and swap
    // one by one. We don't need to run for
    // the first element that's why i > 0
    for (let i = n - 1; i > 0; i--)
    {
     
        // Pick a random index from 0 to i inclusive
        let j = Math.floor(Math.random() * (i + 1));
 
        // Swap arr[i] with the element
        // at random index
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}



export const getFuncExecTime = (name: string, func: any, iterations: number=1, ...params: any[]) => {
    let start;
    let end;
    let output;
    if (iterations > 1) {
        start = window.performance.now();
        for (let i=0; i < iterations; i++) {
            output = func(...params);  
        }
        end = window.performance.now(); 
    }else {
        start = window.performance.now();
        output = func(...params);  
        end = window.performance.now();
    }
    console.log("\n");
    console.log("=".repeat(20))
    console.log(`[${name}] iterations: ${iterations}`)
    console.log(`[${name}] execution time: ${end - start}`)
    console.log(`[${name}] inputs: `, params)
    console.log(`[${name}] outputs: `, {output});
    console.log("=".repeat(20))
    console.log("\n");

}