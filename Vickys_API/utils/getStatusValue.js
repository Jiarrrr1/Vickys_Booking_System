const getStatusValue = async (rate) => {
    try {
        if (rate >= 4) {
        return 'Positive'
    } if (rate === 3){
        return 'Nuetral'
    } if (rate <= 2){
        return 'Negative'
    }
    } catch {

    }
}

  module.exports = getStatusValue;
