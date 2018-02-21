function formatDate(date) {
    let year = date.substr(6,4);
    let month = date.substr(3,2);
    let day = date.substr(0,2);

    return year + "-" + month +  "-" + day + "T00:00:00Z";
}

module.exports = {
    formatDate: formatDate
}
