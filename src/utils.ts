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