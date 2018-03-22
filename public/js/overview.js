var users = ['Andreas Heumaier', 'Bart Jansen', 'Campbell Vertesi', 'Carlos Sardo', 'Claus M', 'Florian Mader', 'Manu Rink', 'Sascha Corti'];

$(document).ready(function () {
    let authToken = localStorage.getItem('authToken');

    if(!authToken) {
        window.location.href = './index.html';
    }
 
    console.log('got authentication token', authToken);

    $.post('/overview/byUser/', {
        authToken: authToken,
        user: 'Campbell Vertesi',
        users: users
    }).done((res) => {
        var chartData = [];

        res.rows.forEach(function(data, index) {
            let date = data[8] || data[10];
            let dateObj = new Date(parseInt(date.substr(6, 13)));

            chartData.push({
                id: 'participant_' + index, 
                text: data[7],
                start_date: dateObj,
                duration: data[9] || data[11],
                order: 10,
                progress: 1,
                parent: data[6].split(' <')[0]
            });
        });

        // sort chronologically 
        chartData.sort(function (a, b) {
            return a.start_date - b.start_date;
        });

        console.log(chartData);

        var tasks = {
            data: []
        };

        users.forEach(function(user) {
            tasks.data.push({
                id: user, text: user, start_date: chartData[0].start_date, duration: 30, order: 10,
                progress: 1, open: true
            })
        });
              
        chartData.forEach(data => { tasks.data.push(data) });

        gantt.init("chart_div");
        gantt.parse(tasks);

    });
});
