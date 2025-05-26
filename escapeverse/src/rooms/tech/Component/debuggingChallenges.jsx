export const debuggingChallenges = [
  {
    id: 1,
    language: 'python',
    description: 'Fix the recursive function to calculate factorial correctly',
    buggyCode: `def factorial(n):
    if n == 0:
        return 0
    return n * factorial(n-1)`,
    correctCode: `def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n-1)`,
    hint: 'Check the base case of the recursion'
  },
  {
    id: 2,
    language: 'cpp',
    description: 'Fix the bug in this bubble sort implementation',
    buggyCode: `void bubbleSort(int arr[], int n) {
    for(int i = 0; i < n; i++) {
        for(int j = 0; j < n; j++) {
            if(arr[j] > arr[j+1]) {
                int temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
            }
        }
    }
}`,
    correctCode: `void bubbleSort(int arr[], int n) {
    for(int i = 0; i < n-1; i++) {
        for(int j = 0; j < n-i-1; j++) {
            if(arr[j] > arr[j+1]) {
                int temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
            }
        }
    }
}`,
    hint: 'Check the inner loop boundary condition'
  },
  {
    id: 3,
    language: 'c',
    description: 'Debug this function to find the second largest element',
    buggyCode: `int findSecondLargest(int arr[], int n) {
    int largest = arr[0];
    int second = arr[0];
    
    for(int i = 0; i < n; i++) {
        if(arr[i] > largest) {
            largest = arr[i];
        }
        else if(arr[i] > second) {
            second = arr[i];
        }
    }
    return second;
}`,
    correctCode: `int findSecondLargest(int arr[], int n) {
    int largest = arr[0];
    int second = arr[0];
    
    for(int i = 0; i < n; i++) {
        if(arr[i] > largest) {
            second = largest;
            largest = arr[i];
        }
        else if(arr[i] > second && arr[i] < largest) {
            second = arr[i];
        }
    }
    return second;
}`,
    hint: 'Think about updating the second largest when finding a new largest'
  }
];