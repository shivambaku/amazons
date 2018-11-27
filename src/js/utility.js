export default class Utility {

    static getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static maxByProperty(array, property_func) {
        let max = property_func(array[0]);
        let max_index = 0;
        for (let i = 0; i < array.length; ++i) {
            if (property_func(array[i]) > max) {
                max = array[i];
                max_index = i;
            }
        }
        return array[max_index];
    }

    static minByProperty(array, property_func) {
        let min = property_func(array[0]);
        let min_index = 0;
        for (let i = 0; i < array.length; ++i) {
            if (property_func(array[i]) < min) {
                min = array[i];
                min_index = i;
            }
        }
        return array[min_index];
    }

    static shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}