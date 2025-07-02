# 排序

> 首发于：2020-08-06

## 冒泡排序（Bubble Sort）

冒泡排序只会操作相邻的两个数据。每次冒泡操作都会对相邻的两个元素进行比较，看是否满足大小关系要求。如果不满足就让它俩互换。一次冒泡会让至少一个元素移动到它应该在的位置，重复 n 次，就完成了 n 个数据的排序工作。此排序算法比较经典，但是效率不高，实战中用得不多。

下图是一个进行一次冒泡排序的示意图：
![](./image/pic1.image)

| 原地排序算法   | 是    |
| -------------- | ----- |
| 空间复杂度     | O(1)  |
| 稳定的排序算法 | 是    |
| 最好时间复杂度 | O(n)  |
| 最坏时间复杂度 | O(n²) |
| 平均时间复杂度 | O(n²) |
| 是否基于比较   | 是    |

```js
/**
 * 冒泡排序
 * @param {array} arr 数组
 */
function BubbleSort(arr) {
    if (arr.length <= 1) return
    for (let i = 0; i < arr.length; i++) {
        let changeFlag = false
        for (let j = 0; j < arr.length - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                const temp = arr[j]
                arr[j] = arr[j + 1]
                arr[j + 1] = temp
                changeFlag = true
            }
        }
        // 没发生数据交互说明已经完成了排序
        if (!changeFlag) break
    }
    // console.log(arr)
}
```

## 插入排序（Insertion Sort）

首先，我们将数组中的数据分为两个区间，已排序区间和未排序区间。初始已排序区间只有一个元素，就是数组的第一个元素。插入算法的核心思想是取未排序区间中的元素，在已排序区间中找到合适的插入位置将其插入，并保证已排序区间数据一直有序。重复这个过程，直到未排序区间中元素为空，算法结束。

此算法比冒泡算法和选择算法都要快一些。有人形象的把这个排序算法比作打扑克摸牌的过程。

下图是一个插入排序的示意图：
![](./image/pic2.image)

| 原地排序算法   | 是    |
| -------------- | ----- |
| 空间复杂度     | O(1)  |
| 稳定的排序算法 | 是    |
| 最好时间复杂度 | O(n)  |
| 最坏时间复杂度 | O(n²) |
| 平均时间复杂度 | O(n²) |
| 是否基于比较   | 是    |

```js
/**
 * 插入排序
 * @param {array} arr 数组
 */
function InsertionSort(arr) {
    if (arr.length <= 1) return
    // 分为有序和无序两个空间，默认有序空间有1个元素arr[0]，所以无序空间从index = 1 的元素开始
    for (let i = 1; i < arr.length; i++) {
        // 取出无序空间中的第一个元素
        let temp = arr[i]
        // 有序空间中最大的 index
        let j = i - 1
        // 查找到插入位置
        for (j; j >= 0; j--) {
            if (arr[j] > temp) {
                // 如果有序空间中的元素比无序空间中取出来的元素大就进行数据移动（可能会有多次移动），腾出空间
                arr[j + 1] = arr[j] // 把有序空间中的数据向后移动一位
            } else {
                // 如果有序空间中的数据比无序空间中的数据小或者相等，就跳出循环
                break
            }
        }
        // 插入数据，经过for循环之后j至少会被减掉1，所以要加回来才是正确的位置
        arr[j + 1] = temp
    }
    // console.log(arr)
}
```


## 希尔排序（Shell Sort）

希尔排序(Shell's Sort)是插入排序的一种又称“缩小增量排序”（Diminishing Increment Sort），是直接插入排序算法的一种更高效的改进版本。希尔排序是非稳定排序算法。该方法因 D.L.Shell 于 1959 年提出而得名。

希尔排序是把记录按下标的一定增量分组，对每组使用直接插入排序算法排序；随着增量逐渐减少，每组包含的关键词越来越多，当增量减至 1 时，整个文件恰被分成一组，算法便终止。

希尔排序对中等大小规模表现良好，对规模非常大的数据排序不是最优选择。希尔算法在最坏的情况下和平均情况下执行效率相差不是很多。希尔排序的时间复杂度在O(nlogn)～O(n²)之间，平均时间复杂度大致是O(n√n)，其时间复杂度与其增量有关系，时间复杂度的证明一直是数学界的一个未解的难题。

| 原地排序算法   | 是       |
| -------------- | -------- |
| 空间复杂度     | O(1)     |
| 稳定的排序算法 | 否       |
| 最好时间复杂度 | O(nlogn) |
| 最坏时间复杂度 | O(n²)    |
| 平均时间复杂度 | O(n√n)   |
| 是否基于比较   | 是       |

```js
/**
 * 希尔排序
 * @param {array} arr 数组
 */
function ShellSort(arr) {
    if (arr.length <= 1) return
    // gap 是步长，每次右移一位，大概就是折半处理，直到步长为1
    for (let gap = arr.length >> 1; gap > 0; gap >>= 1) {
        // 下面是一个插入排序，排序的时候会按照步长gap就行数据选
        for (let i = gap; i < arr.length; i++) {           
            let temp = arr[i]
            let j = i - gap
            for (j; j >= 0 && arr[j] > temp; j -= gap) {
                arr[j + gap] = arr[j]
            }
            arr[j + gap] = temp
        }
    }
    // console.log(arr)
}
```


## 选择排序（Selection Sort）

选择排序算法的实现思路有点类似插入排序，也分已排序区间和未排序区间。但是选择排序每次会从未排序区间中找到最小的元素，将其放到已排序区间的末尾。这个算法比冒泡排序快一些，但是比插入排序慢，实战中用得不多。

下图是一个选择排序的示意图：
![](./image/pic3.image)

| 原地排序算法   | 是    |
| -------------- | ----- |
| 空间复杂度     | O(1)  |
| 稳定的排序算法 | 否    |
| 最好时间复杂度 | O(n²) |
| 最坏时间复杂度 | O(n²) |
| 平均时间复杂度 | O(n²) |
| 是否基于比较   | 是    |

```js
/**
 * 选择排序
 * @param {array} arr 数组
 */
function SelectionSort(arr) {
    if (arr.length <= 1) return
    // arr.length 个元素只需要进行最多 arr.length - 1 次交换就可以排序完成
    // 另外就是内存循环进行了 i + 1，如果外层不减1，就会越界
    for (let i = 0; i < arr.length - 1; i++) {
        let minIndex = i
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIndex]) {
                // 找到未排序的部分中最小的一个元素的index
                minIndex = j
            }
        }
        // 将最小的元素与当前循环到的位置的元素交换位置，这样能保证小的在前面
        const temp = arr[i]
        arr[i] = arr[minIndex]
        arr[minIndex] = temp
    }
    // console.log(arr)
}
```

## 归并排序（Merge Sort）

如果要排序一个数组，我们先把数组从中间分成前后两部分，然后对前后两部分分别排序，再将排好序的两部分合并在一起，这样整个数组就都有序了。

归并排序使用的就是分治思想。分治，顾名思义，就是分而治之，将一个大问题分解成小的子问题来解决。小的子问题解决了，大问题也就解决了。分治算法一般都是用递归来实现的。

在数据量比较大的情况下排序效率非常高。

下图是一个归并排序的示意图：
![](./image/pic4.image)

| 原地排序算法   | 否       |
| -------------- | -------- |
| 空间复杂度     | O(n)     |
| 稳定的排序算法 | 是       |
| 最好时间复杂度 | O(nlogn) |
| 最坏时间复杂度 | O(nlogn) |
| 平均时间复杂度 | O(nlogn) |
| 是否基于比较   | 是       |

```js
/**
 * 归并排序
 * @param {array} arr 数组
 */
function MergeSort(arr) {
    if (arr.length <= 1) return arr
    // 获取数组的中间位置
    const middleNum = Math.floor(arr.length / 2)
    // 分割数组
    const leftArr = arr.slice(0, middleNum) // 左边部分
    const rightArr = arr.slice(middleNum) // 右边部分
    return mergeArr(MergeSort(leftArr), MergeSort(rightArr))

    /**
     * 按顺序合并左右数组
     * @param {array} leftArr 左数组
     * @param {array} rightArr 右数组
     * @returns {array}
     */
    function mergeArr(leftArr, rightArr) {
        // 临时数组用于存储排序后的结果
        let temp = []
        // 左数组index
        let leftIndex = 0
        // 右数组index
        let rightIndex = 0
        // 遍历两个数组中的数据，任意一个遍历完成就停止遍历
        while (leftArr.length > leftIndex && rightArr.length > rightIndex) {
            if (leftArr[leftIndex] <= rightArr[rightIndex]) {
                // 如果左数组的数据小于等于右数组数据，就把左数组的数据先放入临时数据中
                temp.push(leftArr[leftIndex])
                // 左数组index右移一位
                leftIndex++
            } else {
                // 反之，把右数组的数据先放入临时数据中
                temp.push(rightArr[rightIndex])
                // 右数组index右移一位
                rightIndex++
            }
        }
        // 合并左数组或者右数组没有被遍历到的多余数组
        return temp.concat(leftArr.slice(leftIndex)).concat(rightArr.slice(rightIndex))
    }
}
```

## 快速排序（Quick Sort）

如果要排序数组中下标从 p 到 r 之间的一组数据，我们选择 p 到 r 之间的任意一个数据作为 pivot（分区点）。

我们遍历 p 到 r 之间的数据，将小于 pivot 的放到左边，将大于 pivot 的放到右边，将 pivot 放到中间。经过这一步骤之后，数组 p 到 r 之间的数据就被分成了三个部分，前面 p 到 q-1 之间都是小于 pivot 的，中间是 pivot，后面的 q+1 到 r 之间是大于 pivot 的。

![](./image/pic5.image)

根据分治、递归的处理思想，我们可以用递归排序下标从 p 到 q-1 之间的数据和下标从 q+1 到 r 之间的数据，直到区间缩小为 1，就说明所有的数据都有序了。

时间复杂度极端情况下会退化到O(n²)，一般情况下都是O(nlogn)，而且在一般情况下比归并排序还要快一些。

| 原地排序算法   | 是       |
| -------------- | -------- |
| 空间复杂度     | O(1)     |
| 稳定的排序算法 | 否       |
| 最好时间复杂度 | O(nlogn) |
| 最坏时间复杂度 | O(n²)    |
| 平均时间复杂度 | O(nlogn) |
| 是否基于比较   | 是       |

```js
/**
 * 快速排序
 * @param {array} arr 待排序的数组
 * @param {number} leftIndex 最左边index
 * @param {number} rightIndex 最右边index
 */
function QuickSort(arr, leftIndex, rightIndex) {
    if (leftIndex < rightIndex) {
        // 左index比右index小才能往后计算
        // 以最右作为分区点
        let pivot = rightIndex
        // 获取新分区点的index
        let newPivot = partition(arr, pivot, leftIndex, rightIndex)
        QuickSort(arr, leftIndex, newPivot - 1 < leftIndex ? leftIndex : newPivot - 1)
        QuickSort(arr, newPivot + 1 > rightIndex ? rightIndex : newPivot + 1, rightIndex)
    }

    /**
     * 分区函数，获取交换完成之后的新分区点的位置，这就是一个将分区点数据重新排序的一个操作
     * @param {array} arr 待排序的数组
     * @param {number} pivot 分区点 index
     * @param {number} leftIndex 最左边index
     * @param {number} rightIndex 最右边index
     * @returns {number} 新分区点的index
     */
    function partition(arr, pivot, leftIndex, rightIndex) {
        // 分区点数据
        const pivotVal = arr[pivot]
        // 开始的index为最左index
        let startIndex = leftIndex
        for (let i = startIndex; i < rightIndex; i++) {
            if (arr[i] < pivotVal) {
                // 比分区点数据小
                // 记录当前位置数据
                const temp = arr[i]
                // 把起始点位置数据与当前这个点数据进行位置交换
                arr[i] = arr[startIndex]
                arr[startIndex] = temp
                // 起始点被使用之后index加1，指向新的起始点
                startIndex++
            }
        }
        // 将分区点位置的数据与当前开始点位置的数据进行交换
        const temp = arr[startIndex]
        arr[startIndex] = arr[pivot]
        arr[pivot] = temp
        // 返回开始点，作为新的分区点
        return startIndex
    }
}
```


## 桶排序（Bucket sort）

核心思想是将要排序的数据分到几个有序的桶里，每个桶里的数据再单独进行排序。桶内排完序之后，再把每个桶里的数据按照顺序依次取出，组成的序列就是有序的了。

![](./image/pic6.image)

如果要排序的数据有 n 个，我们把它们均匀地划分到 m 个桶内，每个桶里就有 k=n/m 个元素。每个桶内部使用快速排序，时间复杂度为 O(k * logk)。m 个桶排序的时间复杂度就是 O(m * k * logk)，因为 k=n/m，所以整个桶排序的时间复杂度就是 O(n*log(n/m))。当桶的个数 m 接近数据个数 n 时，log(n/m) 就是一个非常小的常量，这个时候桶排序的时间复杂度接近 O(n)。

桶排序的使用条件：实际上，桶排序对要排序数据的要求是非常苛刻的。首先，要排序的数据需要很容易就能划分成 m 个桶，并且，桶与桶之间有着天然的大小顺序。这样每个桶内的数据都排序完之后，桶与桶之间的数据不需要再进行排序。其次，数据在各个桶之间的分布是比较均匀的。如果数据经过桶的划分之后，有些桶里的数据非常多，有些非常少，很不平均，那桶内数据排序的时间复杂度就不是常量级了。在极端情况下，如果数据都被划分到一个桶里，那就退化为 O(nlogn) 的排序算法了。桶排序比较适合用在外部排序中。所谓的外部排序就是数据存储在外部磁盘中，数据量比较大，内存有限，无法将数据全部加载到内存中。

| 原地排序算法   | 否   |
| -------------- | ---- |
| 空间复杂度     | O(n) |
| 稳定的排序算法 | 是   |
| 最好时间复杂度 | O(n) |
| 最坏时间复杂度 | O(n) |
| 平均时间复杂度 | O(n) |
| 是否基于比较   | 否   |

```js
/**
 * 桶排序
 * 将数组中的数据，按桶进行划分，将相邻的数据划分在同一个桶中
 * 每个桶用插入排序算法（或者快速排序）进行排序
 * 最后整合每个桶中的数据
 * @param {array} arr 待排序数组 
 * @param {number} bucketSize 桶的大小，代表桶能装多少种数据，默认5
 * @returns {array} 排序好的数组
 */
function BucketSort(arr, bucketSize = 5) {
    if (arr.length < 2) {
        return arr
    }
    // 创建桶数组
    const buckets = createBuckets(arr, bucketSize)
    return sortBuckets(buckets)

    /**
     * 创建桶数组
     * @param {array} arr 待创建桶数组
     * @param {number} bucketSize 桶大小
     * @returns {array} 桶数组，一个二维数组
     */
    function createBuckets(arr, bucketSize) {
        // 最小值，默认数组第零个
        let minValue = arr[0]
        // 最大值，默认数组第零个
        let maxValue = arr[0]
        // 遍历数组，找到数组最小值与数组最大值
        for (let i = 1; i < arr.length; i++) {
            if (arr[i] < minValue) {
                minValue = arr[i]
            } else if (arr[i] > maxValue) {
                maxValue = arr[i]
            }
        }
        // 根据最小值、最大值、桶的大小，计算得到桶的个数
        const bucketCount = Math.floor((maxValue - minValue) / bucketSize) + 1
        // 建立一个二维数组，将桶放入buckets中
        const buckets = []
        for (let i = 0; i < bucketCount; i++) {
            buckets[i] = []
        }
        // 计算每一个值应该放在哪一个桶中
        for (let i = 0; i < arr.length; i++) {
            // 获取该数据所在桶的index
            const bucketIndex = Math.floor((arr[i] - minValue) / bucketSize)
            buckets[bucketIndex].push(arr[i])
        }
        return buckets
    }

    /**
     * 对每个桶进行排序
     * @param {array} buckets 二维数组
     * @returns {array} 排序好的二维数组
     */
    function sortBuckets(buckets) {
        const sortedArray = []
        for (let i = 0; i < buckets.length; i++) {
            if (buckets[i] != null) {
                InsertionSort(buckets[i]) // 也可以是快速排序，根据实际情况进行调整
                sortedArray.push(...buckets[i])
            }
        }
        return sortedArray
    }
}

// 下面是测试用
function createRandomArr2() {
    // 为桶排序生成数据，数据量大，但是数值范围不大
    const Arr = []
    const ArrEleNum = 1000000
    for (let j = 0; j < ArrEleNum; j++) {
        Arr.push(parseInt(Math.random() * 10000)) // 最多一万种数据，会被默认分成10000/5=2000个桶，每个桶500个数据，2000次插排
    }
    return Arr
    // 桶排序的时候一定要分好桶大小，这样才能保证每个桶的数据量，也就是一次插排的数据量，否则可能会非常慢
}

const BucketSortArr = createRandomArr2()
console.time('BucketSort')
BucketSort(BucketSortArr)
console.timeEnd('BucketSort')
```


## 计数排序（Counting sort）

计数排序可以理解为桶排序的一种特殊情况。当要排序的 n 个数据，所处的范围并不大的时候，比如最大值是 k，我们就可以把数据划分成 k 个桶。每个桶内的数据值都是相同的，省掉了桶内排序的时间。

高考的一个例子。考生的满分是 900 分，最小是 0 分，这个数据的范围很小，所以我们可以分成 901 个桶，对应分数从 0 分到 900 分。根据考生的成绩，我们将这 50 万考生划分到这 901 个桶里。桶内的数据都是分数相同的考生，所以并不需要再进行排序。我们只需要依次扫描每个桶，将桶内的考生依次输出到一个数组中，就实现了 50 万考生的排序。因为只涉及扫描遍历操作，所以时间复杂度是 O(n)。

计数排序的算法思想就是这么简单，跟桶排序非常类似，只是桶的大小粒度不一样。

计数排序的过程的一个举个例子：

假设只有 8 个考生，分数在 0 到 5 分之间。这 8 个考生的成绩我们放在一个数组 A[8]中，它们分别是：2，5，3，0，2，3，0，3

A[8] = [2, 5, 3, 0, 2, 3, 0, 3]

考生的成绩从 0 到 5 分，我们使用大小为 6 的数组 C[6]表示桶，其中下标对应分数。不过，C[6]内存储的并不是考生，而是对应的考生个数.

C[6] = [2, 0, 2, 3, 0, 1]

我们对 C[6]数组顺序求和，C[6]存储的数据就变成了下面这样子。C[k]里存储小于等于分数 k 的考生个数。

C[6] = [2, 2, 4, 7, 7, 8]

我们从后到前依次扫描数组 A。比如，当扫描到 3 时，我们可以从数组 C 中取出下标为 3 的值 7，也就是说，到目前为止，包括自己在内，分数小于等于 3 的考生有 7 个，也就是说 3 是数组 R 中的第 7 个元素（也就是数组 R 中下标为 6 的位置）。当 3 放入到数组 R 中后，小于等于 3 的元素就只剩下了 6 个了，所以相应的 C[3]要减 1，变成 6。以此类推，当我们扫描到第 2 个分数为 3 的考生的时候，就会把它放入数组 R 中的第 6 个元素的位置（也就是下标为 5 的位置）。当我们扫描完整个数组 A 后，数组 R 内的数据就是按照分数从小到大有序排列的了。

![](./image/pic7.image)

可以推算出一个从小到大的序列R[8] = [0, 0, 2, 2, 3, 3, 3, 5]。

计数排序只能用在数据范围不大的场景中，如果数据范围 k 比要排序的数据 n 大很多，就不适合用计数排序了。而且，计数排序只能给非负整数排序，如果要排序的数据是其他类型的，要将其在不改变相对大小的情况下，转化为非负整数。

| 原地排序算法   | 否                 |
| -------------- | ------------------ |
| 空间复杂度     | O(n)               |
| 稳定的排序算法 | 是                 |
| 最好时间复杂度 | O(n+k) k是数据范围 |
| 最坏时间复杂度 | O(n+k) k是数据范围 |
| 平均时间复杂度 | O(n+k) k是数据范围 |
| 是否基于比较   | 否                 |

```js
/**
 * 计数排序
 * @param {array} arr 待排序数组
 * @returns {array} 排序好的数组
 */
function CountingSort(arr) {
    if (arr.length <= 1) return

    // 查找最大数
    let max = 0
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i]
        }
    }

    // 用于计数的数组
    // counts下标是元素，值是元素个数
    const counts = []
    for (let i = 0; i <= max; i++) {
        counts[i] = 0
    }
   
    // 生成 counts 里面的值，对每一个元素进行计数
    arr.forEach(val => {
        counts[val]++
    })

    // 将 counts 中的元素进行求和累加操作
    counts.forEach((val, index) => {
        if (index > 0) {
            counts[index] = counts[index] + counts[index - 1]
        }     
    })

    // 生成最后结果
    const r = []
    for (let i = arr.length - 1; i >= 0; i--) {
        // 数据在 r 数组中的 index
        let index = counts[arr[i]] - 1
        r[index] = arr[i]
        counts[arr[i]]--
    }

    // 将结果拷贝给 arr 数组
    for (let i = 0; i < arr.length; i++) {
        arr[i] = r[i]
    }
    // console.log(arr)
}

// 下面是测试用
function createRandomArr3() {
    // 为计数排序生成数据，数据量大，但是数值范围不大
    const Arr = []
    const ArrEleNum = 1000000
    for (let j = 0; j < ArrEleNum; j++) {
        Arr.push(parseInt(Math.random() * 100)) // 数据范围过大就不适用了
    }
    return Arr
}

const CountingSortArr = createRandomArr3()
console.time('CountingSort')
CountingSort(CountingSortArr)
console.timeEnd('CountingSort')
```

## 基数排序（Radix sort）

基数排序对要排序的数据是有要求的，需要可以分割出独立的“位”来比较，而且位之间有递进的关系，如果 a 数据的高位比 b 数据大，那剩下的低位就不用比较了。除此之外，每一位的数据范围不能太大，要可以用线性排序算法来排序，否则，基数排序的时间复杂度就无法做到 O(n) 了。

| 原地排序算法   | 否                 |
| -------------- | ------------------ |
| 空间复杂度     | O(n)               |
| 稳定的排序算法 | 是                 |
| 最好时间复杂度 | O(k*n) k是数据位数 |
| 最坏时间复杂度 | O(k*n) k是数据位数 |
| 平均时间复杂度 | O(k*n) k是数据位数 |
| 是否基于比较   | 否                 |

```js
/**
 * 基数排序
 * @param {array} arr 待排序数组
 * @param {number} n 数据长度
 */
function RadixSort(arr, n) {
    // 以排序手机号为例，假设输入的数组是一个11位手机号，长度比较长的一个数组
    if (arr.length <= 1) return

    for (let k = n - 1; k >= 0; k--) {
        // 下面是计数排序
        // 查找最大数
        let max = 0
        for (let i = 0; i < arr.length; i++) {
            if (arr[i][k] > max) {
                max = arr[i][k]
            }
        }

        // 用于计数的数组
        // counts下标是元素，值是元素个数
        const counts = []
        for (let i = 0; i <= max; i++) {
            counts[i] = 0
        }
    
        // 生成 counts 里面的值，对每一个元素进行计数
        arr.forEach(val => {
            counts[val[k]]++
        })

        // 将 counts 中的元素进行求和累加操作
        counts.forEach((val, index) => {
            if (index > 0) {
                counts[index] = counts[index] + counts[index - 1]
            }     
        })

        // 生成最后结果
        const r = []
        for (let i = arr.length - 1; i >= 0; i--) {
            // 数据在 r 数组中的 index
            let index = counts[arr[i][k]] - 1
            r[index] = arr[i]
            counts[arr[i][k]]--
        }

        // 将结果拷贝给 arr 数组
        for (let i = 0; i < arr.length; i++) {
            arr[i] = r[i]
        }
    }
    
    // console.log(arr)
}

// 下面是测试用
function createRandomArr4() {
    // 为基数排序生成数据，11位的数字号码
    const Arr = []
    const ArrEleNum = 1000000
    for (let j = 0; j < ArrEleNum; j++) {
        Arr.push(String(parseInt(Math.random() * 10 ** 10) + '00000000000').slice(0, 11))
    }
    return Arr
}

const RadixSortArr = createRandomArr4()
console.time('RadixSort')
RadixSort(RadixSortArr, 11)
console.timeEnd('RadixSort')
```
